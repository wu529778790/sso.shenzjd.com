import { getUserSession } from "../../utils/session";

export default defineEventHandler(async (event) => {
  console.log("=== 用户API请求 ===");
  console.log("请求URL:", getRequestURL(event).toString());
  console.log("请求方法:", getMethod(event));

  try {
    console.log("获取用户会话信息...");
    const session = await getUserSession(event);

    if (!session) {
      console.log("❌ 未找到会话信息");
      return {
        data: {
          authenticated: false,
          user: null,
          message: "未找到会话信息",
        },
      };
    }

    if (!session.authenticated) {
      console.log("❌ 用户未认证");
      return {
        data: {
          authenticated: false,
          user: null,
          message: "用户未认证",
        },
      };
    }

    console.log("✅ 用户已认证，返回用户信息");
    console.log("用户ID:", session.user?.id);
    console.log("用户邮箱:", session.user?.email);
    console.log("登录时间:", session.loginTime);

    return {
      data: {
        authenticated: true,
        user: session.user,
        loginTime: session.loginTime,
        sessionInfo: {
          loginTime: session.loginTime,
          userAgent: getHeader(event, "user-agent"),
          ip:
            getHeader(event, "x-forwarded-for") ||
            getHeader(event, "x-real-ip") ||
            "unknown",
        },
      },
    };
  } catch (error) {
    console.error("❌ 获取用户信息失败:", error);
    console.error(
      "错误堆栈:",
      error instanceof Error ? error.stack : "无堆栈信息"
    );

    return {
      data: {
        authenticated: false,
        user: null,
        error: error instanceof Error ? error.message : "未知错误",
      },
    };
  }
});
