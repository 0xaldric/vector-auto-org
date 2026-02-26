import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname.startsWith("/login");
  const isDashboard =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/users") ||
    nextUrl.pathname.startsWith("/payments") ||
    nextUrl.pathname.startsWith("/forms");

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl));
  }

  if (isDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
