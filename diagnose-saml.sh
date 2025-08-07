#!/bin/bash

echo "=== SAML API 诊断脚本 ==="
echo "测试时间: $(date)"
echo ""

BASE_URL="https://sso.shenzjd.com"

echo "1. 测试基础连接..."
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" "$BASE_URL"

echo ""
echo "2. 测试环境变量API..."
curl -s "$BASE_URL/api/debug/env" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/debug/env"

echo ""
echo "3. 测试简化登录API..."
curl -s "$BASE_URL/api/auth/saml/login-simple" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/auth/saml/login-simple"

echo ""
echo "4. 测试基础登录API..."
curl -s "$BASE_URL/api/auth/saml/login-basic" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/auth/saml/login-basic"

echo ""
echo "5. 测试主登录API（可能被拦截）..."
curl -s -w "HTTP状态码: %{http_code}\n" "$BASE_URL/api/auth/saml/login"

echo ""
echo "6. 测试安全登录API..."
curl -s "$BASE_URL/api/auth/saml/login-safe" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/auth/saml/login-safe"

echo ""
echo "7. 检查Cloudflare响应头..."
curl -s -I "$BASE_URL/api/auth/saml/login" | grep -E "(cf-|server|x-)" || echo "无法获取响应头"

echo ""
echo "=== 诊断完成 ==="
