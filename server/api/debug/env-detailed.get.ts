export default defineEventHandler(async (event) => {
  console.log("=== 详细环境变量调试 ===");

  const config = useRuntimeConfig();

  // 获取所有环境变量
  const allEnvVars = {
    // 运行时配置
    runtimeConfig: {
      samlIssuer: config.samlIssuer,
      samlCallbackUrl: config.samlCallbackUrl,
      samlLoginUrl: config.samlLoginUrl,
      samlLogoutUrl: config.samlLogoutUrl,
      samlEntryPoint: config.samlEntryPoint,
      samlCert: config.samlCert,
      sessionSecret: config.sessionSecret,
      public: config.public,
    },

    // 原始环境变量
    processEnv: {
      SAML_ISSUER: process.env.SAML_ISSUER,
      SAML_CALLBACK_URL: process.env.SAML_CALLBACK_URL,
      SAML_LOGIN_URL: process.env.SAML_LOGIN_URL,
      SAML_LOGOUT_URL: process.env.SAML_LOGOUT_URL,
      SAML_ENTRY_POINT: process.env.SAML_ENTRY_POINT,
      SAML_CERT: process.env.SAML_CERT,
      SESSION_SECRET: process.env.SESSION_SECRET,
      BASE_URL: process.env.BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    },

    // 检查结果
    checks: {
      hasSamlIssuer: !!config.samlIssuer,
      hasSamlEntryPoint: !!config.samlEntryPoint,
      hasSamlCert: !!config.samlCert,
      hasSessionSecret: !!config.sessionSecret,
      hasBaseUrl: !!config.public.baseUrl,
    },

    // 缺失的变量
    missing: [
      !config.samlIssuer && "SAML_ISSUER",
      !config.samlEntryPoint && "SAML_ENTRY_POINT",
      !config.samlCert && "SAML_CERT",
      !config.sessionSecret && "SESSION_SECRET",
    ].filter(Boolean),

    // 请求信息
    request: {
      url: getRequestURL(event).toString(),
      method: getMethod(event),
      headers: {
        host: getHeader(event, "host"),
        "user-agent": getHeader(event, "user-agent"),
      },
    },

    // 时间戳
    timestamp: new Date().toISOString(),
  };

  console.log("环境变量调试信息:", JSON.stringify(allEnvVars, null, 2));

  return allEnvVars;
});
