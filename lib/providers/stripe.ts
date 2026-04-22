import { getRequiredEnv } from "@/lib/env";
import { normalizeStripeResponse } from "@/lib/rate-limit/adapters";
import type { ProviderCallResult } from "@/lib/rate-limit/types";

export async function callStripe(): Promise<ProviderCallResult> {
  const endpoint = "https://api.stripe.com/v1/balance";
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${getRequiredEnv("STRIPE_SECRET_KEY")}`
    },
    cache: "no-store"
  });

  return {
    log: normalizeStripeResponse(response, endpoint)
  };
}
