export type Provider = "github" | "openai" | "stripe" | "google-maps";

export type UsageLogInsert = {
  provider: Provider;
  service: string | null;
  endpoint: string;
  method: string;
  status_code: number;
  limit_count: number | null;
  remaining_count: number | null;
  used_count: number | null;
  reset_at: string | null;
  reset_after_ms: number | null;
  quota_type: string | null;
  quota_unit: string | null;
  rate_limited: boolean;
  rate_limit_reason: string | null;
  request_id: string | null;
  provider_status: string | null;
  response_headers: Record<string, string | null>;
  response_body: Record<string, unknown> | null;
};

export type ProviderCallResult = {
  log: UsageLogInsert;
};
