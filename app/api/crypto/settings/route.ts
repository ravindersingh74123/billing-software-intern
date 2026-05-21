import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// ── Auth helper (mirrors transactions route) ──────────────────────────────────
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

// ── GET /api/crypto/settings ──────────────────────────────────────────────────
// Returns the user's saved settings. Creates default settings on first call.
export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.cryptoPortfolioSettings.upsert({
      where: { userId: user.userId },
      update: {},   // no-op on existing row
      create: {
        userId: user.userId,
        taxRate: 30,
        tdsRate: 1,
        currentPrices: {},
      },
    });

    return NextResponse.json(settings, { status: 200 });
  } catch (err) {
    console.error("GET /crypto/settings error:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// ── PATCH /api/crypto/settings ────────────────────────────────────────────────
// Persists taxRate, tdsRate, and/or currentPrices.
export async function PATCH(req: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Only accept the three known fields; ignore everything else.
    const data: {
      taxRate?: number;
      tdsRate?: number;
      currentPrices?: Record<string, number>;
    } = {};

    if (typeof body.taxRate === "number" && isFinite(body.taxRate)) {
      data.taxRate = body.taxRate;
    }
    if (typeof body.tdsRate === "number" && isFinite(body.tdsRate)) {
      data.tdsRate = body.tdsRate;
    }
    if (body.currentPrices && typeof body.currentPrices === "object") {
      data.currentPrices = body.currentPrices;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const settings = await prisma.cryptoPortfolioSettings.upsert({
      where: { userId: user.userId },
      update: data,
      create: {
        userId: user.userId,
        taxRate: data.taxRate ?? 30,
        tdsRate: data.tdsRate ?? 1,
        currentPrices: data.currentPrices ?? {},
      },
    });

    return NextResponse.json(settings, { status: 200 });
  } catch (err) {
    console.error("PATCH /crypto/settings error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
