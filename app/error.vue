<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full mx-auto">
      <div class="card text-center">
        <div
          class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            class="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          {{ error.statusCode === 404 ? "页面未找到" : "出现错误" }}
        </h1>

        <p class="text-gray-600 mb-6">
          {{
            error.statusCode === 404
              ? "抱歉，您访问的页面不存在。"
              : error.statusMessage || "服务器遇到了一个错误，请稍后再试。"
          }}
        </p>

        <div
          v-if="error.statusCode !== 404"
          class="bg-gray-50 rounded-md p-4 mb-6">
          <p class="text-sm text-gray-600">
            <strong>错误代码:</strong> {{ error.statusCode }}<br />
            <strong>错误信息:</strong> {{ error.statusMessage }}
          </p>
        </div>

        <div class="space-y-3">
          <button @click="handleError" class="w-full btn btn-primary">
            {{ error.statusCode === 404 ? "返回首页" : "重试" }}
          </button>

          <button
            @click="goHome"
            class="w-full btn btn-secondary"
            v-if="error.statusCode !== 404">
            返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const handleError = () => {
  if (props.error.statusCode === 404) {
    navigateTo("/");
  } else {
    clearError({ redirect: "/" });
  }
};

const goHome = () => {
  navigateTo("/");
};

// 设置页面元数据
useHead({
  title: `错误 ${props.error.statusCode} - SAML SSO 测试平台`,
});
</script>
