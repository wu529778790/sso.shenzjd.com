// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,
  runtimeConfig: {
    // Private keys (only available on server-side)
    samlIssuer: process.env.SAML_ISSUER,
    samlCallbackUrl: process.env.SAML_CALLBACK_URL,
    samlLoginUrl: process.env.SAML_LOGIN_URL,
    samlLogoutUrl: process.env.SAML_LOGOUT_URL,
    samlEntryPoint: process.env.SAML_ENTRY_POINT,
    samlCert: process.env.SAML_CERT,
    sessionSecret: process.env.SESSION_SECRET,
    // Public keys (exposed to frontend)
    public: {
      baseUrl: process.env.BASE_URL || "http://localhost:3000",
    },
  },
  nitro: {
    prerender: {
      autoSubfolderIndex: false,
    },
    // Cloudflare Pages configuration
    preset: "cloudflare-pages",
    experimental: {
      wasm: true,
    },
  },
  // Enable experimental server components for better SSR
  experimental: {
    payloadExtraction: false,
  },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxtjs/tailwindcss"],
});
