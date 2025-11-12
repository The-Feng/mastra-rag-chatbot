// Minimal Cloudflare Workers entry point - only essential features
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

interface Env {
  OPENAI_API_KEY?: string;
  POSTGRES_URL?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Check if this is staging environment (staging Worker name contains "staging")
    const isStaging = url.hostname.includes('staging');

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (url.pathname === '/health' || url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', version: '1.0.0', environment: isStaging ? 'staging' : 'production' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Chat endpoint - simplified
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        const { query } = await request.json() as { query: string };

        if (!query) {
          return new Response(JSON.stringify({ error: 'Query is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Simple chat response without RAG
        const result = await streamText({
          model: openai('gpt-4o-mini'),
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant. Answer questions clearly and concisely.',
            },
            {
              role: 'user',
              content: query,
            },
          ],
          temperature: 0.7,
        });

        // Return streaming response
        return result.toTextStreamResponse({
          headers: corsHeaders,
        });
      }

      // For root path, return API info (both production and staging)
      // Frontend is served via Cloudflare Pages at https://mastra-agent.pages.dev
      if (url.pathname === '/' || url.pathname === '/index.html') {
        return new Response(JSON.stringify({ 
          message: 'Mastra AI Chatbot API',
          version: '1.0.0',
          environment: isStaging ? 'staging' : 'production',
          endpoints: {
            health: '/health or /api/health',
            chat: '/api/chat (POST)'
          },
          note: 'Frontend is served via Cloudflare Pages. Visit https://mastra-agent.pages.dev for the web interface.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Old HTML page code removed - frontend is now served via Cloudflare Pages
      // HTML page has been removed. Frontend is available at https://mastra-agent.pages.dev

      // 404 for other routes
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error: any) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

