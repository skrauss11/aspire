// netlify/functions/score.js — Netlify Functions v1 (CommonJS)
// POST /api/score → compute Aspire Score, upsert Beehiiv, send Resend email

const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID || 'pub_8ad9f164-9d8a-426e-b25a-e8e4cc3cf601';
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'score@news.aspirerate.com';
const FROM_NAME = process.env.FROM_NAME || 'Aspire Score';

// Compute 0–100 score from basket computed fields
// fraction = % of the life they can afford (already computed client-side)
// We map that to a 0–100 Aspire Score and add a 1995 dollar translation
function computeScore(basket) {
  const fraction = basket.computed?.fraction || 0;
  const aspirationRate = basket.computed?.aspirationRate || 0;
  const portfolioRate = basket.computed?.portfolioRate || 0;

  // Score = how well your portfolio keeps up with your ambition basket
  // 100 = fully funded and keeping pace. 0 = structurally behind.
  const score = Math.max(0, Math.min(100, Math.round(fraction)));

  // Dollar translation: what 1995 middle-class costs today
  // Median HH income ~$35k in 1995, weighted by their aspiration rate
  const baselineIncome = 35000;
  const yearsSince1995 = 31;
  const inflationFactor = Math.pow(1 + aspirationRate / 100, yearsSince1995);
  const dollarMatch = Math.round(baselineIncome * inflationFactor);

  return { score, dollarMatch };
}

async function upsertBeehiiv(email, basket, score) {
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
      utm_source: 'calculator',
      custom_fields: [
        { name: 'basket_json', value: JSON.stringify(basket) },
        { name: 'last_score', value: String(score) },
        { name: 'signup_source', value: 'calculator' },
        { name: 'last_recalc', value: new Date().toISOString().split('T')[0] }
      ]
    })
  });
  return res.ok;
}

async function sendResend(email, score, dollarMatch) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; padding: 40px 24px; background: #f5f1ea; color: #0f0e0c;">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; color: #c8451f; margin: 0 0 16px; font-family: system-ui, sans-serif;">Your Aspire Score</p>
      <h1 style="font-family: Georgia, serif; font-size: 72px; font-weight: 600; margin: 0 0 8px; line-height: 1; letter-spacing: -0.02em;">${score}</h1>
      <p style="font-size: 20px; color: #5a544b; margin: 0 0 20px; font-family: Georgia, serif;">To match 1995 middle-class life today, you'd need <strong style="color: #0f0e0c;">$${dollarMatch.toLocaleString()}</strong>.</p>
      <p style="font-size: 15px; color: #5a544b; line-height: 1.65; margin: 0 0 32px; font-family: system-ui, sans-serif;">Your score reflects how well your money keeps pace with the specific future you're building toward — not some average basket that describes no one.</p>

      <hr style="border: none; border-top: 1px solid #d6cec0; margin: 32px 0;" />

      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; color: #c8451f; margin: 0 0 16px; font-family: system-ui, sans-serif;">The Aspire Manifesto</p>
      <p style="font-family: Georgia, serif; font-size: 21px; color: #0f0e0c; line-height: 1.35; margin: 0 0 20px; font-style: italic;">CPI is just a number — no direction, no destination. It measures an imaginary average family. Your inflation is a vector. It's aimed directly at the life you actually want.</p>
      <p style="font-size: 15px; color: #5a544b; line-height: 1.65; margin: 0 0 24px; font-family: system-ui, sans-serif;">Inflation has quietly eroded the ability of millions of Americans to afford the life they want. Not because they aren't working hard. Because nobody ever showed them the honest numbers. This is where that changes.</p>
      <p style="margin: 0 0 32px;">
        <a href="https://aspirerate.com/manifesto" style="color: #c8451f; font-size: 15px; font-family: system-ui, sans-serif; text-decoration: underline;">Read the full manifesto →</a>
      </p>

      <hr style="border: none; border-top: 1px solid #d6cec0; margin: 32px 0;" />

      <p style="font-size: 15px; color: #5a544b; line-height: 1.6; font-family: system-ui, sans-serif; margin: 0 0 28px;">Your score recalculates every month as inflation, home prices, and markets move. Watch it change.</p>
      <p style="margin: 0 0 40px;">
        <a href="https://aspirerate.com" style="background: #c8451f; color: #f5f1ea; padding: 12px 24px; text-decoration: none; border-radius: 999px; font-size: 15px; font-family: system-ui, sans-serif;">Return to Aspire →</a>
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
      subject: `Your Aspire Score: ${score} — you'd need $${dollarMatch.toLocaleString()} to live like 1995`,
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

  const { score, dollarMatch } = computeScore(basket);

  const [beehiivOk, resendResult] = await Promise.all([
    upsertBeehiiv(email, basket, score),
    sendResend(email, score, dollarMatch)
  ]);

  console.log('beehiiv:', beehiivOk, 'resend:', resendResult.ok, resendResult.body);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ score, dollarMatch })
  };
};
