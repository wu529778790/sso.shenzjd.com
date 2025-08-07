#!/bin/bash

echo "=== Cloudflare Pages 部署脚本 ==="
echo "开始时间: $(date)"
echo ""

# 检查是否安装了wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler 未安装，请先安装: npm install -g wrangler"
    exit 1
fi

# 检查是否登录了Cloudflare
echo "检查Cloudflare登录状态..."
wrangler whoami

if [ $? -ne 0 ]; then
    echo "❌ 请先登录Cloudflare: wrangler login"
    exit 1
fi

echo ""
echo "✅ Cloudflare登录状态正常"

# 构建项目
echo ""
echo "构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"

# 部署到Cloudflare Pages
echo ""
echo "部署到Cloudflare Pages..."
wrangler pages deploy .output/public --project-name=sso-shenzjd-com

if [ $? -ne 0 ]; then
    echo "❌ 部署失败"
    exit 1
fi

echo ""
echo "✅ 部署成功！"
echo "部署完成时间: $(date)"
echo ""
echo "测试链接:"
echo "- 主页: https://sso.shenzjd.com"
echo "- 环境变量测试: https://sso.shenzjd.com/api/debug/env"
echo "- 简化登录API: https://sso.shenzjd.com/api/auth/saml/login-simple"
echo "- Cloudflare兼容API: https://sso.shenzjd.com/api/auth/saml/login-cloudflare"
echo "- 主登录API: https://sso.shenzjd.com/api/auth/saml/login"
