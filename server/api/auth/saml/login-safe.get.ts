export default defineEventHandler(async (event) => {
  console.log("=== 安全登录API测试 ===");
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

  // 检查是否缺少必要的环境变量
  const missingVars = [];
  if (!config.samlEntryPoint) missingVars.push("SAML_ENTRY_POINT");
  if (!config.samlIssuer) missingVars.push("SAML_ISSUER");
  if (!config.samlCert) missingVars.push("SAML_CERT");
  if (!config.sessionSecret) missingVars.push("SESSION_SECRET");

  if (missingVars.length > 0) {
    console.log("❌ 缺少必要的环境变量:", missingVars);
    return {
      status: "incomplete",
      message: "SAML配置不完整，请检查环境变量",
      config: configStatus,
      missingVars,
      nextStep: "请在Cloudflare Pages中设置这些环境变量",
    };
  }

  // 尝试导入SAML库
  try {
    console.log("尝试导入 @node-saml/passport-saml 库...");
    const { Strategy: SamlStrategy } = await import("@node-saml/passport-saml");
    console.log("✅ SAML库导入成功");

    return {
      status: "ready",
      message: "SAML库导入成功，配置完整",
      config: configStatus,
      nextStep: "可以尝试完整的SAML登录流程",
    };
  } catch (importError) {
    console.error("❌ SAML库导入失败:", importError);
    return {
      status: "library_error",
      message: "SAML库导入失败，可能是Cloudflare Pages兼容性问题",
      error:
        importError instanceof Error
          ? importError.message
          : String(importError),
      config: configStatus,
      nextStep: "需要检查Cloudflare Pages的Node.js兼容性",
    };
  }
});
