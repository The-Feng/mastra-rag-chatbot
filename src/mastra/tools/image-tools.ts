import { createTool } from "@mastra/core";
import { z } from "zod";
import { analyzeImage } from "../image.js";

// Tool: Analyze image and describe it
export const analyzeImageTool = createTool({
  id: "analyze_image",
  description: "Analyze an uploaded image and provide a detailed description in the user's language",
  inputSchema: z.object({
    imageBuffer: z.instanceof(Buffer),
    imageName: z.string(),
    imageType: z.string(),
  }),
  outputSchema: z.object({
    description: z.string().describe("Detailed description of the image"),
  }),
  execute: async ({ context }) => {
    const { imageBuffer, imageName, imageType } = context;
    const description = await analyzeImage(imageBuffer, imageName, imageType);
    return {
      description,
    };
  },
});

