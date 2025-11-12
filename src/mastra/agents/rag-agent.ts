import { Agent } from "@mastra/core/agent";
import { askRagTool, summarizeDocumentTool } from "../tools/rag-tools.js";
import { ingestDocumentTool, ingestTextTool } from "../tools/document-tools.js";
import { analyzeImageTool } from "../tools/image-tools.js";
import { openai } from "@ai-sdk/openai";
import { agentInstructionsPrompt } from "../prompts/rag-prompts.js";

// RAG Agent: Handles document Q&A, summarization, and image analysis
export const ragAgent = new Agent({
  name: "RAG Agent",
  instructions: agentInstructionsPrompt.template,
  model: openai("gpt-4o-mini"),
  tools: {
    ask_rag: askRagTool,
    summarize_document: summarizeDocumentTool,
    ingest_document: ingestDocumentTool,
    ingest_text: ingestTextTool, // 添加文本輸入工具，用於 Playground
    analyze_image: analyzeImageTool,
  },
});

