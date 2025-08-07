import { Strategy as SamlStrategy } from "@node-saml/passport-saml";
import { formatSamlCert } from "../../../utils/cert";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  console.log("=== Cloudflare兼容SAML登录API ===");
  console.log("请求URL:", getRequestURL(event).toString());
  console.log("请求方法:", getMethod(event));

  // 检查Cloudflare环境
  const cfRay = getHeader(event, "cf-ray");
  const cfConnectingIp = getHeader(event, "cf-connecting-ip");
  const isCloudflare = !!cfRay;

  console.log("Cloudflare环境检测:", {
    isCloudflare,
    cfRay,
    cfConnectingIp,
  });

  // 检查必要的环境变量
  const missingVars = [];
  if (!config.samlEntryPoint) missingVars.push("SAML_ENTRY_POINT");
  if (!config.samlIssuer) missingVars.push("SAML_ISSUER");
  if (!config.samlCert) missingVars.push("SAML_CERT");
  if (!config.sessionSecret) missingVars.push("SESSION_SECRET");

  if (missingVars.length > 0) {
    console.error("❌ 缺少必要的环境变量:", missingVars);

    return {
      error: "配置不完整",
      missingVars,
      isCloudflare,
      message: "请在Cloudflare Pages中设置必要的环境变量",
    };
  }

  try {
    console.log("✅ 配置检查通过，开始SAML流程...");

    // 格式化证书
    const formattedCert = formatSamlCert(config.samlCert);
    console.log("证书格式化完成，长度:", formattedCert.length);

    // 构建回调URL
    const callbackUrl =
      config.samlCallbackUrl ||
      `${config.public.baseUrl}/api/auth/saml/callback`;
    console.log("回调URL:", callbackUrl);

    // 创建SAML策略配置（Cloudflare优化）
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
      disableRequestedAuthnContext: true,
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

    // 创建SAML策略
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

    console.log("✅ SAML策略创建成功，生成登录URL...");

    // 模拟请求对象
    const mockRequest = {
      query: getQuery(event),
      body: {},
      method: "GET",
      url: getRequestURL(event).pathname,
      headers: {
        host: getRequestURL(event).host,
        "user-agent": getHeader(event, "user-agent") || "Unknown",
        "cf-ray": cfRay,
        "cf-connecting-ip": cfConnectingIp,
      },
      get: (header: string) => getHeader(event, header),
    };

    // 获取SAML登录URL
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

    // 验证登录URL
    if (!loginUrl || typeof loginUrl !== "string") {
      throw new Error("生成的登录URL无效");
    }

    if (!loginUrl.startsWith("https://")) {
      throw new Error("登录URL必须使用HTTPS协议");
    }

    // 在Cloudflare环境中，使用JSON响应而不是重定向
    if (isCloudflare) {
      console.log("Cloudflare环境检测到，返回JSON响应");
      return {
        success: true,
        redirectUrl: loginUrl,
        isCloudflare,
        message: "请在浏览器中访问以下URL进行登录",
        instructions: [
          "1. 复制下面的URL",
          "2. 在新标签页中打开",
          "3. 完成Microsoft登录",
          "4. 返回应用程序",
        ],
      };
    }

    // 非Cloudflare环境，正常重定向
    await sendRedirect(event, loginUrl);
  } catch (error) {
    console.error("❌ Cloudflare兼容SAML登录失败:", error);

    const errorResponse = {
      error: "SAML登录失败",
      isCloudflare,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      cfRay,
      cfConnectingIp,
    };

    // 如果是Cloudflare环境，返回JSON错误
    if (isCloudflare) {
      return errorResponse;
    }

    // 非Cloudflare环境，抛出错误
    throw createError({
      statusCode: 500,
      statusMessage: errorResponse.message,
    });
  }
});
