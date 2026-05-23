import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// On Vercel, use the custom domain (NEXT_PUBLIC_APP_URL) if set,
// otherwise fall back to the auto-generated deployment URL.
if (process.env.VERCEL_URL && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    `https://${process.env.VERCEL_URL}`;
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
