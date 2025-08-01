#!/bin/bash

# SAML SSO 诊断脚本
# 用于快速诊断和解决登录问题

echo "🔍 SAML SSO 诊断工具"
echo "===================="

# 检查构建状态
echo ""
echo "📦 检查构建状态..."
if [ -d "dist" ]; then
    echo "✅ dist 目录存在"
    
    # 检查API路由文件
    if [ -f "dist/_worker.js/chunks/routes/api/auth/saml/login.get.mjs" ]; then
        echo "✅ SAML登录API路由文件存在"
    else
        echo "❌ SAML登录API路由文件不存在"
        echo "请运行: npm run build"
    fi
else
    echo "❌ dist 目录不存在"
    echo "请运行: npm run build"
fi

# 检查环境变量配置
echo ""
echo "🔧 环境变量配置检查..."
echo "请在 Cloudflare Pages 中设置以下环境变量："
echo ""

echo "必需的环境变量："
echo "1. SAML_ISSUER=https://sso.shenzjd.com"
echo "2. SAML_ENTRY_POINT=https://login.microsoftonline.com/你的租户ID/saml2"
echo "3. SAML_CERT=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----"
echo "4. SESSION_SECRET=your-secure-random-session-secret"
echo ""

echo "可选的环境变量："
echo "5. SAML_CALLBACK_URL=https://sso.shenzjd.com/api/auth/saml/callback"
echo "6. SAML_LOGIN_URL=https://sso.shenzjd.com/api/auth/saml/login"
echo "7. SAML_LOGOUT_URL=https://sso.shenzjd.com/api/auth/saml/logout"
echo "8. BASE_URL=https://sso.shenzjd.com"
echo ""

# 生成SESSION_SECRET
echo "🔐 生成SESSION_SECRET..."
SESSION_SECRET=$(openssl rand -base64 32)
echo "生成的SESSION_SECRET: $SESSION_SECRET"
echo ""

# 检查网络连接
echo "🌐 检查网络连接..."
if curl -s --head https://sso.shenzjd.com | head -n 1 | grep "HTTP/1.[01] [23].." > /dev/null; then
    echo "✅ 网站可以访问"
else
    echo "❌ 网站无法访问"
fi

# 检查API端点
echo ""
echo "🔗 检查API端点..."
if curl -s --head https://sso.shenzjd.com/api/auth/saml/login | head -n 1 | grep "HTTP/1.[01] [23].." > /dev/null; then
    echo "✅ SAML登录API可以访问"
else
    echo "❌ SAML登录API无法访问 (可能是环境变量问题)"
fi

if curl -s --head https://sso.shenzjd.com/debug | head -n 1 | grep "HTTP/1.[01] [23].." > /dev/null; then
    echo "✅ 调试页面可以访问"
else
    echo "❌ 调试页面无法访问"
fi

echo ""
echo "📋 诊断完成！"
echo ""
echo "📝 下一步操作："
echo "1. 访问 https://sso.shenzjd.com/debug 检查环境变量"
echo "2. 在Cloudflare Pages中设置环境变量"
echo "3. 重新部署应用"
echo "4. 测试登录功能"
echo ""
echo "📚 更多信息请查看 ENVIRONMENT_SETUP.md" 