# 故障排除指南

## 常见问题及解决方案

### 1. 404 错误 - 页面不存在

**症状**: 访问任何页面都返回 404 错误

**可能原因**:

- Cloudflare Pages 部署失败
- 路由配置问题
- 构建输出目录错误

**解决方案**:

1. 检查 Cloudflare Pages 部署状态
2. 确认构建成功生成了 `.nuxt` 目录
3. 检查 `_routes.json` 配置是否正确
4. 重新部署项目

### 2. 500 错误 - 服务器内部错误

**症状**: API 调用返回 500 错误

**可能原因**:

- 环境变量未配置
- SAML 配置错误
- 代码错误

**解决方案**:

1. 访问 `/debug` 页面检查环境变量状态
2. 检查 Cloudflare Pages 函数日志
3. 测试基础 API: `/api/test`
4. 检查 SAML 配置是否正确

### 3. 登录按钮跳转到 404

**症状**: 点击"Microsoft 登录"按钮后跳转到 404 页面

**可能原因**:

- API 路径错误
- 环境变量未配置
- SAML 配置不完整

**解决方案**:

1. 检查 `/api/auth/saml/login` 路径是否正确
2. 访问 `/debug` 页面测试简化登录 API
3. 确认所有必需的环境变量已设置
4. 检查 Microsoft Entra ID 配置

### 4. 调试页面显示"未设置"环境变量

**症状**: 调试页面显示某些环境变量为"未设置"

**解决方案**:

1. 在 Cloudflare Pages 项目设置中添加环境变量
2. 参考 `SAML_CONFIG_GUIDE.md` 获取正确的配置值
3. 重新部署项目
4. 清除浏览器缓存后重新访问

### 5. SAML 认证失败

**症状**: 登录过程中出现 SAML 认证错误

**可能原因**:

- 证书配置错误
- 回调 URL 不匹配
- Microsoft Entra ID 配置问题

**解决方案**:

1. 检查 SAML 证书格式是否正确
2. 确认回调 URL 与 Microsoft Entra ID 配置匹配
3. 验证 Microsoft Entra ID 应用程序配置
4. 检查用户是否已分配到应用程序

## 调试步骤

### 步骤 1: 检查基础功能

```bash
# 访问基础测试 API
curl https://sso.shenzjd.com/api/test
```

### 步骤 2: 检查环境变量

1. 访问 `/debug` 页面
2. 点击"测试基础 API"按钮
3. 检查环境变量状态

### 步骤 3: 测试简化登录 API

1. 在调试页面点击"测试简化登录 API"
2. 查看返回的配置信息
3. 确认缺少哪些环境变量

### 步骤 4: 检查 Cloudflare Pages 日志

1. 登录 Cloudflare Dashboard
2. 进入 Pages 项目
3. 查看 Functions 日志
4. 查找错误信息

## 环境变量检查清单

确保以下环境变量已正确设置：

- [ ] `BASE_URL` - 应用程序基础 URL
- [ ] `SAML_ISSUER` - SAML 发行者标识符
- [ ] `SAML_ENTRY_POINT` - Microsoft Entra ID 登录 URL
- [ ] `SAML_CERT` - Microsoft Entra ID 证书
- [ ] `SESSION_SECRET` - 会话加密密钥
- [ ] `SAML_CALLBACK_URL` - 回调 URL（可选）
- [ ] `SAML_LOGIN_URL` - 登录 URL（可选）
- [ ] `SAML_LOGOUT_URL` - 登出 URL（可选）

## 常见错误消息

### "SAML配置不完整"

- 检查所有必需的环境变量是否已设置
- 参考 `SAML_CONFIG_GUIDE.md` 进行配置

### "证书验证失败"

- 确保证书格式正确（包含 BEGIN 和 END 行）
- 确保证书是从 Microsoft Entra ID 下载的最新版本

### "回调URL不匹配"

- 确保 Microsoft Entra ID 中的回复 URL 与环境变量中的 URL 完全匹配
- 检查是否使用了正确的协议（https）

### "用户认证失败"

- 确保用户已分配到该企业应用程序
- 检查用户属性映射是否正确

## 获取帮助

如果以上步骤无法解决问题：

1. 检查 Cloudflare Pages 函数日志获取详细错误信息
2. 查看浏览器开发者工具的网络和控制台标签
3. 参考 `SAML_CONFIG_GUIDE.md` 重新配置
4. 确保 Microsoft Entra ID 配置正确

## 有用的调试工具

- **调试页面**: `/debug` - 检查配置状态和测试 API
- **基础测试 API**: `/api/test` - 验证基本功能
- **简化登录 API**: `/api/auth/saml/login-simple` - 检查 SAML 配置
- **环境变量 API**: `/api/debug/env` - 查看环境变量状态
