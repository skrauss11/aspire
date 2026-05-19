import { pct, shortMoney } from "./format.js";

function monotonePath(points) {
  if (points.length < 2) return "";
  const dx = [];
  const dy = [];
  const slope = [];
  for (let i = 0; i < points.length - 1; i++) {
    dx[i] = points[i + 1].x - points[i].x;
    dy[i] = points[i + 1].y - points[i].y;
    slope[i] = dx[i] ? dy[i] / dx[i] : 0;
  }
  const tangent = [slope[0]];
  for (let i = 1; i < points.length - 1; i++) {
    tangent[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  }
  tangent[points.length - 1] = slope[slope.length - 1];
  for (let i = 0; i < slope.length; i++) {
    if (!slope[i]) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const sum = a * a + b * b;
    if (sum > 9) {
      const tau = 3 / Math.sqrt(sum);
      tangent[i] = tau * a * slope[i];
      tangent[i + 1] = tau * b * slope[i];
    }
  }
  return points.reduce((path, point, i) => {
    if (!i) return `M${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    const prev = points[i - 1];
    const cp1 = { x: prev.x + dx[i - 1] / 3, y: prev.y + tangent[i - 1] * dx[i - 1] / 3 };
    const cp2 = { x: point.x - dx[i - 1] / 3, y: point.y - tangent[i] * dx[i - 1] / 3 };
    return `${path} C${cp1.x.toFixed(1)},${cp1.y.toFixed(1)} ${cp2.x.toFixed(1)},${cp2.y.toFixed(1)} ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }, "");
}

function stepPath(points) {
  if (points.length < 2) return "";
  return points.reduce((path, point, index) => {
    if (!index) return `M${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    const prev = points[index - 1];
    return `${path} H${point.x.toFixed(1)} V${point.y.toFixed(1)}`;
  }, "");
}

function futureGoalCost(goal) {
  return (Number(goal.amount) || 0) * Math.pow(1 + (Number(goal.growth) || 0) / 100, Math.max(0, Number(goal.horizon) || 0));
}

function truncateLabel(value = "", max = 14) {
  const text = String(value || "Goal").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
}

export function renderRateChart(container, series, options = {}) {
  if (!container || !series?.length) return;
  const width = 760;
  const height = options.height || 320;
  const mini = Boolean(options.mini);
  const pad = mini
    ? { left: 12, right: 12, top: 10, bottom: 12 }
    : { left: 54, right: 24, top: 22, bottom: 42 };
  const maxYear = Math.max(...series.map(point => point.year), 1);
  const values = series.flatMap(point => [point.moneyRate, point.costRate]);
  const minValue = Math.min(-2, ...values);
  const maxValue = Math.max(20, ...values);
  const span = maxValue - minValue || 1;
  const x = year => pad.left + (year / maxYear) * (width - pad.left - pad.right);
  const y = value => pad.top + (1 - (value - minValue) / span) * (height - pad.top - pad.bottom);
  const moneyPoints = series.map(point => ({ ...point, x: x(point.year), y: y(point.moneyRate) }));
  const costPoints = series.map(point => ({ ...point, x: x(point.year), y: y(point.costRate) }));
  const area = [
    monotonePath(moneyPoints),
    [...costPoints].reverse().map((point, index) => `${index ? "L" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ")
  ].join(" ");
  const ticks = mini ? "" : [0, .25, .5, .75, 1].map(t => {
    const value = minValue + span * t;
    const yy = y(value);
    return `<line x1="${pad.left}" x2="${width - pad.right}" y1="${yy}" y2="${yy}" stroke="rgba(15,14,12,.12)"></line><text x="8" y="${yy + 4}" fill="#8f8778" font-size="11">${pct(value, 0)}</text>`;
  }).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Money growth and cost growth chart" style="overflow:visible">
      ${ticks}
      <path class="rate-gap-area" d="${area} Z" fill="#f0b35b" opacity=".18"></path>
      <path class="rate-path" d="${monotonePath(moneyPoints)}" fill="none" stroke="#7fb98a" stroke-width="${mini ? 3 : 4}" stroke-linecap="round" stroke-linejoin="round"></path>
      <path class="rate-path" d="${monotonePath(costPoints)}" fill="none" stroke="#c8451f" stroke-width="${mini ? 3 : 4}" stroke-linecap="round" stroke-linejoin="round"></path>
      ${mini ? "" : `<line x1="${pad.left}" x2="${width - pad.right}" y1="${y(0)}" y2="${y(0)}" stroke="rgba(15,14,12,.35)"></line>
      <text x="${pad.left}" y="${height - 12}" fill="#8f8778" font-size="11">Today</text>
      <text x="${width - pad.right - 54}" y="${height - 12}" fill="#8f8778" font-size="11">Year ${maxYear}</text>`}
      <line class="rate-guide" y1="${pad.top}" y2="${height - pad.bottom}" stroke="#0f0e0c" stroke-width="1" opacity="0"></line>
      <g class="rate-tooltip" opacity="0" pointer-events="none">
        <rect width="198" height="66" rx="8" fill="#0f0e0c" opacity=".9"></rect>
        <text x="10" y="20" fill="#f5f1ea" font-size="12" font-weight="700"></text>
        <text x="10" y="40" fill="#d7cfc2" font-size="12"></text>
        <text x="10" y="58" fill="#d7cfc2" font-size="12"></text>
      </g>
      <rect class="rate-overlay" x="${pad.left}" y="${pad.top}" width="${width - pad.left - pad.right}" height="${height - pad.top - pad.bottom}" fill="transparent"></rect>
    </svg>
    ${mini ? "" : `<div class="chart-legend">
      <span><i style="background:#7fb98a"></i>Money growth</span>
      <span><i style="background:#c8451f"></i>Cost growth</span>
      <span><i style="background:#f0b35b"></i>Gap</span>
    </div>`}
  `;

  const svg = container.querySelector("svg");
  const overlay = container.querySelector(".rate-overlay");
  const guide = container.querySelector(".rate-guide");
  const tooltip = container.querySelector(".rate-tooltip");
  const [title, lineOne, lineTwo] = tooltip.querySelectorAll("text");
  overlay.addEventListener("pointermove", event => {
    const rect = svg.getBoundingClientRect();
    const localX = (event.clientX - rect.left) / rect.width * width;
    const year = Math.max(0, Math.min(maxYear, Math.round((localX - pad.left) / (width - pad.left - pad.right) * maxYear)));
    const point = series.reduce((best, item) => Math.abs(item.year - year) < Math.abs(best.year - year) ? item : best, series[0]);
    const guideX = x(point.year);
    const tipX = Math.min(width - 208, Math.max(8, guideX + 12));
    const tipY = pad.top + 8;
    guide.setAttribute("x1", guideX);
    guide.setAttribute("x2", guideX);
    guide.setAttribute("opacity", "1");
    tooltip.setAttribute("transform", `translate(${tipX},${tipY})`);
    tooltip.setAttribute("opacity", "1");
    title.textContent = `Year ${point.year}`;
    lineOne.textContent = `Money ${pct(point.moneyRate)} · Cost ${pct(point.costRate)}`;
    lineTwo.textContent = `Gap ${(point.moneyRate - point.costRate).toFixed(1)}pp`;
  });
  overlay.addEventListener("pointerleave", () => {
    guide.setAttribute("opacity", "0");
    tooltip.setAttribute("opacity", "0");
  });
}

export function renderDollarChart(container, series, options = {}) {
  if (!container || !series?.length) return;
  const width = 760;
  const height = options.height || 320;
  const mini = Boolean(options.mini);
  const baseline = options.baseline || [];
  const goals = options.goals || [];
  const pad = mini
    ? { left: 12, right: 12, top: 10, bottom: 12 }
    : { left: 58, right: 92, top: 22, bottom: 42 };
  const maxYear = Math.max(...series.map(point => point.year), ...baseline.map(point => point.year), 1);
  const values = [...series, ...baseline].flatMap(point => [point.moneyDollars, point.costDollars]);
  const maxValue = Math.max(1, ...values);
  const x = year => pad.left + (year / maxYear) * (width - pad.left - pad.right);
  const y = value => pad.top + (1 - (value / maxValue)) * (height - pad.top - pad.bottom);
  const moneyPoints = series.map(point => ({ ...point, x: x(point.year), y: y(point.moneyDollars) }));
  const costPoints = series.map(point => ({ ...point, x: x(point.year), y: y(point.costDollars) }));
  const baseMoney = baseline.map(point => ({ ...point, x: x(point.year), y: y(point.moneyDollars) }));
  const baseCost = baseline.map(point => ({ ...point, x: x(point.year), y: y(point.costDollars) }));
  const area = [
    monotonePath(moneyPoints),
    [...costPoints].reverse().map((point, index) => `${index ? "L" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ")
  ].join(" ");
  const ticks = mini ? "" : [0, .25, .5, .75, 1].map(t => {
    const value = maxValue * t;
    const yy = y(value);
    return `<line x1="${pad.left}" x2="${width - pad.right}" y1="${yy}" y2="${yy}" stroke="rgba(143,135,120,.28)"></line><text x="8" y="${yy + 4}" fill="#8f8778" font-size="11">${shortMoney(value)}</text>`;
  }).join("");
  const lastMoney = moneyPoints[moneyPoints.length - 1];
  const lastCost = costPoints[costPoints.length - 1];
  const hasBaseline = baseMoney.length > 1 && baseCost.length > 1;
  const allGoalsInViewYear = goals.length ? Math.max(...goals.map(goal => Number(goal.horizon) || 0)) : 0;
  const crossover = series.find(point => point.year >= allGoalsInViewYear && point.costDollars > 0 && point.moneyDollars >= point.costDollars);
  const crossoverPoint = crossover ? { ...crossover, x: x(crossover.year), y: y(crossover.moneyDollars) } : null;
  const crossoverLabel = crossoverPoint
    ? goals.length > 1
      ? `Clears all priced goals at year ${crossoverPoint.year} at these assumptions`
      : `Clears ${goals[0]?.label || "goal"} at year ${crossoverPoint.year} at these assumptions`
    : "";
  const goalTicks = mini ? "" : goals
    .filter(goal => Number(goal.horizon) >= 0 && Number(goal.horizon) <= maxYear)
    .map(goal => {
      const gx = x(Number(goal.horizon) || 0);
      const future = futureGoalCost(goal);
      return `
        <g class="goal-year-tick">
          <line x1="${gx.toFixed(1)}" x2="${gx.toFixed(1)}" y1="${height - pad.bottom}" y2="${height - pad.bottom + 8}" stroke="#8f8778" stroke-width="1.5"></line>
          <text x="${gx.toFixed(1)}" y="${height - 14}" fill="#8f8778" font-size="11" font-weight="500" text-anchor="middle">${escapeHtml(truncateLabel(goal.label))}</text>
          <title>${escapeHtml(`${goal.label || "Goal"} — ${shortMoney(future)} in ${Math.round(Number(goal.horizon) || 0)} yr at these assumptions`)}</title>
        </g>
      `;
    }).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Future cost and projected resources chart" style="overflow:visible">
      ${ticks}
      ${hasBaseline ? `<path d="${monotonePath(baseMoney)}" fill="none" stroke="#7fb98a" stroke-width="2" stroke-dasharray="5 7" opacity=".45"></path>
      <path d="${monotonePath(baseCost)}" fill="none" stroke="#c8451f" stroke-width="2" stroke-dasharray="5 7" opacity=".45"></path>` : ""}
      <path d="${area} Z" fill="#f0b35b" opacity=".16"></path>
      <path d="${monotonePath(moneyPoints)}" fill="none" stroke="#7fb98a" stroke-width="${mini ? 3 : 4}" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="${stepPath(costPoints)}" fill="none" stroke="#c8451f" stroke-width="${mini ? 3 : 4}" stroke-linecap="round" stroke-linejoin="round"></path>
      ${goalTicks}
      ${crossoverPoint && !mini ? `<g class="crossover-marker">
        <circle cx="${crossoverPoint.x.toFixed(1)}" cy="${crossoverPoint.y.toFixed(1)}" r="6" fill="#c8451f" stroke="#f5f1ea" stroke-width="2"></circle>
        <text x="${Math.min(width - pad.right - 260, Math.max(pad.left, crossoverPoint.x + 10)).toFixed(1)}" y="${Math.max(pad.top + 12, crossoverPoint.y - 10).toFixed(1)}" fill="#f5f1ea" font-size="12" font-weight="800">${escapeHtml(crossoverLabel)}</text>
      </g>` : ""}
      ${mini ? "" : `<line x1="${pad.left}" x2="${width - pad.right}" y1="${height - pad.bottom}" y2="${height - pad.bottom}" stroke="rgba(143,135,120,.42)"></line>
      <text x="${pad.left}" y="${height - 12}" fill="#8f8778" font-size="11">Today</text>
      <text x="${width - pad.right - 54}" y="${height - 12}" fill="#8f8778" font-size="11">Year ${maxYear}</text>
      <text x="${lastMoney.x + 10}" y="${lastMoney.y + 4}" fill="#7fb98a" font-size="12" font-weight="800">Resources</text>
      <text x="${lastCost.x + 10}" y="${lastCost.y + 4}" fill="#c8451f" font-size="12" font-weight="800">Future cost</text>`}
      <line class="rate-guide" y1="${pad.top}" y2="${height - pad.bottom}" stroke="#8f8778" stroke-width="1" opacity="0"></line>
      <g class="rate-tooltip" opacity="0" pointer-events="none">
        <rect width="218" height="84" rx="8" fill="#0f0e0c" opacity=".92"></rect>
        <text x="10" y="20" fill="#f5f1ea" font-size="12" font-weight="700"></text>
        <text x="10" y="40" fill="#d7cfc2" font-size="12"></text>
        <text x="10" y="58" fill="#d7cfc2" font-size="12"></text>
        <text x="10" y="76" fill="#d7cfc2" font-size="12"></text>
      </g>
      <rect class="rate-overlay" x="${pad.left}" y="${pad.top}" width="${width - pad.left - pad.right}" height="${height - pad.top - pad.bottom}" fill="transparent"></rect>
    </svg>
    ${mini ? "" : `<div class="chart-legend">
      <span><i style="background:#7fb98a"></i>Projected resources</span>
      <span><i style="background:#c8451f"></i>Future cost</span>
      <span><i style="background:#f0b35b"></i>Dollar gap</span>
      ${hasBaseline ? "<span>Dashed lines show saved scenario</span>" : ""}
    </div>`}
  `;

  const svg = container.querySelector("svg");
  const overlay = container.querySelector(".rate-overlay");
  const guide = container.querySelector(".rate-guide");
  const tooltip = container.querySelector(".rate-tooltip");
  const [title, lineOne, lineTwo, lineThree] = tooltip.querySelectorAll("text");
  overlay.addEventListener("pointermove", event => {
    const rect = svg.getBoundingClientRect();
    const localX = (event.clientX - rect.left) / rect.width * width;
    const year = Math.max(0, Math.min(maxYear, Math.round((localX - pad.left) / (width - pad.left - pad.right) * maxYear)));
    const point = series.reduce((best, item) => Math.abs(item.year - year) < Math.abs(best.year - year) ? item : best, series[0]);
    const guideX = x(point.year);
    const tipX = Math.min(width - 228, Math.max(8, guideX + 12));
    const tipY = pad.top + 8;
    guide.setAttribute("x1", guideX);
    guide.setAttribute("x2", guideX);
    guide.setAttribute("opacity", "1");
    tooltip.setAttribute("transform", `translate(${tipX},${tipY})`);
    tooltip.setAttribute("opacity", "1");
    title.textContent = `Year ${point.year}`;
    lineOne.textContent = `Resources ${shortMoney(point.moneyDollars)}`;
    lineTwo.textContent = `Future cost ${shortMoney(point.costDollars)}`;
    lineThree.textContent = `Dollar gap ${shortMoney(point.moneyDollars - point.costDollars)}`;
  });
  overlay.addEventListener("pointerleave", () => {
    guide.setAttribute("opacity", "0");
    tooltip.setAttribute("opacity", "0");
  });
}
