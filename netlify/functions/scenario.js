import crypto from "node:crypto";
import { project } from "../../lib/aspire.js";
import { fromPersisted, toPersisted, validate } from "../../lib/schema.js";
import { decryptJson, encryptJson } from "../../lib/encryption.js";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAX_SCENARIOS = 10;
let supabaseAdmin;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS"
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function getBaseUrl(event) {
  const host = event.headers.host || event.headers.Host || "aspirerate.com";
  const proto = event.headers["x-forwarded-proto"] || event.headers["X-Forwarded-Proto"] || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env vars are not configured");
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdmin;
}

function normalizeEmail(value = "") {
  return String(value).trim().toLowerCase();
}

function toByteaHex(buffer) {
  return `\\x${Buffer.from(buffer).toString("hex")}`;
}

function validToken(token = "") {
  return /^[a-f0-9]{48}$/i.test(token);
}

function cleanName(value = "") {
  const name = String(value || "").trim().slice(0, 80);
  return name || "Untitled scenario";
}

function shareId() {
  return crypto.randomBytes(15).toString("base64url").slice(0, 20);
}

function derivedForScenario(scenario) {
  const metrics = project(scenario.basket.goals, scenario.basket.holdings);
  return {
    score: scenario.score,
    aspireRate: metrics.costRate,
    moneyRate: metrics.moneyRate,
    aspireGap: metrics.gap,
    gap: metrics.gap,
    horizon: metrics.horizon,
    totalGoals: metrics.totalGoals,
    totalAssets: metrics.totalAssets,
    dollarGap: metrics.dollarGap
  };
}

async function ensureUserForEmail(email) {
  const client = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const existing = await client
    .from("users")
    .select("id,email")
    .eq("email", normalized)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data?.id) return existing.data;

  const created = await client.auth.admin.createUser({
    email: normalized,
    email_confirm: true
  });
  if (created.error && !/already/i.test(created.error.message || "")) throw created.error;

  if (created.data?.user?.id) {
    const upserted = await client
      .from("users")
      .upsert({ id: created.data.user.id, email: normalized }, { onConflict: "id" })
      .select("id,email")
      .single();
    if (upserted.error) throw upserted.error;
    return upserted.data;
  }

  const resolved = await client
    .from("users")
    .select("id,email")
    .eq("email", normalized)
    .maybeSingle();
  if (resolved.error) throw resolved.error;
  if (resolved.data?.id) return resolved.data;
  throw new Error("Unable to create or resolve user");
}

