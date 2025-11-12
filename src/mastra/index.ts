
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow.js';
import { weatherAgent } from './agents/weather-agent.js';
import { toolCallAppropriatenessScorer, completenessScorer, translationScorer } from './scorers/weather-scorer.js';
import { ragAgent } from './agents/rag-agent.js';
import { ingestWorkflow, chatWorkflow, chatWorkflowWithAgent, ingestAndSummarizeWorkflow } from './workflows/rag-workflows.js';
import { createPersistentStorage } from './storage-config.js';

// 使用持久化存儲（如果配置了 PostgreSQL）
// 否則回退到內存存儲
const storage = createPersistentStorage();

export const mastra = new Mastra({
  workflows: { 
    weatherWorkflow,
    ingestWorkflow,
    chatWorkflow,
    chatWorkflowWithAgent,
    ingestAndSummarizeWorkflow,
  },
  agents: { 
    weatherAgent,
    ragAgent,
  },
  scorers: { toolCallAppropriatenessScorer, completenessScorer, translationScorer },
  storage: storage,
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false, 
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true }, 
  },
  bundler: {
    externals: ["@opentelemetry/auto-instrumentations-node"],
  },
});
