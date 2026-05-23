import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    const res = NextResponse.next();
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  },
  {
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
