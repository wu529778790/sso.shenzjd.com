#!/bin/bash

# SAML SSO 项目部署脚本
# 用于部署到 Cloudflare Pages

set -e  # 遇到错误时退出

echo "🚀 开始部署 SAML SSO 项目到 Cloudflare Pages..."

# 检查是否安装了必要的工具
if ! command -v pnpm &> /dev/null; then
    echo "❌ 错误: 未找到 pnpm，请先安装 pnpm"
    exit 1
fi

if ! command -v wrangler &> /dev/null; then
    echo "❌ 错误: 未找到 wrangler，请先安装 Cloudflare Wrangler"
    echo "安装命令: npm install -g wrangler"
    exit 1
fi

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf .nuxt dist

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建项目
echo "🔨 构建项目..."
pnpm run build

# 检查构建是否成功
if [ ! -d ".nuxt" ]; then
    echo "❌ 构建失败: .nuxt 目录不存在"
    exit 1
fi

echo "✅ 构建成功!"

# 检查环境变量配置
echo "🔍 检查环境变量配置..."
if [ -z "$SAML_ISSUER" ] || [ -z "$SAML_ENTRY_POINT" ] || [ -z "$SAML_CERT" ]; then
    echo "⚠️  警告: 检测到缺少SAML环境变量"
    echo "请在Cloudflare Pages中设置以下环境变量:"
    echo "  - SAML_ISSUER"
    echo "  - SAML_ENTRY_POINT" 
    echo "  - SAML_CERT"
    echo "  - SESSION_SECRET"
    echo "  - BASE_URL"
    echo ""
    echo "参考 SAML_CONFIG_GUIDE.md 获取详细配置说明"
fi

# 部署到 Cloudflare Pages
echo "🌐 部署到 Cloudflare Pages..."
wrangler pages deploy .nuxt --project-name=sso-shenzjd-com

echo "✅ 部署完成!"
echo ""
echo "📋 部署后检查清单:"
echo "1. 访问 https://sso.shenzjd.com 检查首页是否正常"
echo "2. 访问 https://sso.shenzjd.com/debug 检查配置状态"
echo "3. 测试基础API: https://sso.shenzjd.com/api/test"
echo "4. 如果配置了SAML环境变量，测试登录功能"
echo ""
echo "🔧 如果遇到问题:"
echo "- 检查Cloudflare Pages的函数日志"
echo "- 查看调试页面的错误信息"
echo "- 参考 TROUBLESHOOTING.md 进行故障排除" 