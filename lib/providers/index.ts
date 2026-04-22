import { callGitHub } from "@/lib/providers/github";
import { callGoogleMaps } from "@/lib/providers/google-maps";
import { callOpenAI } from "@/lib/providers/openai";
import { callStripe } from "@/lib/providers/stripe";
import type { Provider, ProviderCallResult } from "@/lib/rate-limit/types";

const providerCalls: Record<Provider, () => Promise<ProviderCallResult>> = {
  github: callGitHub,
  openai: callOpenAI,
  stripe: callStripe,
  "google-maps": callGoogleMaps
};

export function isProvider(value: string): value is Provider {
  return value in providerCalls;
}

export function callProvider(provider: Provider) {
  return providerCalls[provider]();
}

export const providers = Object.keys(providerCalls) as Provider[];
