import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ACCESS_KEY } from "@/lib/analytics-exclusion";

const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function isMaintenanceMode(): boolean {
  return process.env.MAINTENANCE_MODE === "true";
}

function hasAdminBypass(request: NextRequest): boolean {
  return request.cookies.get(ADMIN_ACCESS_KEY)?.value === "true";
}

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

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const adminParam = searchParams.get("admin");
  const maintenance = isMaintenanceMode();

  if (adminParam === "true") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("admin");
    return withAdminCookie(NextResponse.redirect(url), true);
  }

  if (adminParam === "false") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("admin");
    if (maintenance) {
      url.pathname = "/maintenance";
      url.search = "";
    }
    return withAdminCookie(NextResponse.redirect(url), false);
  }

  if (!maintenance) {
    if (pathname === "/maintenance") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const bypass = hasAdminBypass(request);

  if (bypass) {
    if (pathname === "/maintenance") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "MAINTENANCE",
          message: "Service temporarily unavailable.",
        },
      },
      { status: 503 },
    );
  }

  if (pathname !== "/maintenance") {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
