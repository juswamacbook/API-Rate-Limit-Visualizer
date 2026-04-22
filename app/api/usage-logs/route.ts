import { NextResponse } from "next/server";
import { providers } from "@/lib/providers";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    providers,
    routes: providers.map((provider) => `/api/usage-logs/${provider}`)
  });
}
