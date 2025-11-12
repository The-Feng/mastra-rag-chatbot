import { MDocument } from "@mastra/rag";
import { embedMany, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getPool } from "./db.js";
import { ensureVectorDB } from "./db.js";
import mammoth from "mammoth";
import { writeFile, unlink, access } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Import document to vector database
export async function ingestText(text: string, source = "upload") {
  await ensureVectorDB();
  const doc = MDocument.fromText(text);
  const chunks = await doc.chunk({ strategy: "recursive", maxSize: 512, overlap: 50 });

  console.log(`📦 文档已分块: ${chunks.length} 个片段`);

  const pool = getPool();

  // 优化：增加批次大小以提高效率（OpenAI API 支持最多 2048 个文本）
  const batchSize = 1000;
  let totalProcessed = 0;
  const uploadTimestamp = Date.now();

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchTexts = batch.map(c => c.text);

    console.log(`🔄 正在生成向量嵌入 (${i + 1}-${Math.min(i + batchSize, chunks.length)}/${chunks.length})...`);
    const embedStartTime = Date.now();
    
    const { embeddings } = await embedMany({
      values: batchTexts,
      model: openai.embedding("text-embedding-3-small"),
    });

    const embedTime = Date.now() - embedStartTime;
    console.log(`✅ 向量嵌入完成 (${batch.length} 个, 耗时 ${embedTime}ms)`);

    // 优化：增加插入批次大小，减少数据库往返次数
    const insertBatchSize = 500; // 从 200 增加到 500
    console.log(`💾 正在插入数据库...`);
    const insertStartTime = Date.now();
    
    for (let batchStart = 0; batchStart < batch.length; batchStart += insertBatchSize) {
      const insertBatch = batch.slice(batchStart, batchStart + insertBatchSize);
      const values: any[] = [];
      const placeholders: string[] = [];
      let paramIndex = 1;
      
      for (let j = 0; j < insertBatch.length; j++) {
        const chunkIndex = i + batchStart + j;
        // 使用时间戳 + 文件名 + chunkIndex 确保唯一性
        const id = `${uploadTimestamp}-${source}-${chunkIndex}`;
        const vector = `[${embeddings[batchStart + j].join(",")}]`;
        const metadata = JSON.stringify({ source, uploadedAt: uploadTimestamp });
        
        placeholders.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, CURRENT_TIMESTAMP)`);
        values.push(id, insertBatch[j].text, vector, metadata);
        paramIndex += 4;
      }
      
      // 批量插入，提高性能（使用连接池）
      await pool.query(
        `INSERT INTO docs(id, text, vector, metadata, created_at) VALUES ${placeholders.join(", ")}
         ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, vector = EXCLUDED.vector, metadata = EXCLUDED.metadata, created_at = CURRENT_TIMESTAMP`,
        values
      );
    }

    const insertTime = Date.now() - insertStartTime;
    console.log(`✅ 数据库插入完成 (${batch.length} 条, 耗时 ${insertTime}ms)`);

    totalProcessed += batch.length;
  }

  console.log(`🎉 文档导入完成: 共 ${totalProcessed} 个片段`);
  return { count: totalProcessed };
}

// 处理文件上传（支持多种格式）
export async function ingestFile(buffer: Buffer, fileName: string, mimeType: string) {
  let text = "";

  // 根据文件类型提取文本
  if (mimeType.includes("pdf") || fileName.endsWith(".pdf")) {
    try {
      // 使用動態導入 pdf-parse（ES modules 兼容）
      const pdfParse = await import("pdf-parse");
      const pdfParseDefault = pdfParse.default || pdfParse;
      
      // pdf-parse 返回一個 Promise，直接傳入 buffer
      const pdfData = await pdfParseDefault(buffer);
      text = pdfData.text || "";
      
      if (!text || text.trim().length === 0) {
        throw new Error("No text content extracted from PDF file");
      }
      
      console.log(`PDF parsing successful, extracted ${text.length} characters`);
    } catch (error) {
      console.error("PDF parsing error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("PDF parsing detailed error:", {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        bufferLength: buffer.length,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      throw new Error(`PDF parsing failed: ${errorMessage}`);
    }
  } else if (
    mimeType.includes("wordprocessingml") || 
    fileName.endsWith(".docx")
  ) {
    // mammoth 只支持 .docx 格式（基于 ZIP），不支持旧的 .doc 格式
    try {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      
      if (!text || text.trim().length === 0) {
        throw new Error("No text content extracted from Word document");
      }
    } catch (error) {
      console.error("Word parsing error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      if (errorMsg.includes("zip file") || errorMsg.includes("central directory")) {
        throw new Error("Word document format error. Please ensure you upload .docx format (Word 2007+), old .doc format is not supported.");
      }
      throw new Error(`Word document parsing failed: ${errorMsg}`);
    }
  } else if (
    mimeType.includes("msword") || 
    fileName.endsWith(".doc")
  ) {
    // 使用 antiword 直接处理旧的 .doc 格式（Word 97-2003）
    try {
      console.log("开始处理 .doc 文件...");
      
      // 将 buffer 写入临时文件
      const tempFilePath = join(tmpdir(), `doc-${Date.now()}-${Math.random().toString(36).substring(7)}.doc`);
      await writeFile(tempFilePath, buffer);
      console.log("临时文件已写入:", tempFilePath);
      
      try {
        // 尝试多个可能的 antiword 路径
        const possiblePaths = [
          "/opt/homebrew/bin/antiword",  // macOS Homebrew (Apple Silicon)
          "/usr/local/bin/antiword",     // macOS Homebrew (Intel) 或 Linux
          "/usr/bin/antiword",           // Linux 系统路径
          "antiword"                     // 如果在 PATH 中
        ];
        
        let antiwordPath = "";
        
        // 尝试找到可用的 antiword
        for (const path of possiblePaths) {
          try {
            if (path === "antiword") {
              // 直接使用命令名称，依赖 PATH
              await execAsync(`which ${path}`);
              antiwordPath = path;
              break;
            } else {
              // 检查文件是否存在
              try {
                await access(path);
                antiwordPath = path;
                break;
              } catch {
                continue;
              }
            }
          } catch {
            continue;
          }
        }
        
        if (!antiwordPath) {
          throw new Error(`Cannot find antiword. Please ensure it is installed:\nmacOS: brew install antiword\nLinux: sudo apt-get install antiword or sudo yum install antiword`);
        }
        
        console.log("Using antiword path:", antiwordPath);
        
        // 设置环境变量，确保可以找到 antiword
        const env = {
          ...process.env,
          PATH: process.env.PATH || "",
        };
        
        // 如果使用完整路徑，確保 PATH 包含其目錄
        if (antiwordPath !== "antiword") {
          const antiwordDir = join(antiwordPath, "..");
          env.PATH = `${antiwordDir}:${env.PATH}`;
        }
        
        // 执行 antiword 命令提取文本
        console.log("开始执行 antiword...");
        const { stdout, stderr } = await execAsync(
          `"${antiwordPath}" "${tempFilePath}"`,
          { 
            env,
            maxBuffer: 10 * 1024 * 1024, // 10MB 缓冲区
            timeout: 30000 // 30 秒超时
          }
        );
        
        // 清理临时文件
        try {
          await unlink(tempFilePath);
          console.log("临时文件已清理");
        } catch (unlinkError) {
          console.error("清理临时文件失败:", unlinkError);
        }
        
        if (stderr && !stderr.includes("antiword")) {
          console.warn("antiword 警告:", stderr);
        }
        
        text = stdout || "";
        
        if (!text || text.trim().length === 0) {
          throw new Error("No text content extracted from .doc file");
        }
        
        console.log(`Successfully extracted text, length: ${text.length} characters`);
      } catch (execError: any) {
        // Clean up temporary file
        try {
          await unlink(tempFilePath);
        } catch {
          // Ignore cleanup errors
        }
        
        const errorMsg = execError?.message || "Unknown error";
        if (errorMsg.includes("ENOENT") || errorMsg.includes("not found") || errorMsg.includes("無法找到")) {
          throw new Error(`Cannot find antiword command. Please install:\nmacOS: brew install antiword\nLinux (Debian/Ubuntu): sudo apt-get install antiword\nLinux (CentOS/RHEL): sudo yum install antiword`);
        }
        if (errorMsg.includes("timeout")) {
          throw new Error(`.doc file processing timeout. File may be too large or corrupted.`);
        }
        throw new Error(`.doc file parsing failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error("DOC parsing error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`.doc file parsing failed: ${errorMsg}`);
    }
  } else {
    // 纯文本文件
    text = buffer.toString("utf-8");
  }

  if (!text || text.trim().length === 0) {
    throw new Error("Unable to extract text content from file. File may be empty or format is not supported");
  }

  return await ingestText(text, fileName);
}

