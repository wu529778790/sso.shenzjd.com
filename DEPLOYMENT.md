# 部署指南

## 环境变量配置

创建 `.env` 文件并配置以下环境变量：

```bash
# SAML Configuration
SAML_ISSUER=https://sso.shenzjd.com
SAML_CALLBACK_URL=https://sso.shenzjd.com/api/auth/saml/callback
SAML_LOGIN_URL=https://sso.shenzjd.com/api/auth/saml/login
SAML_LOGOUT_URL=https://sso.shenzjd.com/api/auth/saml/logout

# Microsoft Entra ID (Azure AD) Configuration
# 从 Azure Portal 中的企业应用 -> 单一登录 -> SAML 配置页面获取
SAML_ENTRY_POINT=https://login.microsoftonline.com/{your-tenant-id}/saml2
SAML_CERT="-----BEGIN CERTIFICATE-----
{你的证书内容}
-----END CERTIFICATE-----"

# Session Configuration
# 生成一个安全的随机字符串作为会话密钥
SESSION_SECRET=your-session-secret-change-this-in-production-minimum-32-characters

# Application Configuration
BASE_URL=https://sso.shenzjd.com
NODE_ENV=production
```

## Microsoft Entra ID 配置步骤

### 1. 创建企业应用

1. 登录 [Azure Portal](https://portal.azure.com)
2. 转到 **Azure Active Directory** > **企业应用程序**
3. 点击 **新建应用程序** > **创建您自己的应用程序**
4. 选择 **集成库中未找到的任何其他应用程序**
5. 输入应用名称：`SAML SSO 测试平台`

### 2. 配置 SAML 单一登录

1. 在创建的企业应用中，转到 **单一登录**
2. 选择 **SAML**
3. 编辑 **基本 SAML 配置**：

   - **标识符 (实体 ID)**: `https://sso.shenzjd.com`
   - **回复 URL (断言使用者服务 URL)**: `https://sso.shenzjd.com/api/auth/saml/callback`
   - **登录 URL**: `https://sso.shenzjd.com/api/auth/saml/login`
   - **注销 URL (可选)**: `https://sso.shenzjd.com/api/auth/saml/logout`

4. 配置 **用户属性和声明**：

   - **givenname**: `user.givenname`
   - **surname**: `user.surname`
   - **emailaddress**: `user.mail`
   - **name**: `user.userprincipalname`
   - **唯一用户标识符 (NameID)**: `user.userprincipalname`

5. 在 **SAML 证书** 部分：
   - 下载 **证书 (Base64)**
   - 将证书内容复制到 `SAML_CERT` 环境变量

6. 在 **设置 {应用名称}** 部分：
   - 复制 **登录 URL** 到 `SAML_ENTRY_POINT` 环境变量
   - 复制 **Azure AD 标识符** (可选)

### 3. 分配用户

1. 在企业应用中，转到 **用户和组**
2. 点击 **添加用户/组**
3. 选择要授权访问的用户或组

## Cloudflare Pages 部署

### 1. 创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 转到 **Pages**
3. 点击 **创建项目**
4. 选择 **连接到 Git**
5. 选择你的 GitHub/GitLab 仓库

### 2. 构建配置

- **框架预设**: `Nuxt.js`
- **构建命令**: `npm run build`
- **构建输出目录**: `.output/public`
- **Root 目录**: `/` (如果项目在根目录)

### 3. 环境变量配置

在项目 **设置** > **环境变量** 中添加所有必需的环境变量：

```
SAML_ISSUER=https://sso.shenzjd.com
SAML_CALLBACK_URL=https://sso.shenzjd.com/api/auth/saml/callback
SAML_LOGIN_URL=https://sso.shenzjd.com/api/auth/saml/login
SAML_LOGOUT_URL=https://sso.shenzjd.com/api/auth/saml/logout
SAML_ENTRY_POINT=你的Azure登录URL
SAML_CERT=你的证书内容
SESSION_SECRET=你的会话密钥
BASE_URL=https://sso.shenzjd.com
NODE_ENV=production
```

### 4. 自定义域名

1. 在项目设置中转到 **自定义域**
2. 添加域名 `sso.shenzjd.com`
3. 在你的 DNS 提供商处添加 CNAME 记录：

   ```
   sso.shenzjd.com CNAME your-project.pages.dev
   ```

### 5. 构建和部署

1. 推送代码到 Git 仓库
2. Cloudflare Pages 将自动构建和部署
3. 检查部署日志确保没有错误
4. 访问你的域名测试应用

## 本地开发

1. **安装依赖**:

   ```bash
   pnpm install
   ```

2. **创建环境变量文件**:

   ```bash
   cp DEPLOYMENT.md .env
   # 然后编辑 .env 文件填入你的配置
   ```

3. **启动开发服务器**:

   ```bash
   pnpm dev
   ```

4. **访问应用**:

   ```
   http://localhost:3000
   ```

## 故障排除

### SAML 认证失败

1. **检查证书格式**: 确保证书包含正确的 BEGIN/END 标记
2. **验证 URL 配置**: 确保 Azure AD 中的 URL 与环境变量匹配
3. **检查用户权限**: 确保用户已分配到应用

### 部署问题

1. **检查构建日志**: 在 Cloudflare Pages 中查看详细的构建错误
2. **验证环境变量**: 确保所有必需的环境变量都已设置
3. **检查函数日志**: 在 Cloudflare 中查看函数执行日志

### 会话问题

1. **检查 SESSION_SECRET**: 确保密钥足够长且安全
2. **HTTPS 要求**: 确保在生产环境中使用 HTTPS
3. **Cookie 设置**: 检查浏览器是否接受 cookies

## 安全注意事项

1. **环境变量安全**: 不要在代码中硬编码敏感信息
2. **HTTPS 强制**: 生产环境必须使用 HTTPS
3. **会话过期**: 合理设置会话过期时间
4. **证书更新**: 定期检查和更新 SAML 证书

## 支持

如有问题，请检查：

1. [Nuxt 4 文档](https://nuxt.com/docs)
2. [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
3. [Microsoft Entra ID 文档](https://docs.microsoft.com/azure/active-directory/)
