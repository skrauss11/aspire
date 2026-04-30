// netlify/functions/score.js
// Aspire Score calculator + Beehiiv subscriber upsert
// Triggered by POST /api/score from the calculator gate modal

import rates from '../../rates.json' assert { type: 'json' };

const BEEHIIV_PUB_ID = 'pub_8ad9f164-9d8a-426e-b25a-e8e4cc3cf601';
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'score@send.aspirerate.com';

// --- Score computation ---
function computeAspireScore(basket, rates) {
  // basket: { city, income, weights: { housing, groceries, healthcare, transport, education } }
  // Returns 0-100 (lower = more inflated away from 1995 baseline)
  const weights = basket.weights || { housing: 0.35, groceries: 0.20, healthcare: 0.15, transport: 0.15, education: 0.15 };
  const cityRates = rates.cities?.[basket.city] || rates.national;

  let weightedInflation = 0;
  for (const [category, weight] of Object.entries(weights)) {
    const multiplier = cityRates[category] || rates.national[category] || 1.0;
    weightedInflation += weight * multiplier;
  }

  // Score: 100 = no inflation since 1995, 0 = completely inflated away
  // Base: average 2.9x since 1995 = score of 50
  const score = Math.max(0, Math.min(100, Math.round(100 - ((weightedInflation - 1) / 3.5) * 100)));
  return score;
}

function computeDollarMatch(basket, score) {
  // How much income would someone need today to match 1995 middle-class baseline
  const baselineIncome = basket.income || 75000;
  const inflationFactor = 1 + (100 - score) / 40;
  return Math.round(baselineIncome * inflationFactor);
}

// --- Beehiiv upsert ---
async function upsertSubscriber(email, basket, score) {
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

// --- Transactional email via Resend ---
async function sendScoreEmail(email, score, dollarMatch, basket) {
  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #faf8f4;">
      <h1 style="font-size: 48px; color: #1a1a1a; margin: 0 0 8px;">Your Aspire Score: <span style="color: #c45c2a;">${score}</span></h1>
      <p style="font-size: 20px; color: #444; margin: 0 0 32px;">To match 1995 middle-class life today, you'd need <strong>$${dollarMatch.toLocaleString()}</strong>.</p>
      <hr style="border: 1px solid #e8e0d4; margin: 32px 0;" />
      <p style="font-size: 16px; color: #666;">Your score is recalculated monthly as inflation, home prices, and markets move. Watch it change.</p>
      <p style="margin-top: 32px;"><a href="https://aspirerate.com" style="background: #c45c2a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">Read The Aspire Report →</a></p>
      <p style="font-size: 12px; color: #999; margin-top: 40px;">You subscribed at aspirerate.com. <a href="{{unsubscribe_url}}" style="color: #999;">Unsubscribe</a></p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `Aspire Score <${FROM_EMAIL}>`,
      to: [email],
      subject: `Your Aspire Score: ${score} — you'd need $${dollarMatch.toLocaleString()} to live like 1995`,
      html
    })
  });
  return res.ok;
}

// --- Handler ---
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { email, basket } = await req.json();
  if (!email || !basket) {
    return new Response(JSON.stringify({ error: 'email and basket required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const score = computeAspireScore(basket, rates);
  const dollarMatch = computeDollarMatch(basket, score);

  await upsertSubscriber(email, basket, score);
  await sendScoreEmail(email, score, dollarMatch, basket);

  return new Response(JSON.stringify({ score, dollarMatch }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const config = { path: '/api/score' };
