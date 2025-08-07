import { Strategy as SamlStrategy } from "@node-saml/passport-saml";
import { formatSamlCert } from "../../../utils/cert";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  console.log("=== SAML登录API开始执行 ===");
  console.log("请求URL:", getRequestURL(event).toString());
  console.log("请求方法:", getMethod(event));

  // 检查必要的环境变量
  const missingVars = [];
  if (!config.samlEntryPoint) missingVars.push("SAML_ENTRY_POINT");
  if (!config.samlIssuer) missingVars.push("SAML_ISSUER");
  if (!config.samlCert) missingVars.push("SAML_CERT");
  if (!config.sessionSecret) missingVars.push("SESSION_SECRET");

  // 输出配置检查结果
  console.log("环境变量检查结果:");
  console.log(
    "- SAML_ENTRY_POINT:",
    config.samlEntryPoint ? "✓ 已设置" : "✗ 未设置"
  );
  console.log("- SAML_ISSUER:", config.samlIssuer ? "✓ 已设置" : "✗ 未设置");
  console.log("- SAML_CERT:", config.samlCert ? "✓ 已设置" : "✗ 未设置");
  console.log(
    "- SESSION_SECRET:",
    config.sessionSecret ? "✓ 已设置" : "✗ 未设置"
  );
  console.log("- BASE_URL:", config.public.baseUrl);

  if (missingVars.length > 0) {
    console.error("❌ 缺少必要的环境变量:", missingVars);

    // 返回更详细的配置指南
    const configGuide = `
SAML配置不完整，请在Cloudflare Pages中设置以下环境变量：

缺少的变量: ${missingVars.join(", ")}

配置指南：
1. 在Cloudflare Pages项目设置中添加环境变量
2. SAML_ENTRY_POINT: Microsoft Entra ID的SSO登录URL
3. SAML_ISSUER: 应用程序的标识符（通常是你的域名）
4. SAML_CERT: Microsoft Entra ID的证书（Base64格式）
5. SESSION_SECRET: 用于会话加密的随机字符串

参考文档: https://docs.microsoft.com/zh-cn/azure/active-directory/saas-apps/
    `;

    throw createError({
      statusCode: 500,
      statusMessage: configGuide,
    });
  }

  try {
    console.log("✅ SAML配置检查通过，开始创建策略...");

    // 格式化并验证证书
    const formattedCert = formatSamlCert(config.samlCert);
    console.log("证书格式化完成，长度:", formattedCert.length);

    // 构建回调URL
    const callbackUrl =
      config.samlCallbackUrl ||
      `${config.public.baseUrl}/api/auth/saml/callback`;
    console.log("回调URL:", callbackUrl);

    // 创建SAML策略配置
    const samlConfig = {
      callbackUrl,
      entryPoint: config.samlEntryPoint,
      issuer: config.samlIssuer || config.public.baseUrl,
      idpCert: formattedCert,
      identifierFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
      signatureAlgorithm: "sha256",
      digestAlgorithm: "sha256",
      requestIdExpirationPeriodMs: 28800000, // 8 hours
      acceptedClockSkewMs: 5000, // 5秒时钟偏差容忍
      // validateInResponseTo: false, // 为了简化，暂时禁用（注释掉以避免类型错误）
      disableRequestedAuthnContext: true, // 禁用认证上下文请求
      cacheProvider: {
        saveAsync: async () => null,
        getAsync: async () => null,
        removeAsync: async () => null,
      },
    };

    console.log("SAML配置:", {
      entryPoint: samlConfig.entryPoint,
      issuer: samlConfig.issuer,
      callbackUrl: samlConfig.callbackUrl,
      certLength: samlConfig.idpCert.length,
    });

    // Create SAML strategy
    const samlStrategy = new SamlStrategy(
      samlConfig,
      (profile: any, done: Function) => {
        console.log("SAML认证成功回调:", profile);
        done(null, profile);
      },
      (profile: any, done: Function) => {
        console.log("SAML序列化回调:", profile);
        done(null, profile);
      }
    );

    console.log("✅ SAML策略创建成功，开始生成登录URL...");

    // 模拟请求对象以生成登录URL
    const mockRequest = {
      query: getQuery(event),
      body: {},
      method: "GET",
      url: getRequestURL(event).pathname,
      headers: {
        host: getRequestURL(event).host,
        "user-agent": getHeader(event, "user-agent") || "Unknown",
      },
      get: (header: string) => getHeader(event, header),
    };

    console.log("模拟请求对象:", {
      method: mockRequest.method,
      url: mockRequest.url,
      host: mockRequest.headers.host,
    });

    // Get the SAML login URL
    const loginUrl = await new Promise<string>((resolve, reject) => {
      try {
        samlStrategy.authenticate(
          mockRequest as any,
          {
            redirect: (url: string) => {
              console.log("✅ SAML重定向URL生成成功:", url);
              resolve(url);
            },
            fail: (message: string, status?: number) => {
              console.error("❌ SAML认证失败:", message, "状态码:", status);
              reject(new Error(`SAML认证失败: ${message}`));
            },
            success: (user: any) => {
              console.log("意外的成功回调:", user);
              reject(new Error("意外的认证成功，应该返回重定向URL"));
            },
            error: (err: Error) => {
              console.error("❌ SAML策略错误:", err);
              reject(err);
            },
          } as any
        );
      } catch (syncError) {
        console.error("❌ SAML策略同步错误:", syncError);
        reject(syncError);
      }
    });

    console.log("🚀 准备重定向到Microsoft登录页面:", loginUrl);

    // 验证登录URL格式
    if (!loginUrl || typeof loginUrl !== "string") {
      throw new Error("生成的登录URL无效");
    }

    if (!loginUrl.startsWith("https://")) {
      throw new Error("登录URL必须使用HTTPS协议");
    }

    // Redirect to SAML provider
    await sendRedirect(event, loginUrl);
  } catch (error) {
    console.error("❌ SAML登录过程发生错误:");
    console.error(
      "错误类型:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "错误消息:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "错误堆栈:",
      error instanceof Error ? error.stack : "无堆栈信息"
    );

    // 根据错误类型提供更具体的错误信息
    let errorMessage = "SAML登录失败";
    let statusCode = 500;

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();

      if (msg.includes("cert") || msg.includes("certificate")) {
        errorMessage =
          "SAML证书配置错误。请检查Microsoft Entra ID中的证书是否正确配置。";
      } else if (msg.includes("entry") || msg.includes("endpoint")) {
        errorMessage =
          "SAML入口点配置错误。请检查Microsoft Entra ID的登录URL配置。";
      } else if (msg.includes("issuer")) {
        errorMessage = "SAML发行者配置错误。请检查应用程序标识符配置。";
      } else if (msg.includes("callback") || msg.includes("redirect")) {
        errorMessage = "SAML回调URL配置错误。请检查回复URL配置。";
      } else if (msg.includes("network") || msg.includes("fetch")) {
        errorMessage = "网络连接错误。请检查Microsoft Entra ID服务是否可访问。";
        statusCode = 503;
      } else {
        errorMessage = `SAML登录失败: ${error.message}`;
      }
    }

    const detailedError = `
${errorMessage}

故障排除步骤：
1. 检查Cloudflare Pages中的环境变量配置
2. 验证Microsoft Entra ID应用程序配置
3. 确认证书格式正确（Base64编码）
4. 检查回调URL是否与应用程序配置匹配

技术详情: ${error instanceof Error ? error.message : String(error)}
    `;

    throw createError({
      statusCode,
      statusMessage: detailedError,
    });
  }
});
