export default defineEventHandler(async (event) => {
  console.log("=== 简化登录API测试 ===");
  console.log("请求URL:", getRequestURL(event).toString());
  console.log("请求方法:", getMethod(event));

  const config = useRuntimeConfig();

  // 检查基本配置
  const configStatus = {
    baseUrl: config.public.baseUrl,
    hasSamlIssuer: !!config.samlIssuer,
    hasSamlEntryPoint: !!config.samlEntryPoint,
    hasSamlCert: !!config.samlCert,
    hasSessionSecret: !!config.sessionSecret,
  };

  console.log("配置状态:", configStatus);

  // 如果有完整的SAML配置，尝试正常流程
  if (config.samlIssuer && config.samlEntryPoint && config.samlCert) {
    console.log("SAML配置完整，尝试正常登录流程");
    // 这里可以调用原来的登录逻辑
    return {
      status: "ready",
      message: "SAML配置完整，可以正常登录",
      config: configStatus,
      nextStep: "重定向到Microsoft登录页面",
    };
  } else {
    console.log("SAML配置不完整，返回配置信息");
    return {
      status: "incomplete",
      message: "SAML配置不完整，请检查环境变量",
      config: configStatus,
      missingVars: [
        !config.samlIssuer && "SAML_ISSUER",
        !config.samlEntryPoint && "SAML_ENTRY_POINT",
        !config.samlCert && "SAML_CERT",
        !config.sessionSecret && "SESSION_SECRET",
      ].filter(Boolean),
    };
  }
});
