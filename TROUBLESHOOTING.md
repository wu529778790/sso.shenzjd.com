# SAML SSO 故障排除指南

## 问题：点击登录按钮跳转到404页面

### 可能的原因和解决方案

#### 1. 环境变量配置问题

最常见的问题是SAML相关的环境变量没有正确配置。请确保在Cloudflare Pages中设置了以下环境变量：

```bash
# SAML 基础配置
SAML_ISSUER=https://sso.shenzjd.com
SAML_CALLBACK_URL=https://sso.shenzjd.com/api/auth/saml/callback
SAML_LOGIN_URL=https://sso.shenzjd.com/api/auth/saml/login
SAML_LOGOUT_URL=https://sso.shenzjd.com/api/auth/saml/logout

# Microsoft Entra ID 配置
SAML_ENTRY_POINT=https://login.microsoftonline.com/你的租户ID/saml2
SAML_CERT=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----

# 会话密钥 (生成一个安全的随机字符串)
SESSION_SECRET=your-secure-random-session-secret-minimum-32-characters

# 应用配置
BASE_URL=https://sso.shenzjd.com
NODE_ENV=production
```

#### 2. 检查配置

访问 `/debug` 页面来检查环境变量是否正确设置。

#### 3. Microsoft Entra ID 配置

确保在Microsoft Entra ID中正确配置了SAML应用：

1. **标识符 (Entity ID)**: `https://sso.shenzjd.com`
2. **回复 URL**: `https://sso.shenzjd.com/api/auth/saml/callback`
3. **登录 URL**: `https://sso.shenzjd.com/api/auth/saml/login`
4. **注销 URL**: `https://sso.shenzjd.com/api/auth/saml/logout`

#### 4. 证书配置

确保SAML_CERT环境变量包含完整的X.509证书，包括：

- `-----BEGIN CERTIFICATE-----`
- 证书内容
- `-----END CERTIFICATE-----`

#### 5. Cloudflare Pages 限制

Cloudflare Pages有一些限制可能影响SAML功能：

- 某些Node.js模块可能不兼容
- 网络请求可能受到限制
- 文件系统访问受限

### 调试步骤

1. **访问调试页面**: 访问 `/debug` 页面检查环境变量
2. **查看构建日志**: 在Cloudflare Pages中查看构建日志
3. **检查网络请求**: 使用浏览器开发者工具检查网络请求
4. **查看控制台错误**: 检查浏览器控制台的错误信息

### 常见错误

#### 错误：Missing required environment variables

**解决方案**: 确保所有必需的环境变量都已设置

#### 错误：SAML login failed

**解决方案**:

- 检查Microsoft Entra ID配置
- 验证证书格式
- 确认URL配置正确

#### 错误：404 Not Found

**解决方案**:

- 检查Cloudflare Pages路由配置
- 确认API路由文件存在
- 验证构建输出正确

### 联系支持

如果问题仍然存在，请：

1. 收集调试页面的输出
2. 提供Cloudflare Pages构建日志
3. 提供浏览器控制台错误信息
4. 检查Microsoft Entra ID应用配置截图
