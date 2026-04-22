import { getRequiredEnv } from "@/lib/env";
import { normalizeOpenAIResponse } from "@/lib/rate-limit/adapters";
import type { ProviderCallResult } from "@/lib/rate-limit/types";

export async function callOpenAI(): Promise<ProviderCallResult> {
  const endpoint = "https://api.openai.com/v1/models";
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${getRequiredEnv("OPENAI_API_KEY")}`
    },
    cache: "no-store"
  });

  return {
    log: normalizeOpenAIResponse(response, endpoint)
  };
}
