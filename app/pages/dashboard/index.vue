<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">SAML SSO 仪表板</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-600">欢迎, {{ userDisplayName }}</span>
            <button
              @click="logout"
              class="btn btn-secondary"
              :disabled="isLoading">
              <span v-if="!isLoading">登出</span>
              <span v-else class="flex items-center">
                <div class="spinner mr-2"></div>
                登出中...
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- User Info Card -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">用户信息</h2>
          <div v-if="user" class="space-y-4">
            <div
              v-for="(value, key) in userInfo"
              :key="key"
              class="border-b border-gray-200 pb-3">
              <dt class="text-sm font-medium text-gray-600">{{ key }}</dt>
              <dd
                class="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                {{ value || "无数据" }}
              </dd>
            </div>
          </div>
          <div v-else class="text-center text-gray-500">
            <div class="spinner mx-auto mb-4"></div>
            <p>加载用户信息中...</p>
          </div>
        </div>

        <!-- SAML Attributes Card -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">SAML 属性</h2>
          <div v-if="user && user.attributes" class="space-y-3">
            <div
              v-for="(value, key) in user.attributes"
              :key="key"
              class="border-b border-gray-200 pb-2">
              <dt class="text-sm font-medium text-gray-600">{{ key }}</dt>
              <dd
                class="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                {{ Array.isArray(value) ? value.join(", ") : value }}
              </dd>
            </div>
          </div>
          <div v-else-if="user" class="text-gray-500 text-center">
            <p>无 SAML 属性数据</p>
          </div>
        </div>

        <!-- Session Info Card -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">会话信息</h2>
          <div class="space-y-3">
            <div class="border-b border-gray-200 pb-2">
              <dt class="text-sm font-medium text-gray-600">登录时间</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(loginTime) }}
              </dd>
            </div>
            <div class="border-b border-gray-200 pb-2">
              <dt class="text-sm font-medium text-gray-600">会话状态</dt>
              <dd class="mt-1">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  活跃
                </span>
              </dd>
            </div>
            <div class="border-b border-gray-200 pb-2">
              <dt class="text-sm font-medium text-gray-600">认证方式</dt>
              <dd class="mt-1 text-sm text-gray-900">SAML 2.0 SSO</dd>
            </div>
          </div>
        </div>

        <!-- Test Actions Card -->
        <div class="card">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">测试功能</h2>
          <div class="space-y-4">
            <button
              @click="refreshUserData"
              class="w-full btn btn-secondary"
              :disabled="isRefreshing">
              <span v-if="!isRefreshing">刷新用户数据</span>
              <span v-else class="flex items-center justify-center">
                <div class="spinner mr-2"></div>
                刷新中...
              </span>
            </button>

            <button
              @click="testApiCall"
              class="w-full btn btn-primary"
              :disabled="isTestingApi">
              <span v-if="!isTestingApi">测试 API 调用</span>
              <span v-else class="flex items-center justify-center">
                <div class="spinner mr-2"></div>
                测试中...
              </span>
            </button>

            <div v-if="apiTestResult" class="mt-4 p-3 bg-gray-50 rounded-md">
              <p class="text-sm font-medium text-gray-600 mb-1">
                API 测试结果:
              </p>
              <pre class="text-xs text-gray-900 whitespace-pre-wrap">{{
                apiTestResult
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 定义响应式数据
const user = ref(null);
const loginTime = ref(null);
const isLoading = ref(false);
const isRefreshing = ref(false);
const isTestingApi = ref(false);
const apiTestResult = ref(null);

// 用户显示名称
const userDisplayName = computed(() => {
  if (!user.value) return "加载中...";
  return (
    user.value.displayName ||
    user.value.givenName ||
    user.value.name ||
    user.value.nameID ||
    "未知用户"
  );
});

// 用户信息
const userInfo = computed(() => {
  if (!user.value) return {};

  return {
    用户ID: user.value.nameID || user.value.id,
    显示名称: user.value.displayName,
    姓名: user.value.givenName,
    姓氏: user.value.surname,
    邮箱: user.value.email || user.value.emailAddress,
    用户主体名称: user.value.userPrincipalName,
    名称标识符: user.value.nameID,
    名称格式: user.value.nameIDFormat,
  };
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "无数据";
  return new Date(dateString).toLocaleString("zh-CN");
};

// 获取用户数据
const fetchUserData = async () => {
  try {
    const { data } = await $fetch("/api/auth/user");
    if (data.authenticated) {
      user.value = data.user;
      loginTime.value = data.loginTime;
    } else {
      await navigateTo("/");
    }
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    await navigateTo("/");
  }
};

// 刷新用户数据
const refreshUserData = async () => {
  isRefreshing.value = true;
  try {
    await fetchUserData();
  } finally {
    isRefreshing.value = false;
  }
};

// 测试 API 调用
const testApiCall = async () => {
  isTestingApi.value = true;
  try {
    const response = await $fetch("/api/auth/user");
    apiTestResult.value = JSON.stringify(response, null, 2);
  } catch (error) {
    apiTestResult.value = `错误: ${error.message}`;
  } finally {
    isTestingApi.value = false;
  }
};

// 登出
const logout = async () => {
  isLoading.value = true;
  try {
    await navigateTo("/api/auth/saml/logout");
  } catch (error) {
    console.error("Logout failed:", error);
    isLoading.value = false;
  }
};

// 页面加载时获取用户数据
onMounted(() => {
  fetchUserData();
});

// 设置页面元数据
useHead({
  title: "仪表板 - SAML SSO 测试平台",
  meta: [{ name: "description", content: "SAML SSO 用户仪表板" }],
});
</script>
