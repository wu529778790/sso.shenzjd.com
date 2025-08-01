# SAML SSO 测试平台

基于 Nuxt 4 和 Microsoft Entra ID 的 SAML 单点登录演示项目，部署在 Cloudflare Pages 上。

## 功能特性

- ✅ SAML 2.0 单点登录集成
- ✅ Microsoft Entra ID (Azure AD) 身份提供商
- ✅ 用户会话管理 (JWT)
- ✅ 响应式用户界面 (Tailwind CSS)
- ✅ Cloudflare Pages 部署
- ✅ TypeScript 支持

## 技术栈

- **框架**: Nuxt 4 (Vue 3)
- **样式**: Tailwind CSS
- **认证**: passport-saml
- **会话**: JWT (jose)
- **部署**: Cloudflare Pages
- **类型**: TypeScript

## 项目结构

```
sso.shenzjd.com/
├── app/
│   ├── app.vue                 # 应用主布局
│   └── pages/
│       ├── index/
│       │   └── index.vue       # 登录页面
│       └── dashboard/
│           └── index.vue       # 用户仪表板
├── server/
│   ├── api/auth/
│   │   ├── saml/
│   │   │   ├── login.get.ts    # SAML 登录端点
│   │   │   ├── callback.post.ts # SAML 回调处理
│   │   │   └── logout.get.ts   # 登出端点
│   │   └── user.get.ts         # 获取用户信息
│   └── utils/
│       └── session.ts          # 会话管理工具
├── assets/css/
│   └── main.css               # 全局样式
├── nuxt.config.ts             # Nuxt 配置
├── wrangler.toml              # Cloudflare 配置
└── package.json
```

## 环境变量配置

在 Cloudflare Pages 环境变量中设置以下变量：

```bash
# SAML 基础配置
SAML_ISSUER=https://sso.shenzjd.com
SAML_CALLBACK_URL=https://sso.shenzjd.com/api/auth/saml/callback
SAML_LOGIN_URL=https://sso.shenzjd.com/api/auth/saml/login
SAML_LOGOUT_URL=https://sso.shenzjd.com/api/auth/saml/logout

# Microsoft Entra ID 配置
SAML_ENTRY_POINT=https://login.microsoftonline.com/{tenant-id}/saml2
SAML_CERT=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----

# 会话密钥
SESSION_SECRET=your-secure-random-session-secret

# 应用 URL
BASE_URL=https://sso.shenzjd.com
NODE_ENV=production
```

## 本地开发

1. **克隆项目并安装依赖**:

   ```bash
   git clone <repository-url>
   cd sso.shenzjd.com
   pnpm install
   ```

2. **创建环境变量文件**:

   ```bash
   cp .env.example .env
   ```

   编辑 `.env` 文件，填入你的 SAML 配置。

3. **启动开发服务器**:

   ```bash
   pnpm dev
   ```

4. **访问应用**:
   打开 <http://localhost:3000>

## Microsoft Entra ID 配置

### 1. 创建企业应用

1. 登录 [Azure Portal](https://portal.azure.com)
2. 导航到 **Azure Active Directory** > **企业应用程序**
3. 点击 **新建应用程序** > **创建您自己的应用程序**
4. 选择 **集成库中未找到的任何其他应用程序**

### 2. 配置 SAML

1. 在企业应用中，转到 **单一登录**
2. 选择 **SAML**
3. 配置以下设置：

   **基本 SAML 配置**:
   - 标识符 (实体 ID): `https://sso.shenzjd.com`
   - 回复 URL: `https://sso.shenzjd.com/api/auth/saml/callback`
   - 登录 URL: `https://sso.shenzjd.com/api/auth/saml/login`

   **用户属性和声明**:
   - givenname: user.givenname
   - surname: user.surname
   - emailaddress: user.mail
   - name: user.userprincipalname

4. 下载 **证书 (Base64)** 并设置为 `SAML_CERT` 环境变量
5. 复制 **登录 URL** 并设置为 `SAML_ENTRY_POINT` 环境变量

## Cloudflare Pages 部署

### 1. 连接 Git 仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 转到 **Pages**
3. 点击 **创建项目** > **连接到 Git**
4. 选择你的 Git 仓库

### 2. 构建设置

- **构建命令**: `npm run build`
- **构建输出目录**: `.output/public`
- **Node.js 版本**: `18.x` 或更高

### 3. 环境变量

在 Cloudflare Pages 项目设置中添加所有必需的环境变量。

### 4. 自定义域名

1. 在项目设置中转到 **自定义域**
2. 添加你的域名 `sso.shenzjd.com`
3. 按照 DNS 配置说明设置 CNAME 记录

## SAML 流程说明

1. **用户访问应用**: 用户访问首页，点击"Microsoft 登录"
2. **SAML 登录请求**: 应用将用户重定向到 Microsoft Entra ID
3. **用户认证**: 用户在 Microsoft 登录页面输入凭据
4. **SAML 响应**: Microsoft 将 SAML 响应发送到回调 URL
5. **会话创建**: 应用验证 SAML 响应并创建用户会话 (JWT)
6. **访问授权**: 用户被重定向到仪表板，显示用户信息

## 故障排除

### 常见问题

1. **SAML 证书错误**:
   - 确保从 Azure Portal 下载的证书格式正确
   - 证书应包含 `-----BEGIN CERTIFICATE-----` 和 `-----END CERTIFICATE-----`

2. **回调 URL 不匹配**:
   - 确保 Azure AD 中的回复 URL 与环境变量 `SAML_CALLBACK_URL` 匹配

3. **会话问题**:
   - 检查 `SESSION_SECRET` 是否设置且足够安全
   - 确保应用在 HTTPS 环境下运行

### 调试技巧

1. 检查 Cloudflare Pages 部署日志
2. 在 Azure AD 中查看企业应用的登录日志
3. 使用浏览器开发者工具检查网络请求

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
