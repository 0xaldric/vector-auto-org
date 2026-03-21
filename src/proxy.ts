import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname.startsWith("/login");
  const isProtected =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/users") ||
    nextUrl.pathname.startsWith("/payments") ||
    nextUrl.pathname.startsWith("/forms") ||
    nextUrl.pathname.startsWith("/credits") ||
    nextUrl.pathname.startsWith("/merchants");

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
