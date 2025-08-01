import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "your-secret-key-change-this"
);

export interface UserSession {
  user: any;
  authenticated: boolean;
  loginTime: string;
}

export async function setUserSession(event: any, sessionData: UserSession) {
  const jwt = await new SignJWT(sessionData)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  setCookie(event, "session", jwt, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function getUserSession(event: any): Promise<UserSession | null> {
  const token = getCookie(event, "session");

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as UserSession;
  } catch {
    return null;
  }
}

export async function clearUserSession(event: any) {
  deleteCookie(event, "session");
}
