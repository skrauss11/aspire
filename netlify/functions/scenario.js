// netlify/functions/scenario.js — fetch a saved simulator scenario by private token

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: 'Supabase env vars are not configured' });
  }

  const token = event.queryStringParameters?.t;
  if (!token || !/^[a-f0-9]{48}$/i.test(token)) {
    return json(400, { error: 'Valid scenario token required' });
  }

  const url = new URL(`${SUPABASE_URL}/rest/v1/scenarios`);
  url.searchParams.set('select', 'id,access_token,basket,score,aspiration_rate,portfolio_rate,gap,rate_snapshot,created_at');
  url.searchParams.set('access_token', `eq.${token}`);
  url.searchParams.set('limit', '1');

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  const rows = await res.json().catch(() => null);
  if (!res.ok) {
    console.error('supabase scenario fetch failed:', rows);
    return json(500, { error: 'Unable to fetch scenario' });
  }

  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) {
    return json(404, { error: 'Scenario not found' });
  }

  fetch(`${SUPABASE_URL}/rest/v1/scenarios?access_token=eq.${token}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ last_accessed_at: new Date().toISOString() })
  }).catch(err => console.error('scenario access timestamp update failed:', err));

  return json(200, {
    id: row.id,
    token: row.access_token,
    score: row.score,
    basket: row.basket,
    rateSnapshot: row.rate_snapshot,
    createdAt: row.created_at,
    computed: {
      aspirationRate: Number(row.aspiration_rate) || 0,
      portfolioRate: Number(row.portfolio_rate) || 0,
      gap: Number(row.gap) || 0
    }
  });
};
