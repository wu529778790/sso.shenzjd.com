# Cloudflare Pages SAML API 故障排除指南

## 问题描述

SAML登录API (`/api/auth/saml/login`) 被Cloudflare拦截，返回500错误或error code: 1101。

## 解决方案

### 1. 立即解决方案

#### 使用Cloudflare兼容的API

访问以下API替代主登录API：

- **简化登录API**: `https://sso.shenzjd.com/api/auth/saml/login-simple`
- **Cloudflare兼容API**: `https://sso.shenzjd.com/api/auth/saml/login-cloudflare`
- **安全登录API**: `https://sso.shenzjd.com/api/auth/saml/login-safe`

#### 手动重定向

如果API返回JSON响应而不是重定向，请：

1. 复制返回的`redirectUrl`
2. 在新标签页中打开
3. 完成Microsoft登录
4. 返回应用程序

### 2. Cloudflare Pages 配置修复

#### 添加Headers配置

在项目根目录创建 `_headers` 文件：

```
/api/auth/saml/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  CF-Cache-Status: BYPASS
```

#### 添加重定向配置

在项目根目录创建 `_redirects` 文件：

```
/api/auth/saml/login 200
/api/auth/saml/callback 200
/api/auth/saml/logout 200
/api/debug/* 200
/api/* 200
```

#### 添加中间件

在项目根目录创建 `functions/_middleware.js` 文件：

```javascript
export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  if (url.pathname.startsWith('/api/auth/saml/')) {
    const response = context.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('CF-Cache-Status', 'BYPASS');
    return response;
  }
  
  return context.next();
}
```

### 3. 环境变量检查

确保在Cloudflare Pages中设置了以下环境变量：

- `SAML_ISSUER` - 应用程序标识符
- `SAML_ENTRY_POINT` - Microsoft Entra ID登录URL
- `SAML_CERT` - Microsoft Entra ID证书(Base64格式)
- `SESSION_SECRET` - 会话加密密钥
- `BASE_URL` - 应用程序基础URL

### 4. 诊断步骤

#### 运行诊断脚本

```bash
chmod +x diagnose-saml.sh
./diagnose-saml.sh
```

#### 手动测试API

```bash
# 测试环境变量
curl -s "https://sso.shenzjd.com/api/debug/env" | jq '.'

# 测试简化登录API
curl -s "https://sso.shenzjd.com/api/auth/saml/login-simple" | jq '.'

# 测试主登录API
curl -s "https://sso.shenzjd.com/api/auth/saml/login"
```

### 5. Cloudflare Pages 安全设置

#### 在Cloudflare Dashboard中

1. 进入项目设置
2. 找到"Functions"部分
3. 确保"Functions"已启用
4. 在"Security"部分，确保以下设置：
   - 禁用"Bot Fight Mode"
   - 禁用"Browser Integrity Check"
   - 设置"Security Level"为"Medium"或"Low"

#### 添加自定义规则

在Cloudflare Pages的"Rules"部分添加：

- **规则名称**: Allow SAML API
- **条件**: URL Path equals `/api/auth/saml/*`
- **操作**: Bypass Security

### 6. 重新部署

#### 使用部署脚本

```bash
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

#### 手动部署

```bash
npm run build
wrangler pages deploy .output/public --project-name=sso-shenzjd-com
```

### 7. 验证修复

部署后测试以下URL：

1. `https://sso.shenzjd.com/api/debug/env` - 环境变量检查
2. `https://sso.shenzjd.com/api/auth/saml/login-simple` - 简化登录API
3. `https://sso.shenzjd.com/api/auth/saml/login` - 主登录API

### 8. 常见错误代码

- **error code: 1101** - Cloudflare安全拦截
- **HTTP 500** - 服务器内部错误
- **HTTP 403** - 访问被拒绝
- **HTTP 404** - 页面未找到

### 9. 联系支持

如果问题仍然存在：

1. 检查Cloudflare Pages日志
2. 查看浏览器开发者工具的网络标签
3. 联系Cloudflare支持
4. 考虑使用其他部署平台（如Vercel、Netlify）

## 预防措施

1. 定期更新Cloudflare Pages配置
2. 监控API访问日志
3. 设置适当的缓存策略
4. 使用Cloudflare兼容的代码模式
