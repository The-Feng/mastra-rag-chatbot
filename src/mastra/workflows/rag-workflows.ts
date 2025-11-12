import { createWorkflow, createStep } from "@mastra/core";
import { z } from "zod";
import { ingestFile, askRag, summarizeDocument } from "../rag.js";
import { ragAgent } from "../agents/rag-agent.js";
import { ragQAPrompt, documentSummaryPrompt, agentInstructionsPrompt } from "../prompts/rag-prompts.js";

// Workflow: Upload document → Ingest to database
export const ingestWorkflow = createWorkflow({
  id: "DocumentIngest",
  inputSchema: z.object({
    fileBuffer: z.instanceof(Buffer),
    fileName: z.string(),
    fileType: z.string(),
  }),
  outputSchema: z.object({
    count: z.number(),
    message: z.string(),
  }),
  steps: [
    createStep({
      id: "ExtractAndEmbed",
      inputSchema: z.object({
        fileBuffer: z.instanceof(Buffer),
        fileName: z.string(),
        fileType: z.string(),
      }),
      outputSchema: z.object({
        count: z.number(),
        message: z.string(),
      }),
      execute: async ({ inputData }) => {
        const result = await ingestFile(
          inputData.fileBuffer,
          inputData.fileName,
          inputData.fileType
        );
        return {
          count: result.count,
          message: `Successfully imported ${result.count} document chunks`,
        };
      },
    }),
  ],
});

// Workflow: User question → Agent processes → Generate answer (streaming)
export const chatWorkflow = createWorkflow({
  id: "ChatWithRAG",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.any(),
  steps: [
    createStep({
      id: "AgentGenerateAnswer",
      inputSchema: z.object({
        query: z.string(),
      }),
      outputSchema: z.any(),
      execute: async ({ inputData }) => {
        console.log("🤖 Using RAG Agent to process user question:", inputData.query);
        console.log("📝 Using prompt:", ragQAPrompt.id);
        
        // Use agent to generate response with tools
        // For streaming, we can use askRag directly (which uses ragQAPrompt internally)
        // Here we use askRag to maintain streaming response
        const stream = await askRag(inputData.query);
        return stream;
      },
    }),
  ],
});

// Alternative workflow using agent directly (non-streaming)
export const chatWorkflowWithAgent = createWorkflow({
  id: "ChatWithRAGAgent",
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    response: z.string(),
  }),
  steps: [
    createStep({
      id: "AgentGenerateAnswer",
      inputSchema: z.object({
        query: z.string(),
      }),
      outputSchema: z.object({
        response: z.string(),
      }),
      execute: async ({ inputData }) => {
        console.log("🤖 Using RAG Agent to process user question:", inputData.query);
        console.log("📝 Agent uses prompt:", agentInstructionsPrompt.id);
        
        // Use agent to generate response (agent uses agentInstructionsPrompt internally)
        const result = await ragAgent.generate(inputData.query);
        
        return {
          response: result.text,
        };
      },
    }),
  ],
});

// Workflow: Upload document → Ingest → Auto summarize
export const ingestAndSummarizeWorkflow = createWorkflow({
  id: "IngestAndSummarize",
  inputSchema: z.object({
    fileBuffer: z.instanceof(Buffer),
    fileName: z.string(),
    fileType: z.string(),
  }),
  outputSchema: z.object({
    count: z.number(),
    summary: z.string(),
    message: z.string(),
  }),
  steps: [
    createStep({
      id: "ExtractAndEmbed",
      inputSchema: z.object({
        fileBuffer: z.instanceof(Buffer),
        fileName: z.string(),
        fileType: z.string(),
      }),
      outputSchema: z.object({
        count: z.number(),
        message: z.string(),
      }),
      execute: async ({ inputData }) => {
        const result = await ingestFile(
          inputData.fileBuffer,
          inputData.fileName,
          inputData.fileType
        );
        return {
          count: result.count,
          message: `Successfully imported ${result.count} document chunks`,
        };
      },
    }),
    createStep({
      id: "GenerateSummary",
      inputSchema: z.object({
        count: z.number(),
        message: z.string(),
      }),
      outputSchema: z.object({
        count: z.number(),
        summary: z.string(),
        message: z.string(),
      }),
      execute: async ({ inputData }) => {
        // No need to wait - database operations in previous step are already committed
        console.log("📝 Using prompt:", documentSummaryPrompt.id);
        // Generate summary (summarizeDocument uses documentSummaryPrompt internally)
        const summary = await summarizeDocument();
        
        return {
          count: inputData.count,
          summary: summary,
          message: inputData.message,
        };
      },
    }),
  ],
});

