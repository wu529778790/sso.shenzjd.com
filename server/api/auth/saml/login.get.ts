import { Strategy as SamlStrategy } from "@node-saml/passport-saml";

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
    throw createError({
      statusCode: 500,
      statusMessage: `Missing required environment variables: ${missingVars.join(
        ", "
      )}`,
    });
  }

  try {
    // Create SAML strategy
    const samlStrategy = new SamlStrategy(
      {
        callbackUrl:
          config.samlCallbackUrl ||
          `${config.public.baseUrl}/api/auth/saml/callback`,
        entryPoint: config.samlEntryPoint,
        issuer: config.samlIssuer || config.public.baseUrl,
        cert: config.samlCert,
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
    throw createError({
      statusCode: 500,
      statusMessage: `SAML login failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
});
