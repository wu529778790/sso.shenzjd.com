#!/bin/bash

# SAML SSO 测试平台部署脚本
# 用于部署到 Cloudflare Pages

set -e

echo "🚀 开始部署 SAML SSO 测试平台到 Cloudflare Pages..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ 错误: 未找到 wrangler 命令"
    echo "请先安装 Cloudflare Wrangler:"
    echo "npm install -g wrangler"
    exit 1
fi

# 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"

# 检查环境变量
echo "🔍 检查环境变量配置..."
echo "请确保在 Cloudflare Pages 中设置了以下环境变量："
echo ""
echo "必需的环境变量："
echo "- SAML_ISSUER=https://sso.shenzjd.com"
echo "- SAML_ENTRY_POINT=https://login.microsoftonline.com/你的租户ID/saml2"
echo "- SAML_CERT=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----"
echo "- SESSION_SECRET=your-secure-random-session-secret"
echo ""
echo "可选的环境变量："
echo "- SAML_CALLBACK_URL=https://sso.shenzjd.com/api/auth/saml/callback"
echo "- SAML_LOGIN_URL=https://sso.shenzjd.com/api/auth/saml/login"
echo "- SAML_LOGOUT_URL=https://sso.shenzjd.com/api/auth/saml/logout"
echo "- BASE_URL=https://sso.shenzjd.com"
echo ""

read -p "是否继续部署？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "部署已取消"
    exit 0
fi

# 部署到 Cloudflare Pages
echo "🌐 部署到 Cloudflare Pages..."
wrangler pages deploy dist --project-name=sso-shenzjd-com

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "🔗 访问地址: https://sso.shenzjd.com"
    echo "🐛 调试页面: https://sso.shenzjd.com/debug"
    echo ""
    echo "📝 下一步："
    echo "1. 访问调试页面检查环境变量配置"
    echo "2. 在 Microsoft Entra ID 中配置 SAML 应用"
    echo "3. 测试登录功能"
else
    echo "❌ 部署失败"
    exit 1
fi 