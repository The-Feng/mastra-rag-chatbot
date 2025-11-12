// Workflow executor: Simplifies workflow usage in API routes
// This file encapsulates workflow execution logic, making it easier to use in API routes
import { ingestFile, askRag, summarizeDocument } from "./rag.js";
import { ragAgent } from "./agents/rag-agent.js";
import { getPool } from "./db.js";

// 可選：雲端存儲（僅支持 Cloudflare R2）
let uploadToCloud: ((buffer: Buffer, fileName: string, fileType: string) => Promise<{ key: string; url?: string }>) | null = null;

// 初始化雲端存儲（僅在 Cloudflare Workers 環境中，通過 env.FILES 綁定 R2）
// 注意：這需要在 worker.ts 中通過 env 參數傳遞 R2 綁定

// Execute upload and summarize workflow
export async function executeIngestAndSummarize(params: {
  fileBuffer: Buffer;
  fileName: string;
  fileType: string;
  saveToCloud?: boolean; // 是否保存到雲端
}) {
  let cloudKey: string | undefined;
  let cloudUrl: string | undefined;

  // Step 1: 可選 - 上傳原始文件到雲端存儲
  if (params.saveToCloud && uploadToCloud) {
    try {
      const result = await uploadToCloud(
        params.fileBuffer,
        params.fileName,
        params.fileType
      );
      cloudKey = result.key;
      cloudUrl = result.url;
      console.log(`📤 File saved to cloud storage: ${cloudKey}`);
    } catch (error) {
      console.warn("⚠️ Failed to upload to cloud storage:", error);
      // 繼續處理，即使雲端上傳失敗
    }
  }

  // Step 2: Import document to vector database
  const ingestResult = await ingestFile(
    params.fileBuffer,
    params.fileName,
    params.fileType
  );

  // Step 3: 在數據庫中記錄雲端文件引用（如果上傳成功）
  if (cloudKey) {
    try {
      const pool = getPool();
      const uploadTimestamp = Date.now().toString();
      await pool.query(
        `UPDATE docs 
         SET metadata = jsonb_set(
           COALESCE(metadata, '{}'::jsonb), 
           '{cloudStorage}', 
           $1::jsonb
         )
         WHERE metadata->>'uploadedAt' = $2`,
        [
          JSON.stringify({
            key: cloudKey,
            url: cloudUrl,
            provider: 'r2',
          }),
          uploadTimestamp,
        ]
      );
    } catch (error) {
      console.warn("⚠️ Failed to update metadata with cloud storage info:", error);
    }
  }

  // Step 4: Generate summary (异步执行，不阻塞响应)
  console.log(`📝 开始生成文档总结...`);
  const summaryStartTime = Date.now();
  
  // 优化：总结生成可以异步执行，但这里保持同步以确保返回完整结果
  const summary = await summarizeDocument();
  
  const summaryTime = Date.now() - summaryStartTime;
  console.log(`✅ 文档总结完成 (耗时 ${summaryTime}ms)`);

  return {
    count: ingestResult.count,
    summary: summary,
    message: `成功导入 ${ingestResult.count} 个文档片段`,
    cloudStorage: cloudKey ? { key: cloudKey, url: cloudUrl } : undefined,
  };
}

// Execute chat workflow (returns streaming response)
export async function executeChatWorkflow(query: string) {
  // Directly call askRag to get streaming response
  const stream = await askRag(query);
  return stream;
}

// Execute chat using agent directly (non-streaming, with tool support)
export async function executeChatWithAgent(query: string) {
  const result = await ragAgent.generate(query);
  return result.text;
}

// Execute image analysis
export async function executeImageAnalysis(params: {
  imageBuffer: Buffer;
  imageName: string;
  imageType: string;
  saveToCloud?: boolean; // 是否保存到雲端
}) {
  let cloudKey: string | undefined;
  let cloudUrl: string | undefined;

  // 可選 - 上傳圖片到雲端存儲
  if (params.saveToCloud && uploadToCloud) {
    try {
      const result = await uploadToCloud(
        params.imageBuffer,
        params.imageName,
        params.imageType
      );
      cloudKey = result.key;
      cloudUrl = result.url;
      console.log(`📤 Image saved to cloud storage: ${cloudKey}`);
    } catch (error) {
      console.warn("⚠️ Failed to upload image to cloud storage:", error);
    }
  }

  // Import analyzeImage function
  const { analyzeImage } = await import("./image.js");
  const description = await analyzeImage(
    params.imageBuffer,
    params.imageName,
    params.imageType
  );
  
  return {
    description,
    success: true,
    cloudStorage: cloudKey ? { key: cloudKey, url: cloudUrl } : undefined,
  };
}

