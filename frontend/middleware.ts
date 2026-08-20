import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;

  const isAuthenticated = Boolean(token);

  const isProtectedRoute = pathname.startsWith("/dashboard");

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register";

  const isHomeRoute = pathname === "/";

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(
      new URL("/dashboard/projects", request.url)
    );
  }

  if (isAuthenticated && isHomeRoute) {
    return NextResponse.redirect(
      new URL("/dashboard/projects", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};







