export function parseIntegerHeader(headers: Headers, name: string) {
  const value = headers.get(name);
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseEpochSeconds(value: number | null) {
  if (!value) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

export function parseRetryAfterMs(headers: Headers) {
  const retryAfter = headers.get("retry-after");
  if (!retryAfter) {
    return null;
  }

  const seconds = Number.parseInt(retryAfter, 10);
  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }

  const date = Date.parse(retryAfter);
  if (Number.isNaN(date)) {
    return null;
  }

  return Math.max(date - Date.now(), 0);
}

export function parseOpenAIDurationMs(value: string | null) {
  if (!value) {
    return null;
  }

  const matches = value.matchAll(/(\d+(?:\.\d+)?)(ms|s|m|h)/g);
  let total = 0;
  let matched = false;

  for (const match of matches) {
    matched = true;
    const amount = Number.parseFloat(match[1]);
    const unit = match[2];

    if (unit === "ms") {
      total += amount;
    } else if (unit === "s") {
      total += amount * 1000;
    } else if (unit === "m") {
      total += amount * 60 * 1000;
    } else if (unit === "h") {
      total += amount * 60 * 60 * 1000;
    }
  }

  return matched ? Math.round(total) : null;
}

export function pickHeaders(headers: Headers, names: string[]) {
  return Object.fromEntries(names.map((name) => [name, headers.get(name)]));
}
