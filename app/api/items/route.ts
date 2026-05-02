import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// 🔹 Auth helper
async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// 🔹 CREATE ITEM
export async function POST(req: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // ✅ validation
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        name: body.name,
        price: Number(body.price),
        unit: body.unit || null,
        description: body.description || null,
        userId: user.userId,
      },
    });

    return NextResponse.json(item, { status: 201 });

  } catch (err) {
    console.error("POST /items error:", err);

    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}

// 🔹 GET ITEMS
export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const items = await prisma.item.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items, { status: 200 });

  } catch (err) {
    console.error("GET /items error:", err);

    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}