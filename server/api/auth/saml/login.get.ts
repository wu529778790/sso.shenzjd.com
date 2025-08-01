import { Strategy as SamlStrategy } from "@node-saml/passport-saml";
import { formatSamlCert } from "../../utils/cert";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // 检查必要的环境变量
  const missingVars = [];
  if (!config.samlEntryPoint) missingVars.push("SAML_ENTRY_POINT");
  if (!config.samlIssuer) missingVars.push("SAML_ISSUER");
  if (!config.samlCert) missingVars.push("SAML_CERT");
  if (!config.sessionSecret) missingVars.push("SESSION_SECRET");

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars);
    console.log("Available config keys:", Object.keys(config).join(", "));
    console.log("Public config:", config.public);

    // 返回更友好的错误信息
    throw createError({
      statusCode: 500,
      statusMessage: `SAML配置不完整。缺少环境变量: ${missingVars.join(
        ", "
      )}。请在Cloudflare Pages中设置这些环境变量。`,
    });
  }

  try {
    console.log("SAML配置检查通过，开始创建策略...");

    const formattedCert = formatSamlCert(config.samlCert);

    // Create SAML strategy
    const samlStrategy = new SamlStrategy(
      {
        callbackUrl:
          config.samlCallbackUrl ||
          `${config.public.baseUrl}/api/auth/saml/callback`,
        entryPoint: config.samlEntryPoint,
        issuer: config.samlIssuer || config.public.baseUrl,
        idpCert: formattedCert, // 使用格式化后的证书
        identifierFormat:
          "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
        signatureAlgorithm: "sha256",
        digestAlgorithm: "sha256",
        requestIdExpirationPeriodMs: 28800000, // 8 hours
        cacheProvider: {
          save: () => {},
          get: () => null,
          remove: () => {},
        },
      },
      () => {}
    );

    console.log("SAML策略创建成功，生成登录URL...");

    // Get the SAML login URL
    const loginUrl = await new Promise((resolve, reject) => {
      samlStrategy.authenticate(
        {
          query: getQuery(event),
          body: {},
          get: (header: string) => getHeader(event, header),
        } as any,
        {
          redirect: (url: string) => resolve(url),
          fail: (message: string) => reject(new Error(message)),
          success: () => {},
          error: (err: Error) => reject(err),
        } as any
      );
    });

    console.log("SAML login URL generated:", loginUrl);

    // Redirect to SAML provider
    await sendRedirect(event, loginUrl as string);
  } catch (error) {
    console.error("SAML login error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    throw createError({
      statusCode: 500,
      statusMessage: `SAML登录失败: ${
        error instanceof Error ? error.message : String(error)
      }。请检查Microsoft Entra ID配置和证书设置。`,
    });
  }
});
