import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json(
    { message: "Logged out" },
    { status: 200 }
  );

  // 🔥 Clear cookie properly
  res.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0), // expire immediately
  });

  return res;
}