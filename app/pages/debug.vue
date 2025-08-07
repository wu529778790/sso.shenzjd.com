<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">SAML 配置调试页面</h1>

      <!-- 环境变量检查 -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">环境变量检查</h2>
        <div class="space-y-3">
          <div
            v-for="(value, key) in envVars"
            :key="key"
            class="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span class="font-medium text-gray-700">{{ key }}:</span>
            <span class="text-sm text-gray-600 font-mono">
              {{ value ? "已设置" : "未设置" }}
            </span>
          </div>
        </div>
      </div>

      <!-- API 测试 -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">API 测试</h2>
        <div class="space-y-4">
          <button
            @click="testBasicApi"
            class="btn btn-secondary"
            :disabled="isTesting">
            {{ isTesting ? "测试中..." : "测试基础 API" }}
          </button>
          <button
            @click="testSimpleLoginApi"
            class="btn btn-secondary"
            :disabled="isTesting">
            {{ isTesting ? "测试中..." : "测试简化登录 API" }}
          </button>
          <button
            @click="testLoginApi"
            class="btn btn-primary"
            :disabled="isTesting">
            {{ isTesting ? "测试中..." : "测试登录 API" }}
          </button>
          <button
            @click="testUserApi"
            class="btn btn-secondary"
            :disabled="isTesting">
            {{ isTesting ? "测试中..." : "测试用户 API" }}
          </button>
        </div>

        <div v-if="testResults" class="mt-4 p-4 bg-gray-50 rounded">
          <h3 class="font-medium text-gray-900 mb-2">测试结果:</h3>
          <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{
            testResults
          }}</pre>
        </div>
      </div>

      <!-- 错误日志 -->
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">错误日志</h2>
        <div v-if="errors.length === 0" class="text-gray-500">暂无错误</div>
        <div v-else class="space-y-2">
          <div
            v-for="(error, index) in errors"
            :key="index"
            class="p-3 bg-red-50 border border-red-200 rounded">
            <p class="text-red-800 text-sm">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const envVars = ref({});
const testResults = ref("");
const errors = ref([]);
const isTesting = ref(false);

// 检查环境变量
const checkEnvVars = async () => {
  try {
    const response = await $fetch("/api/debug/env");
    envVars.value = response;
  } catch (error) {
    errors.value.push(`环境变量检查失败: ${error.message}`);
  }
};

// 测试基础 API
const testBasicApi = async () => {
  isTesting.value = true;
  try {
    const response = await $fetch("/api/test");
    testResults.value = JSON.stringify(response, null, 2);
  } catch (error) {
    testResults.value = `基础 API 错误: ${error.message}`;
    errors.value.push(`基础 API 测试失败: ${error.message}`);
  } finally {
    isTesting.value = false;
  }
};

// 测试简化登录 API
const testSimpleLoginApi = async () => {
  isTesting.value = true;
  try {
    const response = await $fetch("/api/auth/saml/login-simple");
    testResults.value = JSON.stringify(response, null, 2);
  } catch (error) {
    testResults.value = `简化登录 API 错误: ${error.message}`;
    errors.value.push(`简化登录 API 测试失败: ${error.message}`);
  } finally {
    isTesting.value = false;
  }
};

// 测试登录 API
const testLoginApi = async () => {
  isTesting.value = true;
  try {
    // 登录API会返回重定向，所以我们需要处理重定向响应
    const response = await $fetch("/api/auth/saml/login", {
      method: "GET",
      redirect: "manual",
    });

    if (response.status === 302 || response.status === 307) {
      testResults.value = `登录 API 成功，重定向到: ${
        response.headers?.get("location") || "未知位置"
      }`;
    } else {
      testResults.value = JSON.stringify(response, null, 2);
    }
  } catch (error) {
    testResults.value = `登录 API 错误: ${error.message}`;
    errors.value.push(`登录 API 测试失败: ${error.message}`);
  } finally {
    isTesting.value = false;
  }
};

// 测试用户 API
const testUserApi = async () => {
  isTesting.value = true;
  try {
    const response = await $fetch("/api/auth/user");
    testResults.value = JSON.stringify(response, null, 2);
  } catch (error) {
    testResults.value = `用户 API 错误: ${error.message}`;
    errors.value.push(`用户 API 测试失败: ${error.message}`);
  } finally {
    isTesting.value = false;
  }
};

// 页面加载时检查环境变量
onMounted(() => {
  checkEnvVars();
});

// 设置页面元数据
useHead({
  title: "调试页面 - SAML SSO 测试平台",
});
</script>
