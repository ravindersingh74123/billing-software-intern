import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "./components/TopBar";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Billing App",
  description: "Billing Dashboard",
};

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
      };

      // 🔥 fetch user from DB (better approach)
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          name: true,
          email: true,
        },
      });

      if (dbUser) {
        user = dbUser;
      }
    }
  } catch {
    user = null;
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {user && <TopBar user={user} />}
        {children}
      </body>
    </html>
  );
}