import { getRequiredEnv } from "@/lib/env";
import { normalizeGoogleMapsResponse } from "@/lib/rate-limit/adapters";
import type { ProviderCallResult } from "@/lib/rate-limit/types";

export async function callGoogleMaps(): Promise<ProviderCallResult> {
  const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  endpoint.searchParams.set("address", "Toronto");
  endpoint.searchParams.set("key", getRequiredEnv("GOOGLE_MAPS_API_KEY"));

  const response = await fetch(endpoint, {
    cache: "no-store"
  });
  const body = await response.json().catch(() => null);

  return {
    log: normalizeGoogleMapsResponse(response, endpoint.origin + endpoint.pathname, body)
  };
}
