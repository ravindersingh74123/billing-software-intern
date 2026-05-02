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

// 🔹 CREATE INVOICE
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

    // ✅ basic validation
    if (!body.customerId || !body.invoiceNo || !body.items?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId: user.userId,
        customerId: body.customerId,
        invoiceNo: body.invoiceNo,
        issueDate: new Date(body.date), // ✅ add date support
        totalAmount: body.total,

        items: {
          create: body.items.map((i: any) => ({
            itemId: i.itemId || null, // optional relation
            name: i.name,
            price: i.rate,
            quantity: i.quantity,
            total: i.amount,
          })),
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });

  } catch (err) {
    console.error("POST /invoices error:", err);

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

// 🔹 GET INVOICES
export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.userId },

      include: {
        customer: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },

      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices, { status: 200 });

  } catch (err) {
    console.error("GET /invoices error:", err);

    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}