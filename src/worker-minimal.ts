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

      // For staging environment root path, return API info
      if (isStaging && (url.pathname === '/' || url.pathname === '/index.html')) {
        return new Response(JSON.stringify({ 
          message: 'Mastra AI Chatbot API - Staging Environment',
          version: '1.0.0',
          endpoints: {
            health: '/health or /api/health',
            chat: '/api/chat (POST)'
          },
          note: 'This is a staging environment. Frontend is served via Cloudflare Pages.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Interactive chat page for root path (only for production, not staging)
      // Staging environment should only serve API endpoints
      if (!isStaging && (url.pathname === '/' || url.pathname === '/index.html')) {
        const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mastra AI Chatbot</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      height: calc(100vh - 40px);
      overflow: hidden;
    }
    .header {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .message {
      display: flex;
      gap: 12px;
      animation: fadeIn 0.3s ease-in;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .message.user {
      flex-direction: row-reverse;
    }
    .message-content {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 12px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .message.user .message-content {
      background: #667eea;
      color: white;
      border-bottom-right-radius: 4px;
    }
    .message.assistant .message-content {
      background: #f3f4f6;
      color: #111827;
      border-bottom-left-radius: 4px;
    }
    .message.assistant .message-content pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin-top: 8px;
    }
    .message.assistant .message-content code {
      background: #e5e7eb;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .message.user .avatar {
      background: #667eea;
      color: white;
    }
    .message.assistant .avatar {
      background: #f3f4f6;
      color: #667eea;
    }
    .input-container {
      padding: 20px 24px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    .input-wrapper {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }
    #messageInput {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 15px;
      font-family: inherit;
      resize: none;
      max-height: 120px;
      transition: border-color 0.2s;
    }
    #messageInput:focus {
      outline: none;
      border-color: #667eea;
    }
    #sendButton {
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
      min-width: 80px;
    }
    #sendButton:hover:not(:disabled) {
      transform: translateY(-2px);
    }
    #sendButton:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .loading {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid #667eea;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      text-align: center;
    }
    .empty-state h2 {
      font-size: 20px;
      margin-bottom: 8px;
      color: #111827;
    }
    .empty-state p {
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 Mastra AI Chatbot</h1>
      <p>智能对话助手 - 精简版</p>
    </div>
    <div class="chat-container" id="chatContainer">
      <div class="empty-state">
        <h2>👋 你好！</h2>
        <p>我是 Mastra AI 助手，有什么可以帮你的吗？</p>
      </div>
    </div>
    <div class="input-container">
      <div class="input-wrapper">
        <textarea
          id="messageInput"
          placeholder="输入你的问题..."
          rows="1"
        ></textarea>
        <button id="sendButton">发送</button>
      </div>
    </div>
  </div>
  <script>
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    let isLoading = false;

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Send on Enter (Shift+Enter for new line)
    messageInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isLoading) sendMessage();
      }
    });

    function addMessage(role, content) {
      const emptyState = chatContainer.querySelector('.empty-state');
      if (emptyState) emptyState.remove();

      const messageDiv = document.createElement('div');
      messageDiv.className = 'message ' + role;
      
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = role === 'user' ? '👤' : '🤖';
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'message-content';
      
      if (role === 'assistant') {
        // Simple markdown-like formatting
        content = content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
          .replace(/\n/g, '<br>');
        contentDiv.innerHTML = content;
      } else {
        contentDiv.textContent = content;
      }
      
      messageDiv.appendChild(avatar);
      messageDiv.appendChild(contentDiv);
      chatContainer.appendChild(messageDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function sendMessage() {
      const query = messageInput.value.trim();
      if (!query || isLoading) return;

      // Add user message
      addMessage('user', query);
      messageInput.value = '';
      messageInput.style.height = 'auto';
      
      // Show loading state
      isLoading = true;
      sendButton.disabled = true;
      sendButton.innerHTML = '<div class="loading"></div>';

      // Add assistant message placeholder
      const assistantMessage = document.createElement('div');
      assistantMessage.className = 'message assistant';
      assistantMessage.innerHTML = '<div class="avatar">🤖</div><div class="message-content" id="assistantResponse"></div>';
      chatContainer.appendChild(assistantMessage);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      const responseDiv = document.getElementById('assistantResponse');
      let fullText = '';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          
          // Update UI with formatted text
          const formatted = fullText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
          
          responseDiv.innerHTML = formatted;
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      } catch (error: any) {
        responseDiv.innerHTML = '<span style="color: #ef4444;">❌ 错误: ' + (error?.message || 'Unknown error') + '</span>';
      } finally {
        isLoading = false;
        sendButton.disabled = false;
        sendButton.textContent = '发送';
        messageInput.focus();
      }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.focus();
  </script>
</body>
</html>`;
        return new Response(htmlContent, {
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

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

