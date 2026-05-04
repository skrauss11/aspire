// netlify/functions/score.js — Netlify Functions v1 (CommonJS)
// POST /api/score → compute Aspire Score, save scenario, upsert Beehiiv, send Resend email

const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID || 'pub_8ad9f164-9d8a-426e-b25a-e8e4cc3cf601';
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'score@send.aspirerate.com';
const FROM_NAME = process.env.FROM_NAME || 'Aspire Score';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Score = fraction of the basket the user can afford (0–100).
// 42 = you can cover 42% of the life you're building toward.
function computeScore(basket) {
  const fraction       = basket.computed?.fraction       || 0;
  const aspirationRate = basket.computed?.aspirationRate || 0;
  const portfolioRate  = basket.computed?.portfolioRate  || 0;
  const gap            = parseFloat(basket.computed?.gap) || (portfolioRate - aspirationRate);
  const score          = Math.max(0, Math.min(100, Math.round(fraction)));
  return { score, aspirationRate, portfolioRate, gap };
}

async function upsertBeehiiv(email, basket, score, simulatorUrl) {
  const res = await fetch(`https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      reactivate_existing: true,
      send_welcome_email: false,
      utm_source: basket.source || 'calculator',
      custom_fields: [
        { name: 'basket_json',   value: JSON.stringify(basket) },
        { name: 'last_score',    value: String(score) },
        { name: 'simulator_url', value: simulatorUrl },
        { name: 'signup_source', value: basket.source || 'calculator' },
        { name: 'last_recalc',   value: new Date().toISOString().split('T')[0] }
      ]
    })
  });
  return res.ok;
}

function getBaseUrl(event) {
  const proto = event.headers['x-forwarded-proto'] || event.headers['X-Forwarded-Proto'] || 'https';
  const host = event.headers.host || event.headers.Host || 'aspirerate.com';
  return `${proto}://${host}`;
}

async function saveScenario(email, basket, score, aspirationRate, portfolioRate, gap) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase env vars are not configured');
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/scenarios?select=id,access_token`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      email,
      basket,
      score,
      aspiration_rate: aspirationRate,
      portfolio_rate: portfolioRate,
      gap,
      rate_snapshot: basket.rateSnapshot || null
    })
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    console.error('supabase scenario insert failed:', body);
    throw new Error('Unable to save scenario');
  }
  return Array.isArray(body) ? body[0] : body;
}

async function sendResend(email, score, aspirationRate, portfolioRate, gap, simulatorUrl) {
  const ahead   = gap >= 0;
  const gapAbs  = Math.abs(gap).toFixed(1);

  // Score interpretation line
  const scoreLine = score >= 100
    ? `Your portfolio fully covers the life you're building toward — and then some.`
    : score >= 75
    ? `Your money covers <strong style="color:#0f0e0c">${score}%</strong> of the life you're building toward. You're close — the last stretch is where compounding bites hardest.`
    : score >= 40
    ? `You can afford <strong style="color:#0f0e0c">${score}%</strong> of your plan today. The rest is slipping out of reach unless something changes.`
    : `You can afford <strong style="color:#c8451f">${score}%</strong> of your plan today. Most of it is still out of reach at this pace.`;

  // Gap narrative line
  const gapLine = ahead
    ? `Your money grows <strong style="color:#0f0e0c">${gapAbs}% faster per year</strong> than your goal's cost. You're compounding in the right direction.`
    : `Your goal's cost grows <strong style="color:#c8451f">${gapAbs}% faster per year</strong> than your money does. That gap gets bigger every year if nothing changes.`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; padding: 40px 24px; background: #f5f1ea; color: #0f0e0c;">

      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; color: #c8451f; margin: 0 0 16px; font-family: system-ui, sans-serif;">Your Aspire Score</p>
      <h1 style="font-family: Georgia, serif; font-size: 80px; font-weight: 600; margin: 0 0 12px; line-height: 1; letter-spacing: -0.02em;">${score}</h1>
      <p style="font-size: 18px; color: #5a544b; margin: 0 0 32px; font-family: system-ui, sans-serif; line-height: 1.55;">${scoreLine}</p>

      <hr style="border: none; border-top: 1px solid #d6cec0; margin: 0 0 28px;" />

      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #c8451f; margin: 0 0 16px; font-family: system-ui, sans-serif;">Your Rates</p>

      <table style="width:100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e2d8; font-family: system-ui, sans-serif; font-size: 14px; color: #5a544b;">Cost growth</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e2d8; text-align: right; font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: #c8451f;">${aspirationRate.toFixed(1)}%/yr</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e2d8; font-family: system-ui, sans-serif; font-size: 14px; color: #5a544b;">Money growth</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e2d8; text-align: right; font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: #0f0e0c;">${portfolioRate.toFixed(1)}%/yr</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-family: system-ui, sans-serif; font-size: 14px; color: #5a544b;">Your gap</td>
          <td style="padding: 12px 0; text-align: right; font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: ${ahead ? '#2a7a3b' : '#c8451f'};">${ahead ? '+' : ''}${gap.toFixed(1)}%</td>
        </tr>
      </table>

      <p style="font-size: 15px; color: #5a544b; line-height: 1.65; margin: 0 0 32px; font-family: system-ui, sans-serif;">${gapLine}</p>

      <hr style="border: none; border-top: 1px solid #d6cec0; margin: 0 0 28px;" />

      <p style="font-size: 15px; color: #5a544b; line-height: 1.6; font-family: system-ui, sans-serif; margin: 0 0 24px;">Your score recalculates every month as inflation, home prices, and markets move. The gap doesn't sit still.</p>
      <p style="margin: 0 0 40px;">
        <a href="${simulatorUrl}" style="background: #c8451f; color: #f5f1ea; padding: 12px 24px; text-decoration: none; border-radius: 999px; font-size: 15px; font-family: system-ui, sans-serif;">See how to close your gap →</a>
      </p>
      <p style="font-size: 12px; color: #8f8778; margin: 0; font-family: system-ui, sans-serif;">You're receiving this because you calculated your Aspire Score at aspirerate.com.</p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [email],
      subject: `Your Aspire Score: ${score} — ${score >= 100 ? "you're fully funded" : `you can afford ${score}% of your plan`}`,
      html
    })
  });
  const body = await res.json();
  return { ok: res.ok, body };
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let email, basket;
  try {
    ({ email, basket } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!email || !basket) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'email and basket required' }) };
  }

  const { score, aspirationRate, portfolioRate, gap } = computeScore(basket);
  let scenario;
  try {
    scenario = await saveScenario(email, basket, score, aspirationRate, portfolioRate, gap);
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Unable to save scenario' }) };
  }
  const simulatorUrl = `${getBaseUrl(event)}/simulator/index.html?t=${scenario.access_token}`;

  const [beehiivResult, resendResult] = await Promise.allSettled([
    upsertBeehiiv(email, basket, score, simulatorUrl),
    sendResend(email, score, aspirationRate, portfolioRate, gap, simulatorUrl)
  ]);

  console.log(
    'beehiiv:',
    beehiivResult.status === 'fulfilled' ? beehiivResult.value : beehiivResult.reason,
    'resend:',
    resendResult.status === 'fulfilled' ? resendResult.value : resendResult.reason
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      score,
      scenarioId: scenario.id,
      simulatorUrl,
      emailSent: resendResult.status === 'fulfilled' && resendResult.value.ok === true
    })
  };
};
