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

// 🔹 CREATE TRANSACTION
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

    if (!body.type || !body.coin || body.quantity === undefined || body.price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.userId,
        type: body.type,
        coin: body.coin,
        quantity: Number(body.quantity),
        price: Number(body.price),
        fee: Number(body.fee) || 0,
        date: new Date(body.date),
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    console.error("POST /crypto/transactions error:", err);

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

// 🔹 GET TRANSACTIONS
export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.userId },
      orderBy: { date: "asc" }, // Crucial for FIFO
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch (err) {
    console.error("GET /crypto/transactions error:", err);

    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
