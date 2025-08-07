export default defineEventHandler(async (event) => {
  console.log("=== Cloudflare兼容登录API ===");
  
  const config = useRuntimeConfig();
  
  // 检查Cloudflare环境
  const cfRay = getHeader(event, "cf-ray");
  const cfConnectingIp = getHeader(event, "cf-connecting-ip");
  const isCloudflare = !!cfRay;
  
  console.log("Cloudflare环境:", { isCloudflare, cfRay, cfConnectingIp });
  
  // 检查SAML配置
  const configStatus = {
    hasSamlIssuer: !!config.samlIssuer,
    hasSamlEntryPoint: !!config.samlEntryPoint,
    hasSamlCert: !!config.samlCert,
    hasSessionSecret: !!config.sessionSecret,
    baseUrl: config.public.baseUrl,
  };
  
  console.log("SAML配置状态:", configStatus);
  
  // 如果配置不完整，返回配置信息
  if (!config.samlIssuer || !config.samlEntryPoint || !config.samlCert) {
    return {
      status: "incomplete",
      message: "SAML配置不完整",
      isCloudflare,
      config: configStatus,
      missingVars: [
        !config.samlIssuer && "SAML_ISSUER",
        !config.samlEntryPoint && "SAML_ENTRY_POINT", 
        !config.samlCert && "SAML_CERT",
        !config.sessionSecret && "SESSION_SECRET",
      ].filter(Boolean),
      instructions: [
        "请在Cloudflare Pages中设置以下环境变量:",
        "1. SAML_ISSUER - 应用程序标识符",
        "2. SAML_ENTRY_POINT - Microsoft Entra ID登录URL",
        "3. SAML_CERT - Microsoft Entra ID证书(Base64)",
        "4. SESSION_SECRET - 会话加密密钥"
      ]
    };
  }
  
  // 如果配置完整，尝试生成登录URL
  try {
    // 构建回调URL
    const callbackUrl = config.samlCallbackUrl || 
      `${config.public.baseUrl}/api/auth/saml/callback`;
    
    // 构建SAML请求URL（简化版本）
    const samlRequestUrl = new URL(config.samlEntryPoint);
    samlRequestUrl.searchParams.set("SAMLRequest", "dummy"); // 占位符
    samlRequestUrl.searchParams.set("RelayState", callbackUrl);
    
    return {
      status: "ready",
      message: "SAML配置完整，可以尝试登录",
      isCloudflare,
      config: configStatus,
      samlEntryPoint: config.samlEntryPoint,
      callbackUrl,
      nextSteps: [
        "1. 访问Microsoft Entra ID配置页面",
        "2. 确认应用程序配置正确",
        "3. 测试SAML登录流程",
        "4. 检查回调URL设置"
      ],
      troubleshooting: {
        ifBlocked: "如果被Cloudflare拦截，请检查安全设置",
        ifError: "如果出现错误，请查看Cloudflare Pages日志",
        ifTimeout: "如果超时，请检查网络连接"
      }
    };
    
  } catch (error) {
    console.error("生成登录URL时出错:", error);
    
    return {
      status: "error",
      message: "生成登录URL时出错",
      isCloudflare,
      error: error instanceof Error ? error.message : String(error),
      config: configStatus
    };
  }
});
