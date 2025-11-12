import { createTool } from "@mastra/core";
import { z } from "zod";
import { askRag, summarizeDocument } from "../rag.js";

// Tool: Answer questions using RAG
export const askRagTool = createTool({
  id: "ask_rag",
  description: "MANDATORY: Use this tool to answer ANY question about document content. This tool searches the vector database for relevant document chunks and generates an answer based on the retrieved content. You MUST use this tool whenever a user asks a question about documents, instead of trying to answer directly.",
  inputSchema: z.object({
    query: z.string().describe("The user's question about the document content. Pass the exact question the user asked."),
  }),
  outputSchema: z.object({
    answer: z.string().describe("AI-generated answer"),
  }),
  execute: async ({ context }) => {
    const { query } = context;
    // askRag 返回流式对象，这里需要处理流式响应
    // 为了工具化，我们需要将流式转换为完整文本
    const stream = await askRag(query);
    
    let fullText = "";
    for await (const chunk of stream.textStream) {
      fullText += chunk;
    }
    
    return {
      answer: fullText,
    };
  },
});

// Tool: Summarize the most recently uploaded document
export const summarizeDocumentTool = createTool({
  id: "summarize_document",
  description: "MANDATORY: Use this tool to generate a summary of the most recently uploaded document. This tool retrieves relevant document chunks and creates a structured summary. You MUST use this tool when users request document summaries or ask about the main content of a document.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    summary: z.string().describe("Detailed structured summary of the document including main content, key points, and important conclusions"),
  }),
  execute: async () => {
    const summary = await summarizeDocument();
    return {
      summary,
    };
  },
});

