// Load environment variables first
import { config } from 'dotenv';
config();

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { executeChatWorkflow, executeIngestAndSummarize, executeImageAnalysis } from './src/mastra/workflow-executor.js';
import { toTextStreamResponse } from 'ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, 'public')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query' });
    }

    console.log('📨 Received chat query:', query);

    // Execute chat workflow (returns streaming response)
    const streamResult = await executeChatWorkflow(query);

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream the text response
    try {
      for await (const chunk of streamResult.textStream) {
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error' });
      } else {
        res.end();
      }
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error processing request',
    });
  }
});

// Upload API endpoint
app.post('/api/upload', async (req, res) => {
  try {
    // Use formidable for file upload
    const { formidable } = await import('formidable');

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(400).json({ error: 'Failed to parse form data', success: false });
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded', success: false });
      }

      try {
        const fs = await import('fs/promises');
        const fileBuffer = await fs.readFile(file.filepath);
        
        console.log(`📄 Processing file: ${file.originalFilename}, type: ${file.mimetype}, size: ${file.size} bytes`);

        // Execute ingest and summarize workflow
        const result = await executeIngestAndSummarize({
          fileBuffer,
          fileName: file.originalFilename || 'unknown',
          fileType: file.mimetype || 'application/octet-stream',
        });

        console.log(`✅ File processed successfully, imported ${result.count} chunks`);

        // Clean up temp file
        try {
          await fs.unlink(file.filepath);
        } catch (unlinkError) {
          console.warn('Failed to delete temp file:', unlinkError);
        }

        res.json({
          success: true,
          count: result.count,
          summary: result.summary,
          message: result.message,
        });
      } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Error processing file',
          success: false,
        });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error processing file',
      success: false,
    });
  }
});

// Image analysis API endpoint
app.post('/api/image', async (req, res) => {
  try {
    const { formidable } = await import('formidable');

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(400).json({ error: 'Failed to parse form data', success: false });
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      
      if (!file) {
        return res.status(400).json({ error: '未上传图片', success: false });
      }

      if (!file.mimetype?.startsWith('image/')) {
        return res.status(400).json({ error: '文件不是图片格式', success: false });
      }

      try {
        const fs = await import('fs/promises');
        const fileBuffer = await fs.readFile(file.filepath);

        console.log(`🖼️ Processing image: ${file.originalFilename}, type: ${file.mimetype}, size: ${file.size} bytes`);

        // Execute image analysis
        const result = await executeImageAnalysis({
          imageBuffer: fileBuffer,
          imageName: file.originalFilename || 'unknown',
          imageType: file.mimetype || 'image/png',
        });

        console.log(`✅ Image analysis completed, description length: ${result.description.length} characters`);

        // Clean up temp file
        try {
          await fs.unlink(file.filepath);
        } catch (unlinkError) {
          console.warn('Failed to delete temp file:', unlinkError);
        }

        res.json({
          success: true,
          description: result.description,
          message: '图片分析完成',
        });
      } catch (error) {
        console.error('Image analysis error:', error);
        res.status(500).json({
          error: error instanceof Error ? error.message : '处理图片时出错',
          success: false,
        });
      }
    });
  } catch (error) {
    console.error('Image API error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '處理圖片時出錯',
      success: false,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Open http://localhost:${PORT} in your browser`);
});

