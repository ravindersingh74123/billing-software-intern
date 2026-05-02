import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };

    if (!decoded?.userId) {
      redirect("/login");
    }

    // ✅ user is logged in
    redirect("/dashboard");

  } catch {
    // invalid token
    redirect("/login");
  }
}