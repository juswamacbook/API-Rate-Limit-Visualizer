# API Rate Limit Visualizer

A Next.js + Supabase project for collecting API rate-limit signals from multiple
providers and saving them in one normalized table.

The long-term product is a visual dashboard. The current milestone is backend
foundation: prove that provider requests work, headers can be normalized, and
logs are stored consistently.

## Current Scope

Week 1 proved the first pipeline with GitHub.

Week 2 adds an adapter layer for:

- GitHub
- OpenAI
- Stripe
- Google Maps

Each provider reports rate-limit information differently, so the app maps each
response into one shared `usage_logs` shape.

## Tech Stack

- Next.js App Router
- TypeScript
- Supabase Postgres
- Supabase JS client

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project.

3. Run the schema in Supabase SQL Editor:

```sql
-- Use the contents of supabase/schema.sql
```

Supabase should show:

```text
Success. No rows returned
```

That is expected. The schema creates the table; it does not insert data.

4. Create `.env` or `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GITHUB_TOKEN=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
GOOGLE_MAPS_API_KEY=
```

5. Start the dev server:

```bash
npm run dev
```

6. Open:

```text
http://localhost:3000
```

## Important Env Notes

`NEXT_PUBLIC_SUPABASE_URL`

Find this in Supabase under **Project Settings > API > Project URL**.

`SUPABASE_SERVICE_ROLE_KEY`

Find this in Supabase under **Project Settings > API**. Use the
`service_role` key, not the anon key and not a publishable key.

This project inserts rows from a server route while row level security is
enabled. The anon/publishable key will fail with:

```text
new row violates row-level security policy for table "usage_logs"
```

`GITHUB_TOKEN`

Optional for the GitHub route, but recommended because it raises the GitHub rate
limit.

`OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `GOOGLE_MAPS_API_KEY`

Required only when testing those provider routes.

Never commit real API keys. `.env` is ignored by Git.

## Supabase Table

All provider calls write to:

```text
usage_logs
```

Main columns:

- `provider`: `github`, `openai`, `stripe`, or `google-maps`
- `service`: provider sub-service, such as `core`, `requests`, `api`, or
  `geocoding`
- `endpoint`: URL called by the adapter
- `method`: HTTP method
- `status_code`: provider response status
- `limit_count`: quota limit when exposed
- `remaining_count`: remaining quota when exposed
- `used_count`: used quota when exposed
- `reset_at`: absolute reset timestamp when exposed
- `reset_after_ms`: relative reset duration when exposed
- `quota_type`: provider-specific limiter category
- `quota_unit`: requests, tokens, QPM, concurrency, etc.
- `rate_limited`: whether the provider throttled the request
- `rate_limit_reason`: provider-specific throttling reason
- `request_id`: provider request ID when available
- `provider_status`: provider-specific status, used by Google Maps
- `response_headers`: selected raw headers for debugging
- `response_body`: selected response body fields for providers that report quota
  through JSON

## API Routes

List configured provider routes:

```bash
curl http://localhost:3000/api/usage-logs
```

Run the GitHub adapter:

```bash
curl http://localhost:3000/api/usage-logs/github
```

Run the other adapters:

```bash
curl http://localhost:3000/api/usage-logs/openai
curl http://localhost:3000/api/usage-logs/stripe
curl http://localhost:3000/api/usage-logs/google-maps
```

## Expected GitHub Response

Successful insert:

```json
{
  "ok": true,
  "provider": "github",
  "saved": {
    "id": "...",
    "provider": "github",
    "service": "core",
    "status_code": 200,
    "limit_count": 5000,
    "remaining_count": 4974,
    "rate_limited": false
  }
}
```

`rate_limited: false` is good. It means GitHub accepted the request and you
still have quota remaining.

## Provider Behavior

GitHub exposes clear rate-limit headers:

- `x-ratelimit-limit`
- `x-ratelimit-remaining`
- `x-ratelimit-used`
- `x-ratelimit-reset`
- `x-ratelimit-resource`

OpenAI exposes request and token quota headers, such as:

- `x-ratelimit-limit-requests`
- `x-ratelimit-remaining-requests`
- `x-ratelimit-reset-requests`
- `x-ratelimit-limit-tokens`
- `x-ratelimit-remaining-tokens`

Stripe mainly identifies rate limiting on `429` responses with:

- `Stripe-Rate-Limited-Reason`

Google Maps Geocoding reports quota problems through JSON statuses such as:

- `OVER_QUERY_LIMIT`

Because providers expose different signals, some normalized fields are expected
to be `null`.

## Troubleshooting

### `new row violates row-level security policy`

Your app is probably using the Supabase anon or publishable key instead of the
service role key.

Fix:

1. Go to Supabase **Project Settings > API**.
2. Copy the `service_role` key.
3. Put it in `SUPABASE_SERVICE_ROLE_KEY`.
4. Restart `npm run dev`.

### `Could not find the table 'public.usage_logs'`

Run `supabase/schema.sql` in Supabase SQL Editor, then call the route again.

If you just created the table and still see this error, wait a few seconds for
Supabase's API schema cache to refresh.

### Provider route returns `ok: false` but includes a `log`

That means the provider request worked, but saving to Supabase failed. Read the
`error` field in the response.

### Provider route says an API key is missing

Add the matching key to `.env` and restart the dev server.

## Useful Files

- `app/api/usage-logs/[provider]/route.ts`: shared route for all providers
- `lib/providers`: provider-specific API calls
- `lib/rate-limit/adapters.ts`: normalization logic
- `supabase/schema.sql`: database schema
- `.env.example`: environment variable template

## Next Steps

1. Add unit tests for each adapter with sample provider headers.
2. Add a small internal page to trigger provider calls.
3. Add a table view for recent `usage_logs`.
4. Build visualizations once the stored data shape is stable.
