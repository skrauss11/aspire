import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAnon;
let supabaseAdmin;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function getBaseUrl(event) {
  const host = event.headers.host || event.headers.Host || "aspirerate.com";
  const proto = event.headers["x-forwarded-proto"] || event.headers["X-Forwarded-Proto"] || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function bearerToken(event) {
  const header = event.headers.authorization || event.headers.Authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

function getSupabaseAnon() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase anon env vars are not configured");
  if (!supabaseAnon) {
    supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });
  }
  return supabaseAnon;
}

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase service env vars are not configured");
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return supabaseAdmin;
}

async function requestMagicLink(event, body) {
  const email = normalizeEmail(body.email);
  if (!email || !email.includes("@")) return json(400, { error: "Valid email required" });

  const { error } = await getSupabaseAnon().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getBaseUrl(event)}/account/`,
      shouldCreateUser: true
    }
  });
  if (error) {
    console.error("magic link request failed:", error);
    return json(500, { error: "Unable to send sign-in link" });
  }

  return json(200, { ok: true });
}

async function refreshSession(body) {
  const refreshToken = String(body.refreshToken || "").trim();
  if (!refreshToken) return json(400, { error: "Refresh token required" });
  const { data, error } = await getSupabaseAnon().auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data?.session) return json(401, { error: "Session expired" });
  return json(200, { session: data.session });
}

async function logout(event, body) {
  const token = bearerToken(event);
  if (!token) return json(401, { error: "Authentication required" });
  const scope = body.scope === "local" || body.scope === "others" ? body.scope : "global";
  const { error } = await getSupabaseAdmin().auth.admin.signOut(token, scope);
  if (error) {
    console.error("logout failed:", error);
    return json(500, { error: "Unable to sign out" });
  }
  return json(200, { ok: true });
}

export const handler = async event => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  try {
    if (body.action === "request") return requestMagicLink(event, body);
    if (body.action === "refresh") return refreshSession(body);
    if (body.action === "logout") return logout(event, body);
    return json(400, { error: "Unknown auth action" });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Auth request failed" });
  }
};
