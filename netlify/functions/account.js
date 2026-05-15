import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAdmin;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS"
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env vars are not configured");
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return supabaseAdmin;
}

function bearerToken(event) {
  const header = event.headers.authorization || event.headers.Authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

async function requireUser(event) {
  const token = bearerToken(event);
  if (!token) throw Object.assign(new Error("Authentication required"), { statusCode: 401 });
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data?.user) throw Object.assign(new Error("Authentication required"), { statusCode: 401 });
  return { token, authUser: data.user, id: data.user.id, email: data.user.email || "" };
}

async function accountPayload(event) {
  const user = await requireUser(event);
  const client = getSupabaseAdmin();
  const [profile, scenarios] = await Promise.all([
    client.from("users").select("id,email,created_at,updated_at").eq("id", user.id).maybeSingle(),
    client
      .from("scenarios")
      .select("id,name,derived,is_public,share_id,created_at,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50)
  ]);
  if (profile.error) throw profile.error;
  if (scenarios.error) throw scenarios.error;

  return json(200, {
    user: {
      id: user.id,
      email: profile.data?.email || user.email,
      createdAt: profile.data?.created_at || user.authUser.created_at || null
    },
    newsletterStatus: "Subscribed status lives in Beehiiv",
    scenarios: (scenarios.data || []).map(row => ({
      id: row.id,
      name: row.name || "Untitled scenario",
      isPublic: Boolean(row.is_public),
      shareId: row.share_id || null,
      aspireRate: row.derived?.aspireRate ?? null,
      aspireGap: row.derived?.aspireGap ?? null,
      updatedAt: row.updated_at,
      createdAt: row.created_at
    }))
  });
}

async function deleteAccount(event) {
  const user = await requireUser(event);
  const client = getSupabaseAdmin();
  const emailHash = crypto.createHash("sha256").update(String(user.email || "").toLowerCase()).digest("hex");

  const audit = await client.from("account_deletions").insert({ email_sha256: emailHash });
  if (audit.error) throw audit.error;

  await client.from("baseline_overrides").delete().eq("user_id", user.id);
  await client.from("calculator_states").delete().eq("user_id", user.id);
  await client.from("scenarios").delete().eq("user_id", user.id);
  await client.from("users").delete().eq("id", user.id);
  await client.auth.admin.signOut(user.token, "global");
  const deleted = await client.auth.admin.deleteUser(user.id);
  if (deleted.error) throw deleted.error;

  return json(200, { ok: true });
}

export const handler = async event => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    if (event.httpMethod === "GET") return accountPayload(event);
    if (event.httpMethod === "DELETE") return deleteAccount(event);
    return json(405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return json(err.statusCode || 500, { error: err.message || "Account request failed" });
  }
};
