import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  console.log(
    `Proxy middleware: path=${nextUrl.pathname} loggedIn=${isLoggedIn}`,
  );

  const isAuthPage = nextUrl.pathname.startsWith("/login");
  const isDashboard =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/users") ||
    nextUrl.pathname.startsWith("/payments") ||
    nextUrl.pathname.startsWith("/forms");

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
