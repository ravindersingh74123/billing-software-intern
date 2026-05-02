import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// 🔹 Auth helper
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

// 🔹 GET SINGLE INVOICE
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: user.userId,
      },
      include: {
        customer: {
          select: {
            id: true,
            displayName: true,
            pan:true,
            gstin:true
          },
        },
        items: true,
        user: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);

  } catch (err) {
    console.error("GET /invoices/[id] error:", err);

    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// 🔹 UPDATE INVOICE
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.customerId || !body.items?.length) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    // 🔥 delete old items (clean approach)
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        customerId: body.customerId,
        invoiceNo: body.invoiceNo,
        issueDate: new Date(body.date),
        totalAmount: body.total,

        items: {
          create: body.items.map((i: any) => ({
            itemId: i.itemId || null,
            name: i.name,
            price: i.rate,
            quantity: i.quantity,
            total: i.amount,
          })),
        },
      },
    });

    return NextResponse.json(updated);

  } catch (err) {
    console.error("PUT /invoices/[id] error:", err);

    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// 🔹 DELETE INVOICE (optional but useful)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("DELETE /invoices/[id] error:", err);

    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}