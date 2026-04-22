import { normalizeGitHubResponse } from "@/lib/rate-limit/adapters";
import type { ProviderCallResult } from "@/lib/rate-limit/types";

export async function callGitHub(): Promise<ProviderCallResult> {
  const endpoint = "https://api.github.com/rate_limit";
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(endpoint, {
    headers,
    cache: "no-store"
  });

  return {
    log: normalizeGitHubResponse(response, endpoint)
  };
}
