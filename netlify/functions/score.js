import { project } from "../../lib/aspire.js";
import { validate, toPersisted } from "../../lib/schema.js";

const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID || "pub_8ad9f164-9d8a-426e-b25a-e8e4cc3cf601";
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "score@send.aspirerate.com";
const FROM_NAME = process.env.FROM_NAME || "Aspire";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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


async function saveScenario(email, scenario, metrics) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env vars are not configured");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/scenarios?select=id,access_token`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      email,
      basket: scenario.basket,
      score: scenario.score,
      aspiration_rate: metrics.costRate,
      portfolio_rate: metrics.moneyRate,
      gap: metrics.gap,
      rate_snapshot: scenario.rateSnapshot || null
    })
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    console.error("supabase scenario insert failed:", body);
    throw new Error("Unable to save scenario");
  }
  return Array.isArray(body) ? body[0] : body;
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
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 580px; margin: 0 auto; padding: 40px 24px; background: #f5f1ea; color: #0f0e0c;">
      <p style="font-size:12px;text-transform:uppercase;letter-spacing:.16em;color:#c8451f;">Your gap</p>
      <h1 style="font-family:Georgia,serif;font-size:72px;margin:0 0 16px;">${metrics.gap >= 0 ? "+" : ""}${metrics.gap.toFixed(1)}% / yr</h1>
      <p style="font-size:17px;line-height:1.6;color:#5a544b;">At your saved assumptions, your money is growing ${Math.abs(metrics.gap).toFixed(1)} percentage points ${metrics.gap >= 0 ? "faster" : "slower"} than your future life is becoming more expensive.</p>
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
      subject: `Your gap: ${metrics.gap >= 0 ? "+" : ""}${metrics.gap.toFixed(1)}% / yr`,
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
  if (!body.email || !body.basket) return json(400, { error: "email and basket required" });

  const validation = validate({ basket: body.basket });
  if (!validation.ok) return json(400, { error: validation.errors[0] });
  const metrics = project(validation.scenario.basket.goals, validation.scenario.basket.holdings);
  const scenario = toPersisted(validation.scenario);

  let row;
  try {
    row = await saveScenario(body.email, scenario, metrics);
  } catch (err) {
    console.error(err);
    return json(500, { error: "Unable to save scenario" });
  }

  const t = row.access_token;
  const simulatorUrl = `${getBaseUrl(event)}/simulator/?t=${t}`;
  const [beehiivResult, emailResult] = await Promise.allSettled([
    upsertBeehiiv(body.email, scenario, simulatorUrl),
    sendEmail(body.email, metrics, simulatorUrl)
  ]);
  console.log("beehiiv:", beehiivResult.status, "email:", emailResult.status);

  return json(200, {
    score: scenario.score,
    scenarioId: row.id,
    t,
    simulatorUrl,
    emailSent: emailResult.status === "fulfilled" && emailResult.value.ok === true
  });
};
