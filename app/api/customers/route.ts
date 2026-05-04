import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// 🔹 helper (inline, not separate file)
async function getUserFromRequest() {
  const cookieStore = await cookies(); // ✅ FIX

  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };

    return decoded;
  } catch {
    return null;
  }
}

// 🔹 CREATE CUSTOMER
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      companyName,
      displayName,
      primaryContact,
      email,
      pan,
      gstin,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      bankName,
      accountName,
      accountNumber,
      ifsc,
    } = body;

    if (!displayName) {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 },
      );
    }

    // ✅ auth check
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.create({
      data: {
        companyName,
        displayName,
        primaryContact,
        email,
        pan,
        gstin,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        bankName,
        accountName,
        accountNumber,
        ifsc,
        userId: user.userId,
      },
    });

    return NextResponse.json(customer);
  } catch (err) {
    console.error("POST /customers error:", err);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}

// 🔹 GET CUSTOMERS
export async function GET() {
  try {
    // ✅ auth check (FIXED)
    const user = await getUserFromRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(customers);
  } catch (err) {
    console.error("GET /customers error:", err);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}
