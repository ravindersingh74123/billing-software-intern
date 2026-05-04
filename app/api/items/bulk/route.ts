import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const items = body.items;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    // 🔥 prepare data
    const data = items.map((item: any) => ({
      name: item.name,
      price: Number(item.price),
      unit: item.unit || null,
      description: item.description || null,
      gstRate: item.gstRate || 0,
      hsn: item.hsn || null,
      userId: user.userId,
    }));

    await prisma.item.createMany({
      data,
      skipDuplicates: true, // optional
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Bulk upload error:", err);

    return NextResponse.json(
      { error: "Failed to upload items" },
      { status: 500 }
    );
  }
}