// RAG 检索 + 生成
export async function askRag(query: string) {
  const { embeddings: [queryEmbedding] } = await embedMany({
    values: [query],
    model: openai.embedding("text-embedding-3-small"),
  });

  const pool = getPool();

  // 检索策略：只检索最新上传的文档
  // 使用索引优化的查询，直接检索最新文档
  const queryVector = `[${queryEmbedding.join(",")}]`;
  
  // 优化：直接查询最新上传的文档（使用索引）
  const latestDocResult = await pool.query(
    `SELECT metadata->>'uploadedAt' as latest_timestamp
     FROM docs
     WHERE metadata->>'uploadedAt' IS NOT NULL
     ORDER BY (metadata->>'uploadedAt')::bigint DESC
     LIMIT 1`
  );
  
  const latestTimestamp = latestDocResult.rows[0]?.latest_timestamp;
  
  let rows;
  
  if (latestTimestamp) {
    // 只检索最新上传的文档（使用时间戳精确匹配，利用索引）
    const result = await pool.query(
      `SELECT text, created_at, metadata
       FROM docs
       WHERE metadata->>'uploadedAt' = $1
       ORDER BY vector <#> $2::vector ASC
       LIMIT 3`,
      [latestTimestamp, queryVector]
    );
    rows = result.rows;
    
    console.log(`从时间戳 ${latestTimestamp} 匹配的文档中找到 ${rows.length} 个片段`);
  } else {
    // 如果没有时间戳，使用时间范围（最近 1 小时）
    console.log(`没有找到时间戳，使用时间范围检索（最近 1 小时）...`);
    const result = await pool.query(
      `SELECT text, created_at, metadata
       FROM docs
       WHERE created_at >= NOW() - INTERVAL '1 hour'
       ORDER BY vector <#> $1::vector ASC
       LIMIT 3`,
      [queryVector]
    );
    rows = result.rows;
  }
  
  console.log(`检索到 ${rows.length} 个相关文档片段`);

  const context = rows.map(r => r.text).join("\n---\n");
  // Use prompt template for RAG Q&A
  const { ragQAPrompt } = await import("./prompts/rag-prompts.js");
  const prompt = ragQAPrompt.template(context, query);
  console.log(`📝 Using prompt: ${ragQAPrompt.id}`);

  // Return streaming response
  return streamText({
    model: openai("gpt-4o-mini"),
    prompt,
  });
}

