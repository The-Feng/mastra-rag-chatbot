/**
 * Cloudflare Workers 適配器
 * 將 Express 應用程序轉換為 Cloudflare Workers Fetch API
 */

import { executeChatWorkflow, executeIngestAndSummarize, executeImageAnalysis } from './mastra/workflow-executor.js';

// 處理 CORS
function handleCORS(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  return null;
}

// 添加 CORS 頭部
function addCORSHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// 處理靜態文件（HTML）
async function handleStaticFile(path: string): Promise<Response | null> {
  if (path === '/' || path === '/index.html') {
    // 在 Workers 中，我們需要將 HTML 內容內嵌或使用外部 URL
    // 這裡我們返回一個重定向到實際的 HTML 文件
    // 或者可以將 HTML 內容直接內嵌在這裡
    const htmlContent = await import('../public/index.html?raw').catch(() => null);
    if (htmlContent) {
      return new Response(htmlContent.default || htmlContent, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }
  return null;
}

// Chat API 端點
async function handleChat(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid query' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('📨 Received chat query:', query);

    // 執行 chat workflow（返回流式響應）
    const streamResult = await executeChatWorkflow(query);

    // 創建流式響應
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.textStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Error processing request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// 文件上傳處理（文檔）
async function handleUpload(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded', success: false }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(
      `📄 Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`
    );

    // 將 File 轉換為 Buffer（Workers 環境兼容）
    const arrayBuffer = await file.arrayBuffer();
    // 在 Workers 中使用 nodejs_compat，Buffer 應該是可用的
    // 確保轉換為 Buffer 類型
    const fileBuffer = Buffer.from(arrayBuffer);

    // 執行 ingest and summarize workflow
    const result = await executeIngestAndSummarize({
      fileBuffer,
      fileName: file.name || 'unknown',
      fileType: file.type || 'application/octet-stream',
    });

    console.log(`✅ File processed successfully, imported ${result.count} chunks`);

    return new Response(
      JSON.stringify({
        success: true,
        count: result.count,
        summary: result.summary,
        message: result.message,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Error processing file',
        success: false,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// 圖片分析 API 端點
async function handleImage(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: '未上传图片', success: false }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!file.type?.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: '文件不是图片格式', success: false }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(
      `🖼️ Processing image: ${file.name}, type: ${file.type}, size: ${file.size} bytes`
    );

    // 將 File 轉換為 Buffer（Workers 環境兼容）
    const arrayBuffer = await file.arrayBuffer();
    // 在 Workers 中使用 nodejs_compat，Buffer 應該是可用的
    // 確保轉換為 Buffer 類型
    const imageBuffer = Buffer.from(arrayBuffer);

    // 執行圖片分析
    const result = await executeImageAnalysis({
      imageBuffer,
      imageName: file.name || 'unknown',
      imageType: file.type || 'image/png',
    });

    console.log(
      `✅ Image analysis completed, description length: ${result.description.length} characters`
    );

    return new Response(
      JSON.stringify({
        success: true,
        description: result.description,
        message: '图片分析完成',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Image API error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : '處理圖片時出錯',
        success: false,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Health check 端點
function handleHealth(): Response {
  return new Response(
    JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// 主處理函數
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    // 處理 CORS 預檢請求
    const corsResponse = handleCORS(request);
    if (corsResponse) {
      return corsResponse;
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      let response: Response;

      // 路由處理
      if (path === '/api/chat' && request.method === 'POST') {
        response = await handleChat(request);
      } else if (path === '/api/upload' && request.method === 'POST') {
        response = await handleUpload(request);
      } else if (path === '/api/image' && request.method === 'POST') {
        response = await handleImage(request);
      } else if (path === '/api/health' && request.method === 'GET') {
        response = handleHealth();
      } else if (path === '/' || path === '/index.html') {
        // 處理根路徑，返回 HTML
        // 注意：在 Workers 中，靜態文件通常需要通過其他方式提供
        // 這裡我們可以返回一個簡單的重定向或內嵌 HTML
        response = new Response('HTML content should be served from Cloudflare Pages or similar', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });
      } else {
        response = new Response('Not Found', { status: 404 });
      }

      // 添加 CORS 頭部
      return addCORSHeaders(response);
    } catch (error) {
      console.error('Unhandled error:', error);
      return addCORSHeaders(
        new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : 'Internal Server Error',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }
  },
};

