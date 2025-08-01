export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  return {
    SAML_ISSUER: !!config.samlIssuer,
    SAML_CALLBACK_URL: !!config.samlCallbackUrl,
    SAML_LOGIN_URL: !!config.samlLoginUrl,
    SAML_LOGOUT_URL: !!config.samlLogoutUrl,
    SAML_ENTRY_POINT: !!config.samlEntryPoint,
    SAML_CERT: !!config.samlCert,
    SESSION_SECRET: !!config.sessionSecret,
    BASE_URL: config.public.baseUrl,
    NODE_ENV: process.env.NODE_ENV,
  };
}); 