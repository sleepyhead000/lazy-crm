import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { checkRateLimit, checkLoginLockout, recordFailedLogin, clearFailedLogins } from "@/lib/rate-limit";

const LOGIN_RATE_LIMIT = { windowMs: 60_000, maxRequests: 10 };
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60_000;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "anonymous";

    const rl = checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const lockoutKey = `lockout:${email}`;
    const lockout = checkLoginLockout(lockoutKey, MAX_FAILED_ATTEMPTS, LOCKOUT_DURATION_MS);
    if (!lockout.allowed) {
      const retryAfterSec = Math.ceil(lockout.retryAfterMs / 1000);
      return NextResponse.json(
        { error: `Account temporarily locked. Try again in ${retryAfterSec} seconds.` },
        { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user?.password) {
      recordFailedLogin(lockoutKey, LOCKOUT_DURATION_MS);
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      recordFailedLogin(lockoutKey, LOCKOUT_DURATION_MS);
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    clearFailedLogins(lockoutKey);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
