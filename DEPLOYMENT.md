# Cloudflare Pages 部署指南

## 部署步骤

### 1. 准备项目

确保你的项目已经推送到 GitHub 仓库，并且包含以下文件：

- `wrangler.toml` - Cloudflare 配置文件
- `package.json` - 项目依赖
- `nuxt.config.ts` - Nuxt 配置

### 2. 在 Cloudflare Pages 中创建项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 转到 **Pages** 部分
3. 点击 **创建项目**
4. 选择 **连接到 Git**
5. 选择你的 GitHub 仓库

### 3. 构建设置

在 Cloudflare Pages 项目设置中配置：

- **框架预设**: 选择 "无" (None)
- **构建命令**: `pnpm install --no-frozen-lockfile && pnpm run build`
- **构建输出目录**: `dist`
- **根目录**: 留空（使用项目根目录）

**注意**: `wrangler.toml` 文件中的 `pages_build_output_dir` 配置已更新为 `dist`，与 Nuxt 构建输出目录保持一致。

### 4. 环境变量配置

在 Cloudflare Pages 项目设置中添加以下环境变量：

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

### 5. 自定义域名设置

1. 在项目设置中转到 **自定义域**
2. 添加域名 `sso.shenzjd.com`
3. 在你的 DNS 提供商处添加 CNAME 记录：

   ```
   sso.shenzjd.com CNAME your-project.pages.dev
   ```

### 6. 部署

1. 推送代码到 GitHub
2. Cloudflare Pages 会自动触发构建
3. 等待构建完成
4. 访问你的域名测试应用

## 故障排除

### 常见问题

1. **构建失败 - 依赖问题**
   - 确保使用 `--no-frozen-lockfile` 参数
   - 检查 package.json 中的依赖版本

2. **SAML 配置错误**
   - 验证所有环境变量都已正确设置
   - 检查 Microsoft Entra ID 中的 SAML 配置

3. **域名解析问题**
   - 确保 CNAME 记录正确设置
   - 等待 DNS 传播（可能需要几分钟到几小时）

### 调试技巧

1. 查看 Cloudflare Pages 构建日志
2. 使用浏览器开发者工具检查网络请求
3. 在 Azure AD 中查看企业应用的登录日志

## 快速部署

使用提供的部署脚本：

```bash
./deploy.sh
```

这个脚本会自动：

1. 清理之前的构建
2. 安装依赖
3. 构建项目
4. 验证构建结果

## 本地测试

在部署前，你可以在本地测试：

1. **安装依赖**:

   ```bash
   pnpm install
   ```

2. **创建环境变量文件**:

   ```bash
   cp .env.example .env
   ```

3. **启动开发服务器**:

   ```bash
   pnpm dev
   ```

4. **访问应用**:

   ```
   http://localhost:3000
   ```

## 相关文档

如有问题，请检查：

1. [Nuxt 4 文档](https://nuxt.com/docs)
2. [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
3. [Microsoft Entra ID 文档](https://docs.microsoft.com/azure/active-directory/)
