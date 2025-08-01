import { Strategy as SamlStrategy } from "@node-saml/passport-saml";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Create SAML strategy
  const samlStrategy = new SamlStrategy(
    {
      callbackUrl:
        config.samlCallbackUrl ||
        `${config.public.baseUrl}/api/auth/saml/callback`,
      entryPoint: config.samlEntryPoint,
      issuer: config.samlIssuer || config.public.baseUrl,
      idpCert: config.samlCert, // 使用 idpCert 而不是 cert
      identifierFormat: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
      signatureAlgorithm: "sha256",
      digestAlgorithm: "sha256",
      requestIdExpirationPeriodMs: 28800000, // 8 hours
      cacheProvider: {
        save: () => {},
        get: () => null,
        remove: () => {},
      },
    },
    (profile: any, done: Function) => {
      // Profile processing
      return done(null, profile);
    }
  );

  try {
    const body = await readBody(event);

    // Process SAML response
    const userProfile = await new Promise((resolve, reject) => {
      samlStrategy.authenticate(
        {
          query: getQuery(event),
          body: body,
          get: (header: string) => getHeader(event, header),
        } as any,
        {
          success: (user: any) => resolve(user),
          fail: (message: string) => reject(new Error(message)),
          error: (err: Error) => reject(err),
          redirect: () => {},
        } as any
      );
    });

    // Set session or JWT token
    const sessionData = {
      user: userProfile,
      authenticated: true,
      loginTime: new Date().toISOString(),
    };

    // Store session data (you can use JWT or server-side sessions)
    await setUserSession(event, sessionData);

    // Redirect to dashboard
    await sendRedirect(event, "/dashboard");
  } catch (error) {
    console.error("SAML callback error:", error);
    throw createError({
      statusCode: 400,
      statusMessage: "SAML authentication failed",
    });
  }
});
