import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { imageAnalysisPrompt } from "./prompts/image-prompts.js";

/**
 * Analyze an image and generate a description
 * @param imageBuffer - Image buffer
 * @param imageName - Image file name
 * @param imageType - Image MIME type
 * @returns Description of the image
 */
export async function analyzeImage(
  imageBuffer: Buffer,
  imageName: string,
  imageType: string
): Promise<string> {
  // Convert buffer to base64
  const base64Image = imageBuffer.toString("base64");
  const dataUrl = `data:${imageType};base64,${base64Image}`;

  console.log(`📝 Using prompt: ${imageAnalysisPrompt.id}`);
  console.log(`🖼️ Analyzing image: ${imageName}, type: ${imageType}, size: ${imageBuffer.length} bytes`);

  // Use GPT-4 Vision model for image analysis
  // AI SDK v5 supports images in messages
  const result = await generateText({
    model: openai("gpt-4o"), // Use GPT-4o for vision capabilities
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: imageAnalysisPrompt.template(imageName),
          },
          {
            type: "image",
            image: dataUrl,
          },
        ],
      },
    ],
  });

  return result.text;
}

