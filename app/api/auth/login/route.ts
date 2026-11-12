import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { fail } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user =
      typeof email === "string" && typeof password === "string"
        ? await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
        : null;
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return fail("Invalid email or password", 401);
    await createSession(user.id);
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (e) {
    return fail(e);
  }
}
