// netlify/functions/score.js — Netlify Functions v1 (CommonJS)
// POST /api/score → compute Aspire Score, upsert Beehiiv, send Resend email

const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID || 'pub_8ad9f164-9d8a-426e-b25a-e8e4cc3cf601';
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'score@send.aspirerate.com';
const FROM_NAME = process.env.FROM_NAME || 'Aspire Score';

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
      utm_source: basket.source || 'calculator',
      custom_fields: [
        { name: 'basket_json',   value: JSON.stringify(basket) },
        { name: 'last_score',    value: String(score) },
        { name: 'signup_source', value: basket.source || 'calculator' },
        { name: 'last_recalc',   value: new Date().toISOString().split('T')[0] }
      ]
    })
  });
  return res.ok;
}

async function sendResend(email, score, aspirationRate, portfolioRate, gap) {
  const ahead   = gap >= 0;
  const gapAbs  = Math.abs(gap).toFixed(1);

  // Score interpretation line
  const scoreLine = score >= 100
    ? `Your portfolio fully covers the life you're building toward — and then some.`
    : score >= 75
    ? `Your money covers <strong style="color:#0f0e0c">${score}%</strong> of the life you're building toward. You're close — the last stretch is where compounding bites hardest.`
    : score >= 40
    ? `Your money covers <strong style="color:#0f0e0c">${score}%</strong> of the life you're building toward. The rest is drifting away unless something changes.`
    : `Your money covers <strong style="color:#c8451f">${score}%</strong> of the life you're building toward. Most of the target is still out of reach at this pace.`;

  // Gap narrative line
  const gapLine = ahead
    ? `Your portfolio grows <strong style="color:#0f0e0c">${gapAbs}% faster per year</strong> than the life you're targeting inflates. You're compounding in the right direction.`
    : `The life you're targeting inflates <strong style="color:#c8451f">${gapAbs}% faster per year</strong> than your portfolio grows. That gap compounds against you every year it goes unaddressed.`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 580px; margin: 0 auto; padding: 40px 24px; background: #f5f1ea; color: #0f0e0c;">

      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; color: #c8451f; margin: 0 0 16px; font-family: system-ui, sans-serif;">Your Aspire Score</p>
      <h1 style="font-family: Georgia, serif; font-size: 80px; font-weight: 600; margin: 0 0 12px; line-height: 1; letter-spacing: -0.02em;">${score}</h1>
      <p style="font-size: 18px; color: #5a544b; margin: 0 0 32px; font-family: system-ui, sans-serif; line-height: 1.55;">${scoreLine}</p>

      <hr style="border: none; border-top: 1px solid #d6cec0; margin: 0 0 28px;" />

      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #c8451f; margin: 0 0 16px; font-family: system-ui, sans-serif;">Your Rates</p>

      <table style="width:100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e2d8; font-family: system-ui, sans-serif; font-size: 14px; color: #5a544b;">Your Aspire Rate</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e2d8; text-align: right; font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: #c8451f;">${aspirationRate.toFixed(1)}%/yr</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e2d8; font-family: system-ui, sans-serif; font-size: 14px; color: #5a544b;">Your Portfolio Rate</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e2d8; text-align: right; font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: #0f0e0c;">${portfolioRate.toFixed(1)}%/yr</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-family: system-ui, sans-serif; font-size: 14px; color: #5a544b;">Annual gap</td>
          <td style="padding: 12px 0; text-align: right; font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: ${ahead ? '#2a7a3b' : '#c8451f'};">${ahead ? '+' : ''}${gap.toFixed(1)}%</td>
        </tr>
      </table>

      <p style="font-size: 15px; color: #5a544b; line-height: 1.65; margin: 0 0 32px; font-family: system-ui, sans-serif;">${gapLine}</p>

      <hr style="border: none; border-top: 1px solid #d6cec0; margin: 0 0 28px;" />

      <p style="font-size: 15px; color: #5a544b; line-height: 1.6; font-family: system-ui, sans-serif; margin: 0 0 24px;">Your score recalculates every month as inflation, home prices, and markets move. The gap doesn't sit still.</p>
      <p style="margin: 0 0 40px;">
        <a href="https://aspirerate.com" style="background: #c8451f; color: #f5f1ea; padding: 12px 24px; text-decoration: none; border-radius: 999px; font-size: 15px; font-family: system-ui, sans-serif;">Run the Close the Gap Simulator →</a>
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
      subject: `Your Aspire Score: ${score} — ${score >= 100 ? "you're fully funded" : `your money covers ${score}% of the life you're building`}`,
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

  const [beehiivOk, resendResult] = await Promise.all([
    upsertBeehiiv(email, basket, score),
    sendResend(email, score, aspirationRate, portfolioRate, gap)
  ]);

  console.log('beehiiv:', beehiivOk, 'resend:', resendResult.ok, resendResult.body);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ score })
  };
};