// Generate document summary (non-streaming, returns complete text)
export async function summarizeDocument(): Promise<string> {
  const query = "Please summarize the main content of this document, including key points, important information, and key conclusions.";
  
  console.log(`🔍 正在生成查询向量...`);
  const { embeddings: [queryEmbedding] } = await embedMany({
    values: [query],
    model: openai.embedding("text-embedding-3-small"),
  });

  const pool = getPool();

  // 检索策略：只检索最新上传的文档
  // 优化：减少检索片段数量（从10个减少到5个），提高查询速度
  const queryVector = `[${queryEmbedding.join(",")}]`;
  
  // 找出最新上传的文档时间戳（使用索引优化）
  const latestDocResult = await pool.query(
    `SELECT metadata->>'uploadedAt' as latest_timestamp
     FROM docs
     WHERE metadata->>'uploadedAt' IS NOT NULL
     ORDER BY (metadata->>'uploadedAt')::bigint DESC
     LIMIT 1`
  );
  
  const latestTimestamp = latestDocResult.rows[0]?.latest_timestamp;
  
  let rows;
  
  if (latestTimestamp) {
    // 只检索最新上传的文档（使用时间戳精确匹配，利用索引）
    // 优化：减少到5个片段，足够生成总结
    const result = await pool.query(
      `SELECT text, created_at, metadata
       FROM docs
       WHERE metadata->>'uploadedAt' = $1
       ORDER BY vector <#> $2::vector ASC
       LIMIT 5`,
      [latestTimestamp, queryVector]
    );
    rows = result.rows;
    
    console.log(`总结：从时间戳 ${latestTimestamp} 匹配的文档中找到 ${rows.length} 个片段`);
  } else {
    // 如果没有时间戳，使用时间范围（最近 1 小时）
    console.log(`总结：没有找到时间戳，使用时间范围检索（最近 1 小时）...`);
    const result = await pool.query(
      `SELECT text, created_at, metadata
       FROM docs
       WHERE created_at >= NOW() - INTERVAL '1 hour'
       ORDER BY vector <#> $1::vector ASC
       LIMIT 5`,
      [queryVector]
    );
    rows = result.rows;
  }
  
  console.log(`总结：检索到 ${rows.length} 个相关文档片段`);

  if (rows.length === 0) {
    return "Unable to find document content for summarization.";
  }

  const context = rows.map(r => r.text).join("\n---\n");
  // Use prompt template for document summarization
  const { documentSummaryPrompt } = await import("./prompts/rag-prompts.js");
  const prompt = documentSummaryPrompt.template(context);
  console.log(`📝 Using prompt: ${documentSummaryPrompt.id}`);

  // Non-streaming generation, get complete text
  console.log(`🤖 正在生成总结...`);
  const stream = streamText({
    model: openai("gpt-4o-mini"),
    prompt,
  });
  
  let fullText = "";
  for await (const chunk of stream.textStream) {
    fullText += chunk;
  }

  return fullText;
}

