export default defineEventHandler(async (event) => {
  try {
    // Clear user session
    await clearUserSession(event);

    // Redirect to home page
    await sendRedirect(event, "/");
  } catch (error) {
    console.error("Logout error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Logout failed",
    });
  }
});