async function userForToken(token) {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("scenarios")
    .select("id,user_id,email,users(email)")
    .eq("access_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data?.user_id) return null;
  return {
    id: data.user_id,
    email: data.email || data.users?.email || "",
    sourceScenarioId: data.id
  };
}

async function rowToPayload(row, options = {}) {
  let persisted;
  if (row.levers) {
    const decrypted = await decryptJson(row.levers);
    persisted = {
      version: decrypted.version || 1,
      createdAt: row.created_at,
      score: row.derived?.score ?? row.score,
      basket: decrypted.basket
    };
  } else {
    persisted = {
      version: 1,
      createdAt: row.created_at,
      score: row.score,
      basket: row.basket
    };
  }
  const scenario = fromPersisted(persisted);
  return {
    id: row.id,
    name: row.name || "Untitled scenario",
    token: options.public ? undefined : row.access_token,
    isPublic: Boolean(row.is_public),
    shareId: row.share_id || null,
    shareUrl: row.is_public && row.share_id && options.baseUrl ? `${options.baseUrl}/simulator/s/${row.share_id}` : null,
    aspireRate: row.derived?.aspireRate ?? scenario.basket.computed?.costRate,
    aspireGap: row.derived?.aspireGap ?? scenario.basket.computed?.gap,
    derived: row.derived || null,
    rateSnapshot: row.rate_snapshot || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...scenario
  };
}

async function listScenarios(userId, baseUrl) {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("scenarios")
    .select("id,access_token,name,levers,derived,basket,score,is_public,share_id,created_at,updated_at,rate_snapshot")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(MAX_SCENARIOS);
  if (error) throw error;
  return Promise.all((data || []).map(row => rowToPayload(row, { baseUrl })));
}

async function loadPrivate(event) {
  const token = event.queryStringParameters?.t;
  if (!token || !validToken(token)) return json(400, { error: "Valid scenario token required" });

  const client = getSupabaseAdmin();
  const { data: row, error } = await client
    .from("scenarios")
    .select("id,user_id,access_token,name,levers,derived,basket,score,is_public,share_id,created_at,updated_at,rate_snapshot")
    .eq("access_token", token)
    .maybeSingle();
  if (error) {
    console.error("supabase scenario fetch failed:", error);
    return json(500, { error: "Unable to fetch scenario" });
  }
  if (!row) return json(404, { error: "Scenario not found" });

  client
    .from("scenarios")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("access_token", token)
    .then(({ error: updateError }) => {
      if (updateError) console.error("scenario access timestamp update failed:", updateError);
    });

  try {
    const payload = await rowToPayload(row, { baseUrl: getBaseUrl(event) });
    const scenarios = row.user_id ? await listScenarios(row.user_id, getBaseUrl(event)) : [];
    return json(200, { ...payload, scenarios, maxScenarios: MAX_SCENARIOS });
  } catch (err) {
    console.error("scenario decrypt failed:", err);
    return json(500, { error: "Unable to decrypt scenario" });
  }
}

async function loadPublic(event) {
  const publicId = event.queryStringParameters?.share || event.queryStringParameters?.id;
  if (!publicId || !/^[A-Za-z0-9_-]{16,40}$/.test(publicId)) return json(400, { error: "Valid share id required" });

  const client = getSupabaseAdmin();
  const { data: row, error } = await client
    .from("scenarios")
    .select("id,name,levers,derived,basket,score,is_public,share_id,created_at,updated_at,rate_snapshot")
    .eq("share_id", publicId)
    .eq("is_public", true)
    .maybeSingle();
  if (error) {
    console.error("public scenario fetch failed:", error);
    return json(500, { error: "Unable to fetch shared scenario" });
  }
  if (!row) return json(404, { error: "Shared scenario not found" });

  try {
    return json(200, await rowToPayload(row, { public: true, baseUrl: getBaseUrl(event) }));
  } catch (err) {
    console.error("public scenario decrypt failed:", err);
    return json(500, { error: "Unable to decrypt shared scenario" });
  }
}

async function resolveUser(body) {
  if (body.token) {
    if (!validToken(body.token)) throw Object.assign(new Error("Valid scenario token required"), { statusCode: 400 });
    const user = await userForToken(body.token);
    if (!user) throw Object.assign(new Error("Saved scenario user not found"), { statusCode: 404 });
    return user;
  }
  if (body.email) return ensureUserForEmail(body.email);
  throw Object.assign(new Error("email or token required"), { statusCode: 400 });
}

async function createScenario(event, body) {
  const validation = validate({ basket: body.basket });
  if (!validation.ok) return json(400, { error: validation.errors[0] });
  const user = await resolveUser(body);
  const client = getSupabaseAdmin();

  const { count, error: countError } = await client
    .from("scenarios")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countError) throw countError;
  if ((count || 0) >= MAX_SCENARIOS) return json(409, { error: "Delete one to save another. (Cap: 10.)" });

  const scenario = toPersisted(validation.scenario);
  const derived = derivedForScenario(scenario);
  const levers = await encryptJson({ version: scenario.version, basket: scenario.basket, source: "simulator" });
  const isPublic = Boolean(body.isPublic);
  const insert = await client
    .from("scenarios")
    .insert({
      user_id: user.id,
      name: cleanName(body.name),
      levers: toByteaHex(levers),
      derived,
      is_public: isPublic,
      share_id: isPublic ? shareId() : null,
      email: normalizeEmail(body.email || user.email || ""),
      basket: scenario.basket,
      score: scenario.score,
      aspiration_rate: derived.aspireRate,
      portfolio_rate: derived.moneyRate,
      gap: derived.gap
    })
    .select("id,access_token,name,levers,derived,basket,score,is_public,share_id,created_at,updated_at,rate_snapshot")
    .single();
  if (insert.error) throw insert.error;
  return json(200, {
    scenario: await rowToPayload(insert.data, { baseUrl: getBaseUrl(event) }),
    scenarios: await listScenarios(user.id, getBaseUrl(event)),
    maxScenarios: MAX_SCENARIOS
  });
}

