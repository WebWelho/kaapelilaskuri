import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password, redirectTo } = await request.json();

  if (password !== process.env.PREVIEW_PASSWORD) {
    return NextResponse.json({ error: "Väärä salasana" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("preview-token", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 päivää
  });

  if (redirectTo) {
    response.headers.set("x-redirect-to", redirectTo);
  }

  return response;
}
