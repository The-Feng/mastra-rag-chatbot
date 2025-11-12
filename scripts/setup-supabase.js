#!/usr/bin/env node

/**
 * Supabase 設置腳本（Node.js 版本）
 * 用於設置 Supabase PostgreSQL 數據庫連接
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

function questionHidden(query) {
  return new Promise((resolve) => {
    process.stdout.write(query);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let input = '';
    process.stdin.on('data', (char) => {
      char = char.toString();
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(input);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f':
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          input += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function getSupabaseInfo() {
  console.log('\n🚀 Supabase 設置助手\n');
  console.log('請輸入您的 Supabase 連接信息：\n');
  
  const supabaseUrl = await question('Supabase 項目 URL (例如: https://xxxxx.supabase.co): ');
  const dbPassword = await questionHidden('數據庫密碼: ');
  const dbPort = await question('數據庫端口 (默認 5432): ') || '5432';
  
  // 從 URL 提取主機名
  let dbHost = supabaseUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!dbHost.includes('.supabase.co')) {
    dbHost = `db.${dbHost}.supabase.co`;
  } else if (!dbHost.startsWith('db.')) {
    dbHost = `db.${dbHost}`;
  }
  
  const postgresUrl = `postgresql://postgres:${dbPassword}@${dbHost}:${dbPort}/postgres`;
  
  console.log('\n✅ 連接字符串已生成\n');
  
  return {
    dbHost,
    dbPort,
    dbPassword,
    postgresUrl,
  };
}

async function createEnvFile(postgresUrl) {
  const envPath = join(projectRoot, '.env');
  const envExamplePath = join(projectRoot, '.env.example');
  
  let envContent = '';
  
  if (existsSync(envPath)) {
    console.log('⚠️  .env 文件已存在');
    const overwrite = await question('是否覆蓋現有 .env 文件？(y/N): ');
    if (!overwrite.match(/^[Yy]$/)) {
      console.log('跳過創建 .env 文件');
      return;
    }
    
    // 讀取現有文件，保留其他配置
    try {
      const existing = readFileSync(envPath, 'utf-8');
      envContent = existing.replace(
        /POSTGRES_URL=.*/,
        `POSTGRES_URL=${postgresUrl}`
      );
      
      if (!envContent.includes('POSTGRES_URL=')) {
        envContent += `\nPOSTGRES_URL=${postgresUrl}\n`;
      }
    } catch (error) {
      // 如果讀取失敗，創建新文件
      envContent = '';
    }
  }
  
  if (!envContent) {
    envContent = `# Supabase PostgreSQL 連接字符串
POSTGRES_URL=${postgresUrl}

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# Cloudflare R2 配置（可選，用於 Cloudflare Workers 部署）
# R2_BUCKET_NAME=mastra-files
`;
  }
  
  writeFileSync(envPath, envContent);
  console.log('✅ .env 文件已創建/更新');
  console.log('\n⚠️  請記得設置 OPENAI_API_KEY！\n');
}

async function setupCloudflare(postgresUrl) {
  const setup = await question('是否設置 Cloudflare Workers 環境變量？(y/N): ');
  if (!setup.match(/^[Yy]$/)) {
    return;
  }
  
  console.log('\n🔧 設置 Cloudflare Workers...\n');
  
  try {
    // 動態導入 wrangler（如果可用）
    const { execSync } = await import('child_process');
    
    console.log('設置 POSTGRES_URL...');
    execSync(`echo "${postgresUrl}" | npx wrangler secret put POSTGRES_URL`, {
      stdio: 'inherit',
    });
    
    const setupOpenAI = await question('\n是否設置 OPENAI_API_KEY？(y/N): ');
    if (setupOpenAI.match(/^[Yy]$/)) {
      const openaiKey = await questionHidden('OpenAI API Key: ');
      execSync(`echo "${openaiKey}" | npx wrangler secret put OPENAI_API_KEY`, {
        stdio: 'inherit',
      });
    }
    
    console.log('\n✅ Cloudflare Workers 環境變量已設置\n');
  } catch (error) {
    console.log('\n⚠️  wrangler 未安裝或設置失敗，請手動設置：');
    console.log('   npx wrangler secret put POSTGRES_URL');
    console.log('   npx wrangler secret put OPENAI_API_KEY\n');
  }
}

async function main() {
  try {
    const { postgresUrl, dbHost, dbPort } = await getSupabaseInfo();
    
    console.log('📊 連接信息：');
    console.log(`   主機: ${dbHost}`);
    console.log(`   端口: ${dbPort}`);
    console.log(`   數據庫: postgres\n`);
    
    await createEnvFile(postgresUrl);
    await setupCloudflare(postgresUrl);
    
    console.log('🎉 設置完成！\n');
    console.log('下一步：');
    console.log('1. 編輯 .env 文件，設置 OPENAI_API_KEY');
    console.log('2. 在 Supabase SQL Editor 中執行：');
    console.log('   CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('3. 運行應用測試連接：');
    console.log('   pnpm server\n');
  } catch (error) {
    console.error('\n❌ 設置失敗:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

