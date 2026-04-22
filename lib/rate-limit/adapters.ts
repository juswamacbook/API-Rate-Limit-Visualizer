import {
  parseEpochSeconds,
  parseIntegerHeader,
  parseOpenAIDurationMs,
  parseRetryAfterMs,
  pickHeaders
} from "@/lib/rate-limit/parsers";
import type { UsageLogInsert } from "@/lib/rate-limit/types";

const githubHeaderNames = [
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
  "x-ratelimit-resource",
  "x-ratelimit-used",
  "x-github-request-id"
];

const openAIHeaderNames = [
  "x-ratelimit-limit-requests",
  "x-ratelimit-limit-tokens",
  "x-ratelimit-remaining-requests",
  "x-ratelimit-remaining-tokens",
  "x-ratelimit-reset-requests",
  "x-ratelimit-reset-tokens",
  "x-request-id",
  "openai-processing-ms"
];

const stripeHeaderNames = [
  "request-id",
  "stripe-rate-limited-reason",
  "retry-after",
  "stripe-version"
];

const googleMapsHeaderNames = [
  "content-type",
  "server",
  "x-request-id",
  "retry-after"
];

export function normalizeGitHubResponse(response: Response, endpoint: string): UsageLogInsert {
  const resetEpoch = parseIntegerHeader(response.headers, "x-ratelimit-reset");

  return {
    provider: "github",
    service: response.headers.get("x-ratelimit-resource"),
    endpoint,
    method: "GET",
    status_code: response.status,
    limit_count: parseIntegerHeader(response.headers, "x-ratelimit-limit"),
    remaining_count: parseIntegerHeader(response.headers, "x-ratelimit-remaining"),
    used_count: parseIntegerHeader(response.headers, "x-ratelimit-used"),
    reset_at: parseEpochSeconds(resetEpoch),
    reset_after_ms: null,
    quota_type: response.headers.get("x-ratelimit-resource"),
    quota_unit: "requests/hour",
    rate_limited: response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0",
    rate_limit_reason: null,
    request_id: response.headers.get("x-github-request-id"),
    provider_status: null,
    response_headers: pickHeaders(response.headers, githubHeaderNames),
    response_body: null
  };
}

export function normalizeOpenAIResponse(response: Response, endpoint: string): UsageLogInsert {
  return {
    provider: "openai",
    service: "requests",
    endpoint,
    method: "GET",
    status_code: response.status,
    limit_count: parseIntegerHeader(response.headers, "x-ratelimit-limit-requests"),
    remaining_count: parseIntegerHeader(response.headers, "x-ratelimit-remaining-requests"),
    used_count: null,
    reset_at: null,
    reset_after_ms: parseOpenAIDurationMs(response.headers.get("x-ratelimit-reset-requests")),
    quota_type: "requests",
    quota_unit: "requests/minute",
    rate_limited: response.status === 429,
    rate_limit_reason: response.status === 429 ? "rate_limit_exceeded" : null,
    request_id: response.headers.get("x-request-id"),
    provider_status: null,
    response_headers: pickHeaders(response.headers, openAIHeaderNames),
    response_body: null
  };
}

export function normalizeStripeResponse(response: Response, endpoint: string): UsageLogInsert {
  const reason = response.headers.get("stripe-rate-limited-reason");

  return {
    provider: "stripe",
    service: "api",
    endpoint,
    method: "GET",
    status_code: response.status,
    limit_count: null,
    remaining_count: null,
    used_count: null,
    reset_at: null,
    reset_after_ms: parseRetryAfterMs(response.headers),
    quota_type: reason,
    quota_unit: reason?.includes("concurrency") ? "concurrency" : "requests/second",
    rate_limited: response.status === 429 && Boolean(reason),
    rate_limit_reason: reason,
    request_id: response.headers.get("request-id"),
    provider_status: null,
    response_headers: pickHeaders(response.headers, stripeHeaderNames),
    response_body: null
  };
}

export function normalizeGoogleMapsResponse(
  response: Response,
  endpoint: string,
  body: Record<string, unknown> | null
): UsageLogInsert {
  const providerStatus = typeof body?.status === "string" ? body.status : null;
  const errorMessage = typeof body?.error_message === "string" ? body.error_message : null;
  const rateLimited = response.status === 429 || providerStatus === "OVER_QUERY_LIMIT";

  return {
    provider: "google-maps",
    service: "geocoding",
    endpoint,
    method: "GET",
    status_code: response.status,
    limit_count: null,
    remaining_count: null,
    used_count: null,
    reset_at: null,
    reset_after_ms: parseRetryAfterMs(response.headers),
    quota_type: "qpm",
    quota_unit: "queries/minute",
    rate_limited: rateLimited,
    rate_limit_reason: rateLimited ? providerStatus ?? "rate_limited" : null,
    request_id: response.headers.get("x-request-id"),
    provider_status: providerStatus,
    response_headers: pickHeaders(response.headers, googleMapsHeaderNames),
    response_body: {
      status: providerStatus,
      error_message: errorMessage
    }
  };
}
