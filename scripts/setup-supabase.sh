#!/bin/bash

# Supabase 設置腳本
# 這個腳本會幫助您設置 Supabase PostgreSQL 數據庫

echo "🚀 Supabase 設置助手"
echo "===================="
echo ""

# 檢查是否已安裝必要的工具
check_dependencies() {
    echo "📋 檢查依賴..."
    
    if ! command -v psql &> /dev/null; then
        echo "⚠️  PostgreSQL 客戶端 (psql) 未安裝"
        echo "   請安裝 PostgreSQL 客戶端："
        echo "   macOS: brew install postgresql"
        echo "   Ubuntu: sudo apt-get install postgresql-client"
        echo ""
    else
        echo "✅ psql 已安裝"
    fi
    
    echo ""
}

# 提示用戶輸入 Supabase 連接信息
get_supabase_info() {
    echo "請輸入您的 Supabase 連接信息："
    echo ""
    
    read -p "Supabase 項目 URL (例如: https://xxxxx.supabase.co): " SUPABASE_URL
    read -p "數據庫密碼: " -s DB_PASSWORD
    echo ""
    read -p "數據庫端口 (默認 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    # 從 URL 提取主機名
    SUPABASE_HOST=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|http://||' | sed 's|/.*||')
    
    if [[ $SUPABASE_HOST == *".supabase.co"* ]]; then
        DB_HOST="db.${SUPABASE_HOST}"
    else
        DB_HOST="db.${SUPABASE_HOST}.supabase.co"
    fi
    
    POSTGRES_URL="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/postgres"
    
    echo ""
    echo "✅ 連接字符串已生成"
    echo ""
}

# 測試數據庫連接
test_connection() {
    echo "🔌 測試數據庫連接..."
    
    if command -v psql &> /dev/null; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "SELECT version();" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ 數據庫連接成功！"
            return 0
        else
            echo "❌ 數據庫連接失敗"
            echo "   請檢查："
            echo "   1. Supabase 項目是否已創建"
            echo "   2. 密碼是否正確"
            echo "   3. 網絡連接是否正常"
            return 1
        fi
    else
        echo "⚠️  跳過連接測試（psql 未安裝）"
        return 0
    fi
}

# 啟用 pgvector 擴展
enable_pgvector() {
    echo "🔧 啟用 pgvector 擴展..."
    
    if command -v psql &> /dev/null; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "CREATE EXTENSION IF NOT EXISTS vector;" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "✅ pgvector 擴展已啟用"
            return 0
        else
            echo "❌ 啟用 pgvector 失敗"
            echo "   請手動在 Supabase SQL Editor 中執行："
            echo "   CREATE EXTENSION IF NOT EXISTS vector;"
            return 1
        fi
    else
        echo "⚠️  跳過 pgvector 設置（psql 未安裝）"
        echo "   請在 Supabase SQL Editor 中執行："
        echo "   CREATE EXTENSION IF NOT EXISTS vector;"
        return 0
    fi
}

# 創建 .env 文件
create_env_file() {
    echo "📝 創建 .env 文件..."
    
    if [ -f .env ]; then
        echo "⚠️  .env 文件已存在"
        read -p "是否覆蓋現有 .env 文件？(y/N): " OVERWRITE
        if [[ ! $OVERWRITE =~ ^[Yy]$ ]]; then
            echo "跳過創建 .env 文件"
            return 0
        fi
    fi
    
    cat > .env << EOF
# Supabase PostgreSQL 連接字符串
POSTGRES_URL=${POSTGRES_URL}

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# Cloudflare R2 配置（可選，用於 Cloudflare Workers 部署）
# R2_BUCKET_NAME=mastra-files
EOF
    
    echo "✅ .env 文件已創建"
    echo ""
    echo "⚠️  請記得設置 OPENAI_API_KEY！"
}

# 設置 Cloudflare Workers 環境變量
setup_cloudflare() {
    echo ""
    read -p "是否設置 Cloudflare Workers 環境變量？(y/N): " SETUP_CF
    if [[ $SETUP_CF =~ ^[Yy]$ ]]; then
        echo ""
        echo "🔧 設置 Cloudflare Workers..."
        
        if command -v wrangler &> /dev/null; then
            echo "設置 POSTGRES_URL..."
            echo "$POSTGRES_URL" | npx wrangler secret put POSTGRES_URL
            
            echo ""
            read -p "是否設置 OPENAI_API_KEY？(y/N): " SETUP_OPENAI
            if [[ $SETUP_OPENAI =~ ^[Yy]$ ]]; then
                read -p "OpenAI API Key: " -s OPENAI_KEY
                echo ""
                echo "$OPENAI_KEY" | npx wrangler secret put OPENAI_API_KEY
            fi
            
            echo "✅ Cloudflare Workers 環境變量已設置"
        else
            echo "⚠️  wrangler 未安裝，請手動設置："
            echo "   npx wrangler secret put POSTGRES_URL"
            echo "   npx wrangler secret put OPENAI_API_KEY"
        fi
    fi
}

# 主函數
main() {
    check_dependencies
    get_supabase_info
    
    echo "📊 連接信息："
    echo "   主機: $DB_HOST"
    echo "   端口: $DB_PORT"
    echo "   數據庫: postgres"
    echo ""
    
    if test_connection; then
        enable_pgvector
        create_env_file
        setup_cloudflare
        
        echo ""
        echo "🎉 設置完成！"
        echo ""
        echo "下一步："
        echo "1. 編輯 .env 文件，設置 OPENAI_API_KEY"
        echo "2. 運行應用測試連接："
        echo "   pnpm server"
        echo ""
    else
        echo ""
        echo "❌ 設置未完成"
        echo "   請檢查連接信息後重試"
        echo ""
    fi
}

# 運行主函數
main

