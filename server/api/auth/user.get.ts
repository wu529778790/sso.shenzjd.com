export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event);

    if (!session || !session.authenticated) {
      return {
        data: {
          authenticated: false,
          user: null,
        },
      };
    }

    return {
      data: {
        authenticated: true,
        user: session.user,
        loginTime: session.loginTime,
      },
    };
  } catch (error) {
    console.error("Get user error:", error);
    return {
      data: {
        authenticated: false,
        user: null,
      },
    };
  }
});
