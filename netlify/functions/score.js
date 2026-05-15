import { project } from "../../lib/aspire.js";
import { validate, toPersisted } from "../../lib/schema.js";
import { encryptField, encryptJson } from "../../lib/encryption.js";
import { createClient } from "@supabase/supabase-js";

const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID || "pub_8ad9f164-9d8a-426e-b25a-e8e4cc3cf601";
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "score@send.aspirerate.com";
const FROM_NAME = process.env.FROM_NAME || "Aspire";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAdmin;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
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

function calculatorStateFromBasket(basket, metrics, body = {}) {
  const holdings = basket.holdings || [];
  const totalAssets = holdings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const monthlyContribution = holdings.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
  const allocation = holdings.map(item => {
    const amount = Number(item.amount) || 0;
    return {
      label: item.label,
      asset: item.asset,
      amount,
      share: totalAssets ? amount / totalAssets : 0,
      growth: Number(item.growth) || 0
    };
  });
  return {
    life_chip: body.lifeChip || body.life_chip || basket.lifeChip || null,
    geography: body.geography || basket.geography || null,
    timeline: Math.round(Number(basket.computed?.horizon || metrics.horizon || body.timeline || 0)) || null,
    totalAssets,
    allocation,
    monthlyContribution,
    aspire_rate: metrics.costRate,
    aspire_gap: metrics.gap
  };
}

function toByteaHex(buffer) {
  return `\\x${Buffer.from(buffer).toString("hex")}`;
}

function metricsForBasket(basket) {
  const metrics = project(basket.goals, basket.holdings);
  const computed = basket.computed || {};
  return {
    ...metrics,
    horizon: Number(computed.horizon ?? computed.timeHorizon) || metrics.horizon
  };
}

function applyComputedRates(scenario, metrics) {
  scenario.basket.computed = {
    ...(scenario.basket.computed || {}),
    moneyRate: metrics.moneyRate,
    costRate: metrics.costRate,
    aspirationRate: metrics.costRate,
    portfolioRate: metrics.moneyRate,
    gap: metrics.gap,
    horizon: metrics.horizon,
    timeHorizon: metrics.horizon
  };
  return scenario;
}

async function saveScenario(email, scenario, metrics) {
  const client = getSupabaseAdmin();
  const user = await ensureUserForEmail(email);
  const calcState = calculatorStateFromBasket(scenario.basket, metrics);
  const [totalAssets, allocationJson, monthlyContribution, levers] = await Promise.all([
    encryptField(String(calcState.totalAssets)),
    encryptJson(calcState.allocation),
    encryptField(String(calcState.monthlyContribution)),
    encryptJson({
      version: scenario.version,
      basket: scenario.basket,
      source: "score"
    })
  ]);

  const calcUpsert = await client
    .from("calculator_states")
    .upsert({
      user_id: user.id,
      life_chip: calcState.life_chip,
      geography: calcState.geography,
      timeline: calcState.timeline,
      total_assets: toByteaHex(totalAssets),
      allocation_json: toByteaHex(allocationJson),
      monthly_contribution: toByteaHex(monthlyContribution),
      aspire_rate: metrics.costRate,
      aspire_gap: metrics.gap
    }, { onConflict: "user_id" });
  if (calcUpsert.error) throw calcUpsert.error;

  const insert = await client
    .from("scenarios")
    .insert({
      user_id: user.id,
      name: "Calculator scenario",
      levers: toByteaHex(levers),
      derived: {
        score: scenario.score,
        aspireRate: metrics.costRate,
        moneyRate: metrics.moneyRate,
        aspireGap: metrics.gap,
        gap: metrics.gap,
        horizon: metrics.horizon,
        totalGoals: metrics.totalGoals,
        totalAssets: metrics.totalAssets,
        dollarGap: metrics.dollarGap
      },
      is_public: false,
      email: normalizeEmail(email),
      basket: scenario.basket,
      score: scenario.score,
      aspiration_rate: metrics.costRate,
      portfolio_rate: metrics.moneyRate,
      gap: metrics.gap,
      rate_snapshot: scenario.rateSnapshot || null
    })
    .select("id,access_token")
    .single();
  if (insert.error) {
    console.error("supabase scenario insert failed:", insert.error);
    throw new Error("Unable to save scenario");
  }
  return insert.data;
}

