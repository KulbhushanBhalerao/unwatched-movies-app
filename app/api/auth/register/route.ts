import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { fail } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email))
      return fail("Enter a valid email", 400);
    if (typeof password !== "string" || password.length < 8)
      return fail("Password must be at least 8 characters", 400);
    const normalized = email.trim().toLowerCase();
    if (await prisma.user.findUnique({ where: { email: normalized } }))
      return fail("Email already registered", 409);
    const user = await prisma.user.create({
      data: { email: normalized, passwordHash: await bcrypt.hash(password, 10) },
    });
    await createSession(user.id);
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (e) {
    return fail(e);
  }
}
