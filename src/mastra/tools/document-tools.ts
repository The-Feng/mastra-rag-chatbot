import { createTool } from "@mastra/core";
import { z } from "zod";
import { ingestFile, ingestText } from "../rag.js";

// Tool: Extract file text and import to vector database
export const ingestDocumentTool = createTool({
  id: "ingest_document",
  description: "Extract document text content and import it into the vector database for indexing",
  inputSchema: z.object({
    fileBuffer: z.instanceof(Buffer),
    fileName: z.string(),
    fileType: z.string(),
  }),
  outputSchema: z.object({
    count: z.number(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const { fileBuffer, fileName, fileType } = context;
    const result = await ingestFile(fileBuffer, fileName, fileType);
    return {
      count: result.count,
      message: `Successfully imported ${result.count} document chunks`,
    };
  },
});

// Tool: Import plain text to vector database
export const ingestTextTool = createTool({
  id: "ingest_text",
  description: "Import plain text content into the vector database for indexing",
  inputSchema: z.object({
    text: z.string(),
    source: z.string().optional().default("upload"),
  }),
  outputSchema: z.object({
    count: z.number(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const { text, source } = context;
    const result = await ingestText(text, source);
    return {
      count: result.count,
      message: `Successfully imported ${result.count} text chunks`,
    };
  },
});

