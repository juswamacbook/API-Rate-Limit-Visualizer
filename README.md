# API Rate Limit Visualizer

Week 2 goal: add a provider adapter layer before building UI.

The app exposes server routes that call GitHub, OpenAI, Stripe, and Google Maps,
normalize each provider's rate-limit signals, and save rows to one Supabase
`usage_logs` table.

## Week 2 Checklist

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in the values.
4. Install dependencies with `npm install`.
5. Start Next.js with `npm run dev`.
6. Visit `http://localhost:3000/api/usage-logs/github`.
7. Visit the other provider routes as you add keys.
8. Confirm rows appear in `usage_logs`.

## Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GITHUB_TOKEN=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
GOOGLE_MAPS_API_KEY=
```

`GITHUB_TOKEN` is optional for the first test. The OpenAI, Stripe, and Google
Maps routes require their matching API keys.

## Supabase Table

All providers write to one normalized table:

- `provider`: API provider name, currently `github`
- `service`: sub-service such as `core`, `requests`, `api`, or `geocoding`
- `endpoint`: URL called by the server route
- `status_code`: HTTP response status
- `limit_count`: provider limit when exposed
- `remaining_count`: provider remaining quota when exposed
- `used_count`: provider used count when exposed
- `reset_at`: absolute reset time when exposed
- `reset_after_ms`: relative reset duration when exposed
- `quota_type`: provider-specific limiter category
- `quota_unit`: requests, tokens, QPM, concurrency, etc.
- `rate_limited`: whether this response indicates throttling
- `rate_limit_reason`: provider-specific throttling reason
- `response_headers`: selected raw headers for debugging
- `response_body`: selected response body fields for providers that report quota
  through JSON status codes

## Test Endpoints

```bash
curl http://localhost:3000/api/usage-logs/github
curl http://localhost:3000/api/usage-logs/openai
curl http://localhost:3000/api/usage-logs/stripe
curl http://localhost:3000/api/usage-logs/google-maps
```

Expected response:

```json
{
  "ok": true,
  "provider": "github",
  "saved": {
    "id": "...",
    "remaining_count": 59
  }
}
```

## Next Steps

1. Add unit tests for each adapter with recorded sample headers.
2. Add a small internal page to trigger and inspect saved logs.
3. Capture multiple quota dimensions per call where providers expose them.
4. Build the visual dashboard after the stored data shape is stable.
