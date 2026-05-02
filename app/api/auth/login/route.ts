import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { comparePassword, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const isValid = await comparePassword(
      password,
      user.password
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const token = createToken(user.id);

    const res = NextResponse.json({ success: true });

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}