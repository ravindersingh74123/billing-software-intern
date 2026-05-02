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
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };
  } catch {
    return null;
  }
}

// 🔹 GET SINGLE
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findFirst({
    where: {
      id: params.id,
      userId: user.userId,
    },
  });

  return NextResponse.json(customer);
}

// 🔹 UPDATE
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const updated = await prisma.customer.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(updated);
}


export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔥 Optional but recommended: prevent delete if used in invoices
    const used = await prisma.invoice.findFirst({
      where: { customerId: id },
    });

    if (used) {
      return NextResponse.json(
        { error: "Customer is used in invoices" },
        { status: 400 }
      );
    }

    await prisma.customer.deleteMany({
      where: {
        id,
        userId: user.userId,
      },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("DELETE /customers/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}