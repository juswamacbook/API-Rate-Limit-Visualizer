import { NextResponse } from "next/server";
import { callProvider, isProvider, providers } from "@/lib/providers";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { provider } = await context.params;

    if (!isProvider(provider)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Unsupported provider: ${provider}`,
          providers
        },
        { status: 404 }
      );
    }

    const { log } = await callProvider(provider);
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("usage_logs")
      .insert(log)
      .select(
        "id, provider, service, endpoint, status_code, limit_count, remaining_count, reset_at, reset_after_ms, rate_limited, rate_limit_reason, created_at"
      )
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: "Provider request completed, but saving to Supabase failed.",
          error: error.message,
          log
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      provider,
      saved: data
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}
