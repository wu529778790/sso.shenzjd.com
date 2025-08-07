export default defineEventHandler(async (event) => {
  console.log("=== 基础登录API测试 ===");

  try {
    // 最基本的响应，不依赖任何外部库
    return {
      status: "success",
      message: "基础登录API正常工作",
      timestamp: new Date().toISOString(),
      url: getRequestURL(event).toString(),
      method: getMethod(event),
      headers: {
        host: getHeader(event, "host"),
        "user-agent": getHeader(event, "user-agent"),
      },
    };
  } catch (error) {
    console.error("基础登录API错误:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "未知错误",
      timestamp: new Date().toISOString(),
    };
  }
});
