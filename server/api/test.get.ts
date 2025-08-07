export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  return {
    message: "API测试成功",
    timestamp: new Date().toISOString(),
    config: {
      baseUrl: config.public.baseUrl,
      hasSamlIssuer: !!config.samlIssuer,
      hasSamlEntryPoint: !!config.samlEntryPoint,
      hasSamlCert: !!config.samlCert,
      hasSessionSecret: !!config.sessionSecret,
    },
    headers: {
      host: getHeader(event, "host"),
      "user-agent": getHeader(event, "user-agent"),
    },
    url: getRequestURL(event).toString(),
  };
});
