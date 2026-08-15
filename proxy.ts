import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ENCODED_BACKSLASH = /%5c/gi;
const RAW_BACKSLASH = /\\/g;
const DUPLICATE_SLASH = /\/{2,}/g;

function normalizePathname(pathname: string) {
  const normalized = pathname
    .replace(ENCODED_BACKSLASH, "/")
    .replace(RAW_BACKSLASH, "/")
    .replace(DUPLICATE_SLASH, "/");

  if (normalized.length > 1 && normalized.endsWith("/")) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

export function proxy(request: NextRequest) {
  const rawPathname = new URL(request.url).pathname;

  if (!/%5c/i.test(rawPathname) && !rawPathname.includes("\\")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = normalizePathname(rawPathname);

  return NextResponse.redirect(url, 308);
}
