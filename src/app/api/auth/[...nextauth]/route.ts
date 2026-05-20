import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// On Vercel, always use the deployment URL for NextAuth
if (process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
