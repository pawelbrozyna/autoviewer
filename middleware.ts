import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ACCESS_KEY } from "@/lib/analytics-exclusion";
import { robotsHeaderValue } from "@/lib/seo/indexing";

const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function withAdminCookie(
  response: NextResponse,
  enabled: boolean,
): NextResponse {
  if (enabled) {
    response.cookies.set({
      name: ADMIN_ACCESS_KEY,
      value: "true",
      path: "/",
      sameSite: "lax",
      maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
    });
  } else {
    response.cookies.set({
      name: ADMIN_ACCESS_KEY,
      value: "",
      path: "/",
      sameSite: "lax",
      maxAge: 0,
    });
  }
  return response;
}

function withRobotsHeader(
  response: NextResponse,
  pathname: string,
): NextResponse {
  const value = robotsHeaderValue(pathname);
  if (value) response.headers.set("X-Robots-Tag", value);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const adminParam = searchParams.get("admin");

  if (adminParam === "true" || adminParam === "false") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("admin");
    return withAdminCookie(NextResponse.redirect(url), adminParam === "true");
  }

  if (pathname === "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return withRobotsHeader(NextResponse.next(), pathname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
