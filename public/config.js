// Cloudflare Pages 配置
// 这个文件会在部署时根据环境变量生成

// Workers API URL
// 在 Cloudflare Pages 中，可以通过环境变量设置
// 如果未设置，则使用相对路径（适用于 Pages 和 Workers 在同一域名下）
window.API_BASE_URL = window.API_BASE_URL || '';

// 如果 Pages 和 Workers 不在同一域名，需要设置完整的 URL
// 例如：window.API_BASE_URL = 'https://mastra-agent.your-subdomain.workers.dev';

