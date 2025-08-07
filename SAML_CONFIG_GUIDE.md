# Microsoft Entra ID SAML SSO 配置指南

## 概述

这个项目演示了如何使用 Microsoft Entra ID（原 Azure AD）进行 SAML 2.0 单点登录（SSO）集成。

## 环境变量配置

### 必需的环境变量

在 Cloudflare Pages 项目设置中配置以下环境变量：

#### 1. BASE_URL

```
BASE_URL=https://sso.shenzjd.com
```

- 你的应用程序的基础URL

#### 2. SAML_ISSUER

```
SAML_ISSUER=https://sso.shenzjd.com
```

- SAML 服务提供商的标识符（通常与你的应用URL相同）

#### 3. SAML_ENTRY_POINT

```
SAML_ENTRY_POINT=https://login.microsoftonline.com/YOUR_TENANT_ID/saml2
```

- Microsoft Entra ID 的 SSO 登录 URL
- 将 `YOUR_TENANT_ID` 替换为你的租户ID

#### 4. SAML_CALLBACK_URL

```
SAML_CALLBACK_URL=https://sso.shenzjd.com/api/auth/saml/callback
```

- SAML 回调 URL（必须与 Microsoft Entra ID 中配置的回复URL匹配）

#### 5. SAML_LOGIN_URL

```
SAML_LOGIN_URL=https://sso.shenzjd.com/api/auth/saml/login
```

- 登录端点URL

#### 6. SAML_LOGOUT_URL

```
SAML_LOGOUT_URL=https://sso.shenzjd.com/api/auth/saml/logout
```

- 登出端点URL

#### 7. SAML_CERT

```
SAML_CERT="-----BEGIN CERTIFICATE-----
MIIDdzCCAl+gAwIBAgIQJC...（这里是你的证书内容）...==
-----END CERTIFICATE-----"
```

- Microsoft Entra ID 的签名证书
- 从联合元数据XML或应用程序配置中获取

#### 8. SESSION_SECRET

```
SESSION_SECRET=your-random-session-secret-key-minimum-32-characters
```

- 用于加密会话的随机字符串（至少32个字符）

## Microsoft Entra ID 配置步骤

### 1. 创建企业应用程序

1. 登录到 [Azure Portal](https://portal.azure.com)
2. 导航到 **Azure Active Directory** > **企业应用程序**
3. 点击 **新建应用程序**
4. 选择 **创建自己的应用程序**
5. 输入应用程序名称，选择 **集成任何其他不在库中的应用程序**

### 2. 配置单点登录

1. 在创建的应用程序中，点击 **单点登录**
2. 选择 **SAML**
3. 在 **基本SAML配置** 部分：
   - **标识符（实体ID）**：`https://sso.shenzjd.com`
   - **回复URL（断言使用者服务URL）**：`https://sso.shenzjd.com/api/auth/saml/callback`
   - **登录URL**：`https://sso.shenzjd.com`

### 3. 获取证书

1. 在 **SAML签名证书** 部分
2. 下载 **证书（Base64）**
3. 复制证书内容（包括BEGIN和END行）设置为 `SAML_CERT` 环境变量

### 4. 获取登录URL

1. 在 **设置** 部分
2. 复制 **登录URL** 设置为 `SAML_ENTRY_POINT` 环境变量

### 5. 配置用户属性和声明

确保以下声明被包含：

- `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress`
- `http://schemas.microsoft.com/identity/claims/displayname`
- `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname`
- `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname`

## 故障排除

### 常见错误及解决方案

#### 1. "SAML配置不完整"

- 检查所有必需的环境变量是否已设置
- 访问 `/debug` 页面查看配置状态

#### 2. "证书验证失败"

- 确保证书格式正确（包含BEGIN和END行）
- 确保证书是从Microsoft Entra ID下载的最新版本

#### 3. "回调URL不匹配"

- 确保Microsoft Entra ID中的回复URL与环境变量中的URL完全匹配
- 检查是否使用了正确的协议（https）

#### 4. "用户认证失败"

- 确保用户已分配到该企业应用程序
- 检查用户属性映射是否正确

### 调试工具

项目提供了以下调试工具：

1. **调试页面**：访问 `/debug` 查看配置状态
2. **控制台日志**：查看Cloudflare Pages的函数日志
3. **测试API**：在调试页面点击"测试登录API"

## 安全注意事项

1. **使用HTTPS**：确保所有URL都使用HTTPS协议
2. **证书安全**：定期更新SAML证书
3. **会话安全**：使用强随机的SESSION_SECRET
4. **访问控制**：在Microsoft Entra ID中正确配置用户访问权限

## 支持的功能

- ✅ SAML 2.0 SSO 登录
- ✅ 用户属性提取
- ✅ 会话管理
- ✅ 登出功能
- ✅ 错误处理和调试
- ✅ 响应式用户界面

## 技术栈

- **前端**：Nuxt 4 + Vue 3 + Tailwind CSS
- **后端**：Nitro + Node-SAML
- **部署**：Cloudflare Pages
- **认证**：Microsoft Entra ID (SAML 2.0)
