//api/items/[id]/route.ts

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

// 🔹 GET ONE
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.item.findFirst({
    where: {
      id,
      userId: user.userId,
    },
  });

  // 🔥 FIX
  if (!item) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(item);
}

// 🔹 UPDATE
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params; // ✅ FIX

  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
  }

  const updated = await prisma.item.update({
    where: { id },
    data: {
      name: body.name,
      price: Number(body.price),
      unit: body.unit || null,
      description: body.description || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const used = await prisma.invoiceItem.findFirst({
      where: { itemId: id },
    });

    if (used) {
      return NextResponse.json(
        { error: "Item is used in invoices" },
        { status: 400 },
      );
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /items/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 },
    );
  }
}