async function emailForToken(token) {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("scenarios")
    .select("email,user_id,users(email)")
    .eq("access_token", token)
    .maybeSingle();
  if (error) {
    console.error("supabase token lookup failed:", error);
    throw new Error("Unable to resolve scenario token");
  }
  return data?.email || data?.users?.email || "";
}

async function upsertBeehiiv(email, scenario, simulatorUrl) {
  if (!BEEHIIV_API_KEY) return false;
  const res = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BEEHIIV_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      reactivate_existing: true,
      send_welcome_email: false,
      utm_source: "v3_score",
      custom_fields: [
        { name: "basket_json", value: JSON.stringify(scenario.basket) },
        { name: "last_score", value: String(scenario.score) },
        { name: "aspire_rate", value: String(Number(scenario.basket.computed?.costRate || 0).toFixed(2)) },
        { name: "aspire_gap", value: String(Number(scenario.basket.computed?.gap || 0).toFixed(2)) },
        { name: "simulator_url", value: simulatorUrl },
        { name: "signup_source", value: "v3_score" },
        { name: "last_recalc", value: new Date().toISOString().slice(0, 10) }
      ]
    })
  });
  return res.ok;
}

async function sendEmail(email, metrics, simulatorUrl) {
  if (!RESEND_API_KEY) return { ok: false };
  const gapLabel = `${metrics.gap >= 0 ? "+" : ""}${metrics.gap.toFixed(1)} points`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 580px; margin: 0 auto; padding: 40px 24px; background: #f5f1ea; color: #0f0e0c;">
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:.16em;color:#c8451f;">Your Aspire Rate</p>
      <h1 style="font-family:Georgia,serif;font-size:72px;margin:0 0 8px;">${metrics.costRate.toFixed(1)}%</h1>
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:.16em;color:#8f8778;margin:0 0 18px;">At these assumptions</p>
      <p style="font-size:17px;line-height:1.6;color:#5a544b;">At these assumptions, your Aspire Gap is ${gapLabel}. Your money is modeled at ${metrics.moneyRate.toFixed(1)}%, compared with the rate the life you priced requires.</p>
      <p><a href="${simulatorUrl}" style="display:inline-block;background:#c8451f;color:#f5f1ea;padding:13px 20px;border-radius:999px;text-decoration:none;font-weight:700;">Open the simulator</a></p>
      <p style="font-size:12px;color:#8f8778;">Educational measurement, not investment advice.</p>
    </div>
  `;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: `Your Aspire Gap: ${gapLabel}`,
      html
    })
  });
  return { ok: res.ok };
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
  if (!body.basket || (!body.email && !body.token)) return json(400, { error: "email or token and basket required" });
  if (body.token && !/^[a-f0-9]{48}$/i.test(body.token)) return json(400, { error: "Valid scenario token required" });
  let email;
  try {
    email = body.email || await emailForToken(body.token);
  } catch (err) {
    console.error(err);
    return json(500, { error: "Unable to resolve saved scenario" });
  }
  if (!email) return json(404, { error: "Saved scenario email not found" });

  const validation = validate({ basket: body.basket });
  if (!validation.ok) return json(400, { error: validation.errors[0] });
  const metrics = metricsForBasket({
    ...validation.scenario.basket,
    computed: body.basket?.computed || validation.scenario.basket.computed
  });
  const scenario = applyComputedRates(toPersisted(validation.scenario), metrics);

  let row;
  try {
    row = await saveScenario(email, scenario, metrics);
  } catch (err) {
    console.error(err);
    return json(500, { error: "Unable to save scenario" });
  }

  const t = row.access_token;
  const simulatorUrl = `${getBaseUrl(event)}/simulator/?t=${t}`;
  const [beehiivResult, emailResult] = await Promise.allSettled([
    body.email ? upsertBeehiiv(email, scenario, simulatorUrl) : Promise.resolve(false),
    body.email ? sendEmail(email, metrics, simulatorUrl) : Promise.resolve({ ok: false })
  ]);
  console.log("beehiiv:", beehiivResult.status, "email:", emailResult.status);

  return json(200, {
    score: scenario.score,
    aspireRate: metrics.costRate,
    aspireGap: metrics.gap,
    scenarioId: row.id,
    t,
    simulatorUrl,
    emailSent: emailResult.status === "fulfilled" && emailResult.value.ok === true
  });
};
