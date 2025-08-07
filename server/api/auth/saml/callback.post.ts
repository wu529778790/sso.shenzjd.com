import { Strategy as SamlStrategy } from "@node-saml/passport-saml";
import { formatSamlCert } from "../../../utils/cert";
import { setUserSession } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  console.log("=== SAML回调API开始执行 ===");
  console.log("请求方法:", getMethod(event));
  console.log("请求URL:", getRequestURL(event).toString());

  // 检查必要的环境变量
  const missingVars = [];
  if (!config.samlEntryPoint) missingVars.push("SAML_ENTRY_POINT");
  if (!config.samlIssuer) missingVars.push("SAML_ISSUER");
  if (!config.samlCert) missingVars.push("SAML_CERT");
  if (!config.sessionSecret) missingVars.push("SESSION_SECRET");

  if (missingVars.length > 0) {
    console.error("❌ 回调处理失败，缺少必要的环境变量:", missingVars);
    throw createError({
      statusCode: 500,
      statusMessage: `SAML配置不完整，缺少环境变量: ${missingVars.join(", ")}`,
    });
  }

  const formattedCert = formatSamlCert(config.samlCert);
  console.log("证书格式化完成，长度:", formattedCert.length);

  // 创建与登录API相同的SAML策略配置
  const samlConfig = {
    callbackUrl:
      config.samlCallbackUrl ||
      `${config.public.baseUrl}/api/auth/saml/callback`,
    entryPoint: config.samlEntryPoint,
    issuer: config.samlIssuer || config.public.baseUrl,
    idpCert: formattedCert,
    identifierFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
    signatureAlgorithm: "sha256",
    digestAlgorithm: "sha256",
    requestIdExpirationPeriodMs: 28800000, // 8 hours
    acceptedClockSkewMs: 5000, // 5秒时钟偏差容忍
    // validateInResponseTo: false, // 为了简化，暂时禁用（注释掉以避免类型错误）
    disableRequestedAuthnContext: true,
    cacheProvider: {
      saveAsync: async () => null,
      getAsync: async () => null,
      removeAsync: async () => null,
    },
  };

  console.log("SAML回调配置:", {
    callbackUrl: samlConfig.callbackUrl,
    issuer: samlConfig.issuer,
    entryPoint: samlConfig.entryPoint,
  });

  // Create SAML strategy
  const samlStrategy = new SamlStrategy(
    samlConfig,
    (profile: any, done: Function) => {
      console.log("✅ SAML用户认证成功:", profile);
      return done(null, profile);
    }
  );

  try {
    console.log("开始处理SAML响应...");

    // 读取请求体
    const body = await readBody(event);
    console.log("请求体大小:", JSON.stringify(body).length, "字节");
    console.log("SAML响应包含的字段:", Object.keys(body));

    // 模拟请求对象以处理SAML响应
    const mockRequest = {
      query: getQuery(event),
      body: body,
      method: "POST",
      url: getRequestURL(event).pathname,
      headers: {
        "content-type":
          getHeader(event, "content-type") ||
          "application/x-www-form-urlencoded",
        host: getRequestURL(event).host,
      },
      get: (header: string) => getHeader(event, header),
    };

    console.log("处理SAML响应的模拟请求:", {
      method: mockRequest.method,
      url: mockRequest.url,
      contentType: mockRequest.headers["content-type"],
    });

    // Process SAML response
    const userProfile = await new Promise<any>((resolve, reject) => {
      samlStrategy.authenticate(
        mockRequest as any,
        {
          success: (user: any) => {
            console.log("🎉 SAML认证成功，用户信息:", user);
            resolve(user);
          },
          fail: (message: string, status?: number) => {
            console.error("❌ SAML认证失败:", message, "状态码:", status);
            reject(new Error(`SAML认证失败: ${message}`));
          },
          error: (err: Error) => {
            console.error("❌ SAML处理错误:", err);
            reject(err);
          },
          redirect: (url: string) => {
            console.log("意外的重定向请求:", url);
            reject(new Error("回调处理过程中收到意外的重定向请求"));
          },
        } as any
      );
    });

    // 提取用户信息
    const userData = {
      id: userProfile.nameID || userProfile.id,
      email:
        userProfile.email ||
        userProfile[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      name:
        userProfile.displayName ||
        userProfile.name ||
        userProfile["http://schemas.microsoft.com/identity/claims/displayname"],
      firstName:
        userProfile.firstName ||
        userProfile[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
        ],
      lastName:
        userProfile.lastName ||
        userProfile[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
        ],
      attributes: userProfile,
    };

    console.log("提取的用户数据:", {
      id: userData.id,
      email: userData.email,
      name: userData.name,
    });

    // Set session data
    const sessionData = {
      user: userData,
      authenticated: true,
      loginTime: new Date().toISOString(),
    };

    console.log("设置用户会话...");
    await setUserSession(event, sessionData);

    console.log("✅ 登录成功，重定向到仪表板");
    // Redirect to dashboard
    await sendRedirect(event, "/dashboard");
  } catch (error) {
    console.error("❌ SAML回调处理失败:");
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
    let errorMessage = "SAML认证失败";
    let statusCode = 400;

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();

      if (msg.includes("signature") || msg.includes("cert")) {
        errorMessage = "SAML响应签名验证失败。请检查证书配置。";
      } else if (msg.includes("expired")) {
        errorMessage = "SAML响应已过期。请重新登录。";
      } else if (msg.includes("assertion")) {
        errorMessage = "SAML断言处理失败。请检查Microsoft Entra ID配置。";
      } else if (msg.includes("format")) {
        errorMessage = "SAML响应格式无效。请检查Microsoft Entra ID的响应配置。";
      } else {
        errorMessage = `SAML认证失败: ${error.message}`;
      }
    }

    throw createError({
      statusCode,
      statusMessage: errorMessage,
    });
  }
});
