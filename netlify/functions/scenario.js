import { fromPersisted } from "../../lib/schema.js";
import { decryptJson } from "../../lib/encryption.js";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAdmin;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
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

export const handler = async event => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json(500, { error: "Supabase env vars are not configured" });

  const token = event.queryStringParameters?.t;
  if (!token || !/^[a-f0-9]{48}$/i.test(token)) return json(400, { error: "Valid scenario token required" });

  const client = getSupabaseAdmin();
  const { data: row, error } = await client
    .from("scenarios")
    .select("id,access_token,levers,derived,basket,score,created_at,updated_at,rate_snapshot")
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

  let persisted;
  if (row.levers) {
    try {
      const decrypted = await decryptJson(row.levers);
      persisted = {
        version: decrypted.version || 1,
        createdAt: row.created_at,
        score: row.derived?.score ?? row.score,
        basket: decrypted.basket
      };
    } catch (err) {
      console.error("scenario decrypt failed:", err);
      return json(500, { error: "Unable to decrypt scenario" });
    }
  } else {
    persisted = {
      version: 1,
      createdAt: row.created_at,
      score: row.score,
      basket: row.basket
    };
  }

  const scenario = fromPersisted(persisted);
  return json(200, {
    id: row.id,
    token: row.access_token,
    aspireRate: row.derived?.aspireRate ?? scenario.basket.computed?.costRate,
    aspireGap: row.derived?.aspireGap ?? scenario.basket.computed?.gap,
    derived: row.derived || null,
    rateSnapshot: row.rate_snapshot || null,
    ...scenario
  });
};
