import { Router, type IRouter } from "express";
import { AdminLoginBody } from "../validations/api";

const router: IRouter = Router();

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "aimstorm-admin-secret";
const COOKIE_NAME = "aimstorm_admin";

function makeToken(): string {
  return `${Date.now()}-${SESSION_SECRET}`;
}

function isValidToken(token: string): boolean {
  return token.endsWith(`-${SESSION_SECRET}`);
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password } = parsed.data;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = makeToken();
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ success: true, message: "Login successful" });
});

router.post("/admin/logout", async (_req, res): Promise<void> => {
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true });
});

router.get("/admin/me", async (req, res): Promise<void> => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token || !isValidToken(token)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ authenticated: true });
});

export { isValidToken, COOKIE_NAME };
export default router;
