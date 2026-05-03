// netlify/functions/tracker.js — opt a saved scenario email into Aspire Tracker interest

const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID || 'pub_8ad9f164-9d8a-426e-b25a-e8e4cc3cf601';
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

async function scenarioEmail(token) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/scenarios`);
  url.searchParams.set('select', 'email');
  url.searchParams.set('access_token', `eq.${token}`);
  url.searchParams.set('limit', '1');

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const rows = await res.json().catch(() => null);
  if (!res.ok) throw new Error('Unable to fetch scenario email');
  return Array.isArray(rows) && rows[0] ? rows[0].email : null;
}

async function upsertTrackerInterest(email) {
  const res = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BEEHIIV_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      reactivate_existing: true,
      send_welcome_email: false,
      utm_source: 'simulator',
      custom_fields: [
        { name: 'tracker_interest', value: 'true' },
        { name: 'tracker_opted_at', value: new Date().toISOString() },
        { name: 'signup_source', value: 'simulator_tracker' }
      ]
    })
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    console.error('beehiiv tracker opt-in failed:', body);
    throw new Error('Unable to update tracker interest');
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !BEEHIIV_API_KEY) {
    return json(500, { error: 'Required env vars are not configured' });
  }

  let token;
  try {
    ({ token } = JSON.parse(event.body || '{}'));
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  if (!token || !/^[a-f0-9]{48}$/i.test(token)) {
    return json(400, { error: 'Valid scenario token required' });
  }

  try {
    const email = await scenarioEmail(token);
    if (!email) return json(404, { error: 'Scenario not found' });
    await upsertTrackerInterest(email);
    return json(200, { ok: true });
  } catch (err) {
    console.error(err);
    return json(500, { error: 'Unable to opt into tracker' });
  }
};
