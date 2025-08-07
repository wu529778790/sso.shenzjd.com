<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">SAML SSO 测试平台</h1>
        <p class="text-xl text-gray-600 mb-8">
          基于 Microsoft Entra ID 的单点登录演示
        </p>
      </div>

      <!-- Main Card -->
      <div class="max-w-md mx-auto">
        <div class="card">
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">开始登录</h2>
            <p class="text-gray-600">使用您的 Microsoft 账户通过 SAML 登录</p>
          </div>

          <!-- 登出成功消息 -->
          <div
            v-if="showLogoutMessage"
            class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p class="text-green-800 text-sm text-center">✅ 已成功登出</p>
          </div>

          <div v-if="!isLoading">
            <button
              @click="login"
              class="w-full btn btn-primary text-lg py-3 mb-4">
              <svg
                class="w-5 h-5 mr-2 inline"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path
                  d="M23.5 12.5h-12v-1h12v1zm-12-4h12v1h-12v-1zm0-3h12v1h-12v-1zm-1.5 3.5v-4h-1v4h1zm-6-4v4h1v-4h-1zm3.5 0v4h1v-4h-1z" />
              </svg>
              Microsoft 登录
            </button>

            <div class="text-center text-sm text-gray-500">
              <p>通过 SAML 2.0 协议安全登录</p>
              <p class="mt-2">
                <NuxtLink
                  to="/debug"
                  class="text-blue-600 hover:text-blue-800 underline">
                  调试配置
                </NuxtLink>
              </p>
            </div>
          </div>

          <div v-else class="text-center">
            <div class="spinner mx-auto mb-4"></div>
            <p class="text-gray-600">正在跳转到登录页面...</p>
          </div>
        </div>

        <!-- Info Section -->
        <div class="mt-8 card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">测试信息</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">协议:</span>
              <span class="font-medium">SAML 2.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">身份提供商:</span>
              <span class="font-medium">Microsoft Entra ID</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">部署平台:</span>
              <span class="font-medium">Cloudflare Pages</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">框架:</span>
              <span class="font-medium">Nuxt 4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const isLoading = ref(false);
const showLogoutMessage = ref(false);

// 检查是否有登出成功参数
onMounted(() => {
  const route = useRoute();
  if (route.query.logout === "success") {
    showLogoutMessage.value = true;
    // 3秒后隐藏消息
    setTimeout(() => {
      showLogoutMessage.value = false;
    }, 3000);
  }
});

const login = async () => {
  isLoading.value = true;
  try {
    await navigateTo("/api/auth/saml/login");
  } catch (error) {
    console.error("Login failed:", error);
    isLoading.value = false;
  }
};

// 设置页面元数据
useHead({
  title: "SAML SSO 测试平台",
  meta: [
    {
      name: "description",
      content: "基于 Microsoft Entra ID 的 SAML 单点登录测试平台",
    },
  ],
});
</script>
