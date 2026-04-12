// ─── proxy.ts — Next.js 16 middleware (preview password gate) ───

import { type NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Preview-salasanasuojaus (koko sivusto)
  if (process.env.PREVIEW_PASSWORD) {
    const token = request.cookies.get("preview-token")?.value;
    if (token !== process.env.PREVIEW_PASSWORD) {
      // Salli preview-auth sivu ja API
      if (
        !pathname.startsWith("/preview-auth") &&
        !pathname.startsWith("/api/preview-auth")
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/preview-auth";
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
