#!/bin/bash

# SSO 项目部署脚本
echo "🚀 开始部署 SSO 项目到 Cloudflare Pages..."

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf dist .nuxt

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 构建失败：dist 目录不存在"
    exit 1
fi

echo "✅ 构建成功！"
echo "📁 构建输出目录: dist/"

# 显示构建文件
echo "📋 构建文件列表:"
ls -la dist/

echo ""
echo "🎉 构建完成！"
echo "💡 您可以使用以下命令进行部署："
echo "   npx wrangler pages deploy dist"
echo ""
echo "💡 或者使用以下命令进行本地预览："
echo "   npx wrangler pages dev dist" 