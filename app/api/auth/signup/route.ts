import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    const token = createToken(user.id);

    const res = NextResponse.json({ success: true });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
    });

    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}