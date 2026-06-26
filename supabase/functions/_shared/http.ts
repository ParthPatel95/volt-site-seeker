// Shared HTTP response helpers for Supabase edge functions.
//
// `errorResponse` exists to stop internal error detail (stack traces, raw
// Postgres/SQL errors, upstream-API messages, internal hostnames) from
// leaking to HTTP clients. Before the 2026-06 audit, ~130 functions returned
// `{ error: err.message }` straight to the caller, which is an information-
// disclosure vector. This helper logs the *real* error server-side (visible
// in the function logs) and returns only a generic, caller-safe message plus
// an optional stable `code` the frontend can switch on.
//
// Usage:
//   } catch (err) {
//     return errorResponse(err, corsHeaders);                 // 500, generic
//     return errorResponse(err, corsHeaders, { status: 400, message: 'Invalid input' });
//     return errorResponse(err, corsHeaders, { status: 404, code: 'not_found' });
//   }
//
// Pass a `message` only when it is safe to show the caller (validation text,
// "not found", etc.). Never pass the raw error string.

type CorsHeaders = Record<string, string>;

interface ErrorResponseOptions {
  /** HTTP status. Defaults to 500. */
  status?: number;
  /** Caller-safe message. Must NOT contain internal detail. */
  message?: string;
  /** Stable machine-readable code for the frontend. */
  code?: string;
  /** Optional context label for the server-side log line. */
  context?: string;
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Bad request',
  401: 'Unauthenticated',
  403: 'Forbidden',
  404: 'Not found',
  409: 'Conflict',
  429: 'Too many requests',
  500: 'Internal server error',
  502: 'Upstream service error',
  503: 'Service unavailable',
};

export function errorResponse(
  err: unknown,
  corsHeaders: CorsHeaders,
  opts: ErrorResponseOptions = {},
): Response {
  const status = opts.status ?? 500;
  const message = opts.message ?? DEFAULT_MESSAGES[status] ?? 'Internal server error';

  // Always log the real error server-side for debugging — this is the only
  // place the detail should ever appear.
  const label = opts.context ? `[${opts.context}]` : '[error]';
  const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
  console.error(label, detail);

  const body: Record<string, unknown> = { error: message };
  if (opts.code) body.code = opts.code;

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Convenience JSON success responder, mirrors the error shape. */
export function jsonResponse(
  body: unknown,
  corsHeaders: CorsHeaders,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
