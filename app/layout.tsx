import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopBar from "./components/TopBar";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BanavatNest | Billing & Financial Tools",
  description: "Advanced billing and financial planning solutions.",
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
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme"),s=window.matchMedia("(prefers-color-scheme: dark)").matches===!0;if("dark"===t||(!t&&s))document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark")}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {user && <TopBar user={user} />}
        {children}
      </body>
    </html>
  );
}