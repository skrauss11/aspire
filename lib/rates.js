const FALLBACK_RATES = [
  { key: "cash", label: "Cash / HYSA", cagrTrailing: 4, cagrForwardSuggested: 4, group: "Cash" },
  { key: "checking", label: "Checking (no yield)", cagrTrailing: 0.5, cagrForwardSuggested: 0.5, group: "Cash" }
];

let cache;

export async function loadRates() {
  if (cache) return cache;
  const res = await fetch("/rates.json", { cache: "no-store" });
  const data = res.ok ? await res.json() : { rates: [] };
  const existing = new Set((data.rates || []).map(rate => rate.key));
  cache = {
    ...data,
    rates: [
      ...(data.rates || []).map(rate => ({
        ...rate,
        cagrTrailing: Number(rate.cagrTrailing) || 0,
        cagrForwardSuggested: Number(rate.cagrForwardSuggested ?? rate.cagrTrailing) || 0
      })),
      ...FALLBACK_RATES.filter(rate => !existing.has(rate.key))
    ]
  };
  return cache;
}

export async function ratesByKey() {
  const data = await loadRates();
  return Object.fromEntries(data.rates.map(rate => [rate.key, rate]));
}

export function rateForKey(map, key, mode = "forwardSuggested") {
  const rate = map[key];
  if (!rate) return 0;
  return mode === "trailing" ? Number(rate.cagrTrailing) || 0 : Number(rate.cagrForwardSuggested) || 0;
}

export function labelForKey(map, key) {
  return map[key]?.label || key || "Custom";
}

export function groupedOptions(rates, selected) {
  return optionsForRates(rates, selected, () => true);
}

export function goalRateOptions(rates, selected) {
  return optionsForRates(rates, selected, rate => {
    const key = rate.key || "";
    const group = rate.group || inferGroup(key);
    return group === "Life costs" || group === "Home" || group === "Tuition" || ["cpi", "health", "car"].includes(key);
  });
}

export function holdingRateOptions(rates, selected, includeAdvanced = false) {
  return optionsForRates(rates, selected, rate => {
    const key = rate.key || "";
    const group = rate.group || inferGroup(key);
    return group === "Cash" || ["sp500", "qqq", "gold"].includes(key) || (includeAdvanced && ["single", "btc"].includes(key));
  });
}

export function advancedHoldingRateOptions(rates, selected) {
  return optionsForRates(rates, selected, rate => {
    const key = rate.key || "";
    return ["single", "btc"].includes(key);
  });
}

function optionsForRates(rates, selected, predicate) {
  const groups = {};
  const filtered = rates.filter(predicate);
  if (selected && rates.some(rate => rate.key === selected) && !filtered.some(rate => rate.key === selected)) {
    filtered.push(rates.find(rate => rate.key === selected));
  }
  for (const rate of filtered) {
    const group = rate.group || inferGroup(rate.key);
    const label = ["single", "btc"].includes(rate.key) ? "Advanced assumptions" : group;
    (groups[label] = groups[label] || []).push(rate);
  }
  return Object.entries(groups).map(([group, items]) => {
    const options = items.map(rate => {
      const value = Number(rate.cagrForwardSuggested) || 0;
      return `<option value="${rate.key}" ${rate.key === selected ? "selected" : ""}>${rate.label} (${value.toFixed(1)}%)</option>`;
    }).join("");
    return `<optgroup label="${group}">${options}</optgroup>`;
  }).join("");
}

function inferGroup(key = "") {
  if (key.startsWith("home")) return "Home";
  if (key.startsWith("tuition")) return "Tuition";
  if (["sp500", "qqq", "single", "btc", "gold"].includes(key)) return "Markets";
  if (["cash", "checking"].includes(key)) return "Cash";
  return "Life costs";
}
