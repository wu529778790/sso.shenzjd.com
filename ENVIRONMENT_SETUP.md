# SAML SSO 环境变量配置指南

## 概述

本指南将帮助你在 Cloudflare Pages 中正确配置 SAML SSO 测试平台所需的环境变量。

## 必需的环境变量

### 1. SAML_ISSUER

**描述**: SAML 服务提供商的标识符
**值**: `https://sso.shenzjd.com`
**说明**: 这是你的应用在 SAML 协议中的唯一标识符

### 2. SAML_ENTRY_POINT

**描述**: Microsoft Entra ID 的 SAML 登录端点
**值**: `https://login.microsoftonline.com/你的租户ID/saml2`
**说明**: 需要将 `你的租户ID` 替换为实际的 Microsoft 租户 ID

### 3. SAML_CERT

**描述**: Microsoft Entra ID 的 X.509 证书
**值**:

```
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heHhQJNMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTYwNzA5MTUzNzE5WhcNMTcwNzA5MTUzNzE5WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA...
-----END CERTIFICATE-----
```

**说明**: 从 Microsoft Entra ID 应用配置中获取的完整证书

### 4. SESSION_SECRET

**描述**: 用于加密会话的安全密钥
**值**: 生成一个至少32字符的随机字符串
**示例**: `your-super-secure-random-session-secret-minimum-32-chars`

## 可选的环境变量

### 5. SAML_CALLBACK_URL

**描述**: SAML 回调 URL
**值**: `https://sso.shenzjd.com/api/auth/saml/callback`
**说明**: 如果不设置，将使用默认值

### 6. SAML_LOGIN_URL

**描述**: SAML 登录 URL
**值**: `https://sso.shenzjd.com/api/auth/saml/login`
**说明**: 如果不设置，将使用默认值

### 7. SAML_LOGOUT_URL

**描述**: SAML 注销 URL
**值**: `https://sso.shenzjd.com/api/auth/saml/logout`
**说明**: 如果不设置，将使用默认值

### 8. BASE_URL

**描述**: 应用的基础 URL
**值**: `https://sso.shenzjd.com`
**说明**: 如果不设置，将使用默认值

## 配置步骤

### 1. 获取 Microsoft 租户 ID

1. 登录 [Microsoft Entra 管理中心](https://entra.microsoft.com/)
2. 在左侧菜单中选择 "Azure Active Directory"
3. 在概览页面找到 "租户 ID"

### 2. 配置 Microsoft Entra ID 应用

1. 在 Microsoft Entra 管理中心中，选择 "企业应用程序"
2. 点击 "新建应用程序" → "创建自己的应用程序"
3. 选择 "集成不在库中的任何其他应用程序"
4. 输入应用名称，如 "SAML SSO 测试平台"
5. 点击 "创建"

### 3. 配置 SAML 设置

1. 在应用页面，选择 "单一登录"
2. 选择 "SAML"
3. 配置以下设置：

#### 基本 SAML 配置

- **标识符 (实体 ID)**: `https://sso.shenzjd.com`
- **回复 URL**: `https://sso.shenzjd.com/api/auth/saml/callback`
- **登录 URL**: `https://sso.shenzjd.com/api/auth/saml/login`
- **注销 URL**: `https://sso.shenzjd.com/api/auth/saml/logout`

#### 用户属性和声明

- **唯一用户标识符**: `user.userprincipalname`
- **显示名称**: `user.displayname`
- **电子邮件地址**: `user.mail`

### 4. 获取证书

1. 在 SAML 配置页面，点击 "下载" 按钮下载证书
2. 打开下载的证书文件，复制完整内容（包括 BEGIN 和 END 行）

### 5. 在 Cloudflare Pages 中设置环境变量

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages 项目 `sso-shenzjd-com`
3. 点击 "Settings" → "Environment variables"
4. 添加上述所有环境变量

## 验证配置

### 1. 访问调试页面

部署完成后，访问 `https://sso.shenzjd.com/debug` 检查环境变量是否正确设置。

### 2. 测试登录

点击主页面的 "Microsoft 登录" 按钮，应该能正常跳转到 Microsoft 登录页面。

## 常见问题

### Q: 点击登录按钮显示 404 错误

**A**: 这通常是因为缺少必需的环境变量。请检查：

- 所有必需的环境变量是否都已设置
- 环境变量值是否正确
- 是否已重新部署应用

### Q: 如何生成安全的 SESSION_SECRET？

**A**: 可以使用以下命令生成：

```bash
openssl rand -base64 32
```

### Q: 证书格式不正确怎么办？

**A**: 确保证书包含完整的 PEM 格式，包括：

- `-----BEGIN CERTIFICATE-----`
- 证书内容
- `-----END CERTIFICATE-----`

### Q: 租户 ID 在哪里找到？

**A**: 在 Microsoft Entra 管理中心的 "Azure Active Directory" → "概览" 页面可以找到租户 ID。

## 联系支持

如果遇到问题，请：

1. 访问调试页面收集错误信息
2. 检查 Cloudflare Pages 构建日志
3. 提供浏览器控制台的错误信息