async function updateScenario(event, body) {
  const user = await resolveUser(body);
  if (!body.id) return json(400, { error: "scenario id required" });
  const client = getSupabaseAdmin();
  const patch = {};

  if (body.name != null) patch.name = cleanName(body.name);
  if (body.basket) {
    const validation = validate({ basket: body.basket });
    if (!validation.ok) return json(400, { error: validation.errors[0] });
    const scenario = toPersisted(validation.scenario);
    const derived = derivedForScenario(scenario);
    const levers = await encryptJson({ version: scenario.version, basket: scenario.basket, source: "simulator" });
    Object.assign(patch, {
      levers: toByteaHex(levers),
      derived,
      basket: scenario.basket,
      score: scenario.score,
      aspiration_rate: derived.aspireRate,
      portfolio_rate: derived.moneyRate,
      gap: derived.gap
    });
  }
  if (body.isPublic === true) {
    patch.is_public = true;
    const existing = await client
      .from("scenarios")
      .select("share_id")
      .eq("id", body.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data?.share_id) patch.share_id = shareId();
  }
  if (body.isPublic === false || body.revokeShare) patch.is_public = false;

  const updated = await client
    .from("scenarios")
    .update(patch)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select("id,access_token,name,levers,derived,basket,score,is_public,share_id,created_at,updated_at,rate_snapshot")
    .maybeSingle();
  if (updated.error) throw updated.error;
  if (!updated.data) return json(404, { error: "Scenario not found" });

  if (body.makeBaseline) {
    const baselinePayload = updated.data.levers
      ? await decryptJson(updated.data.levers)
      : { version: 1, basket: updated.data.basket };
    const encrypted = await encryptJson(baselinePayload);
    const baseline = await client
      .from("baseline_overrides")
      .upsert({ user_id: user.id, levers: toByteaHex(encrypted), set_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (baseline.error) throw baseline.error;
  }

  return json(200, {
    scenario: await rowToPayload(updated.data, { baseUrl: getBaseUrl(event) }),
    scenarios: await listScenarios(user.id, getBaseUrl(event)),
    maxScenarios: MAX_SCENARIOS
  });
}

async function deleteScenario(event, body) {
  const user = await resolveUser(body);
  if (!body.id) return json(400, { error: "scenario id required" });
  const client = getSupabaseAdmin();
  const deleted = await client
    .from("scenarios")
    .delete()
    .eq("id", body.id)
    .eq("user_id", user.id);
  if (deleted.error) throw deleted.error;
  return json(200, {
    ok: true,
    scenarios: await listScenarios(user.id, getBaseUrl(event)),
    maxScenarios: MAX_SCENARIOS
  });
}

export const handler = async event => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json(500, { error: "Supabase env vars are not configured" });

  try {
    if (event.httpMethod === "GET") {
      if (event.queryStringParameters?.share || event.queryStringParameters?.id) return loadPublic(event);
      return loadPrivate(event);
    }

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON" });
    }

    if (event.httpMethod === "POST") return createScenario(event, body);
    if (event.httpMethod === "PATCH") return updateScenario(event, body);
    if (event.httpMethod === "DELETE") return deleteScenario(event, body);
    return json(405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return json(err.statusCode || 500, { error: err.message || "Scenario request failed" });
  }
};
