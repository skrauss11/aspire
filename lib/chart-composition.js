export function renderCompositionStrip(container, items = [], { rateKey = "growth", totalKey = "amount" } = {}) {
  if (!container) return;
  const total = items.reduce((sum, item) => sum + Math.max(0, Number(item[totalKey]) || 0), 0);
  const segments = items.map((item, index) => {
    const amount = Math.max(0, Number(item[totalKey]) || 0);
    const rate = Number(item[rateKey]) || 0;
    const contribution = total ? amount / total * rate : 0;
    return {
      label: item.label || `Item ${index + 1}`,
      rate,
      contribution,
      width: 0,
      color: COLORS[index % COLORS.length]
    };
  });
  const contributionTotal = segments.reduce((sum, segment) => sum + Math.abs(segment.contribution), 0) || 1;
  segments.forEach(segment => {
    segment.width = Math.max(2, Math.abs(segment.contribution) / contributionTotal * 100);
  });
  container.innerHTML = `
    <div class="composition-strip" aria-label="Weighted rate composition">
      ${segments.map(segment => `
        <span style="width:${segment.width.toFixed(2)}%;background:${segment.color};" title="${escapeHtml(segment.label)} · ${segment.rate.toFixed(1)}% · ${segment.contribution.toFixed(1)}pp"></span>
      `).join("")}
    </div>
    <div class="composition-legend">
      ${segments.map(segment => `<span><i style="background:${segment.color}"></i>${escapeHtml(segment.label)} ${segment.contribution.toFixed(1)}pp</span>`).join("")}
    </div>
  `;
}

const COLORS = ["#c8451f", "#f0b35b", "#7fb98a", "#63a8b8", "#8d8ad8", "#d0a84f", "#b8b0a2"];

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
}
