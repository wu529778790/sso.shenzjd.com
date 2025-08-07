import { clearUserSession, getUserSession } from "../../../utils/session";

export default defineEventHandler(async (event) => {
  console.log("=== SAML登出API开始执行 ===");
  console.log("请求URL:", getRequestURL(event).toString());
  console.log("请求方法:", getMethod(event));

  try {
    // 获取当前会话信息（用于日志记录）
    const currentSession = await getUserSession(event);
    if (currentSession && currentSession.authenticated) {
      console.log(
        "当前用户:",
        currentSession.user?.email || currentSession.user?.id || "未知用户"
      );
      console.log("登录时间:", currentSession.loginTime);
    } else {
      console.log("用户未登录，但继续执行登出流程");
    }

    // 清除用户会话
    console.log("清除用户会话...");
    await clearUserSession(event);

    console.log("✅ 用户会话已清除，重定向到首页");

    // 重定向到首页
    await sendRedirect(event, "/?logout=success");
  } catch (error) {
    console.error("❌ 登出过程发生错误:", error);
    console.error(
      "错误堆栈:",
      error instanceof Error ? error.stack : "无堆栈信息"
    );

    // 即使出错也尝试清除会话
    try {
      await clearUserSession(event);
    } catch (clearError) {
      console.error("清除会话时也发生错误:", clearError);
    }

    throw createError({
      statusCode: 500,
      statusMessage: `登出失败: ${
        error instanceof Error ? error.message : "未知错误"
      }`,
    });
  }
});
