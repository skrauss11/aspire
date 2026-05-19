export function weightedRate(items, amountKey = "amount", rateKey = "growth") {
  const total = items.reduce((sum, item) => sum + Math.max(0, Number(item[amountKey]) || 0), 0);
  if (!total) return 0;
  return items.reduce((sum, item) => {
    const amount = Math.max(0, Number(item[amountKey]) || 0);
    return sum + (amount / total) * (Number(item[rateKey]) || 0);
  }, 0);
}

export function normalizeGoals(items = []) {
  return items.map((item, index) => ({
    id: item.id || `goal-${index + 1}`,
    goalType: item.goalType || inferGoalType(item.label || item.name || item.asset),
    goalMode: item.goalMode || "life",
    label: item.label || item.name || item.asset || `Goal ${index + 1}`,
    amount: Math.max(0, Number(item.amount ?? item.cost) || 0),
    horizon: Math.max(0, Number(item.horizon ?? item.years) || 0),
    asset: item.asset || item.key || "cpi",
    growth: Number(item.growth ?? item.growthAssumption ?? item.rate) || 0,
    ...(typeof item.seeded === "boolean" ? { seeded: item.seeded } : {}),
    ...(item.sourceLabel ? { sourceLabel: item.sourceLabel } : {}),
    ...(item.vectorLabel ? { vectorLabel: item.vectorLabel } : {}),
    ...(item.customGrowth != null ? { customGrowth: Number(item.customGrowth) || 0 } : {})
  }));
}

export function normalizeAssets(items = []) {
  return items.map((item, index) => ({
    id: item.id || `asset-${index + 1}`,
    label: item.label || item.name || item.asset || `Asset ${index + 1}`,
    amount: Math.max(0, Number(item.amount ?? item.value) || 0),
    monthly: Math.max(0, Number(item.monthly ?? item.monthlyContribution) || 0),
    asset: item.asset || item.key || "cash",
    growth: Number(item.growth ?? item.growthAssumption ?? item.rate) || 0
  }));
}

export function futureGoalCost(goal, year = goal.horizon) {
  const years = Math.max(0, Number(year) || 0);
  return (Number(goal.amount) || 0) * Math.pow(1 + (Number(goal.growth) || 0) / 100, years);
}

export function futureAssetValue(asset, year = 0) {
  const years = Math.max(0, Number(year) || 0);
  const rate = (Number(asset.growth) || 0) / 100;
  const starting = (Number(asset.amount) || 0) * Math.pow(1 + rate, years);
  const annualContribution = (Number(asset.monthly) || 0) * 12;
  if (!annualContribution || !years) return starting;
  if (Math.abs(rate) < 0.000001) return starting + annualContribution * years;
  return starting + annualContribution * ((Math.pow(1 + rate, years) - 1) / rate);
}

export function project(goalsInput = [], assetsInput = []) {
  const goals = normalizeGoals(goalsInput);
  const assets = normalizeAssets(assetsInput);
  const totalGoalToday = goals.reduce((sum, goal) => sum + goal.amount, 0);
  const totalAssetsToday = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const goalDetails = goals.map(goal => ({ ...goal, futureCost: futureGoalCost(goal, goal.horizon) }));
  const totalGoals = goalDetails.reduce((sum, goal) => sum + goal.futureCost, 0);
  const horizon = totalGoals
    ? goalDetails.reduce((sum, goal) => sum + (goal.futureCost / totalGoals) * goal.horizon, 0)
    : totalGoalToday
      ? goals.reduce((sum, goal) => sum + (goal.amount / totalGoalToday) * goal.horizon, 0)
    : Math.max(...goals.map(goal => goal.horizon), 1);
  const assetDetails = assets.map(asset => ({ ...asset, futureValue: futureAssetValue(asset, horizon), years: horizon }));
  const totalAssets = assetDetails.reduce((sum, asset) => sum + asset.futureValue, 0);
  const costRate = totalGoals
    ? goalDetails.reduce((sum, goal) => sum + (goal.futureCost / totalGoals) * (Number(goal.growth) || 0), 0)
    : weightedRate(goals, "amount", "growth");
  const moneyRate = totalAssetsToday && horizon
    ? (Math.pow(totalAssets / totalAssetsToday, 1 / horizon) - 1) * 100
    : weightedRate(assets, "amount", "growth");
  const weightedCoverage = totalGoals
    ? goalDetails.reduce((sum, goal) => {
      const assetsAtGoalYear = assets.reduce((assetSum, asset) => assetSum + futureAssetValue(asset, goal.horizon), 0);
      return sum + assetsAtGoalYear;
    }, 0) / totalGoals * 100
    : 0;
  const coverage = totalGoals ? weightedCoverage : 0;
  const dollarGap = totalAssets - totalGoals;
  const gap = moneyRate - costRate;
  const status = gap >= 0 ? "Ahead" : "Behind";
  return {
    totalGoals,
    totalAssets,
    totalGoalToday,
    totalAssetsToday,
    dollarGap,
    gap,
    coverage,
    horizon: horizon || 1,
    costRate,
    moneyRate,
    status,
    goalDetails,
    assetDetails
  };
}

export function additionalMonthlyRequired(goalsInput = [], assetsInput = []) {
  const result = project(goalsInput, assetsInput);
  if (!result.totalGoals || result.dollarGap >= 0) return 0;
  const years = Math.max(0.01, result.horizon || 1);
  const rate = (Number(result.moneyRate) || 0) / 100;
  const annualFactor = Math.abs(rate) < 0.000001
    ? years
    : (Math.pow(1 + rate, years) - 1) / rate;
  if (!annualFactor) return 0;
  return Math.max(0, (result.totalGoals - result.totalAssets) / annualFactor / 12);
}

export function requiredMoneyGrowthRate(goalsInput = [], assetsInput = []) {
  const goals = normalizeGoals(goalsInput);
  const assets = normalizeAssets(assetsInput);
  const target = goals.reduce((sum, goal) => sum + futureGoalCost(goal, goal.horizon), 0);
  const starting = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const annualContribution = assets.reduce((sum, asset) => sum + asset.monthly * 12, 0);
  const horizon = project(goals, assets).horizon || 1;
  if (!target || starting >= target) return 0;
  let low = -99;
  let high = 100;
  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    const rate = mid / 100;
    const futureStarting = starting * Math.pow(1 + rate, horizon);
    const futureContrib = annualContribution
      ? Math.abs(rate) < 0.000001
        ? annualContribution * horizon
        : annualContribution * ((Math.pow(1 + rate, horizon) - 1) / rate)
      : 0;
    if (futureStarting + futureContrib >= target) high = mid;
    else low = mid;
  }
  return high;
}

export function projectionSeries(goalsInput = [], assetsInput = [], years) {
  const goals = normalizeGoals(goalsInput);
  const assets = normalizeAssets(assetsInput);
  const projected = project(goals, assets);
  const maxYears = Math.max(1, Math.ceil(Number(years) || projected.horizon || 1));
  return Array.from({ length: maxYears + 1 }, (_, year) => {
    const costDollars = goals.reduce((sum, goal) => {
      const horizon = Math.max(0, Number(goal.horizon) || 0);
      return year >= horizon ? sum + futureGoalCost(goal, year) : sum;
    }, 0);
    const moneyDollars = assets.reduce((sum, asset) => sum + futureAssetValue(asset, year), 0);
    const costRate = (Math.pow(1 + projected.costRate / 100, year) - 1) * 100;
    const moneyRate = (Math.pow(1 + projected.moneyRate / 100, year) - 1) * 100;
    return { year, costRate, moneyRate, costDollars, moneyDollars, gap: moneyRate - costRate };
  });
}

export function scenarioToBasket(state = {}) {
  const goals = normalizeGoals(state.goals || state.basket?.goals || []);
  const holdings = normalizeAssets(state.holdings || state.assets || state.basket?.holdings || []);
  const computed = project(goals, holdings);
  return {
    goals,
    holdings,
    computed: {
      moneyRate: computed.moneyRate,
      costRate: computed.costRate,
      gap: computed.gap,
      horizon: computed.horizon
    }
  };
}

export function basketToScenario(persisted = {}) {
  const basket = persisted.basket || persisted;
  return {
    goals: normalizeGoals(basket.goals || []),
    holdings: normalizeAssets(basket.holdings || basket.assets || [])
  };
}

function inferGoalType(value = "") {
  const text = String(value).toLowerCase();
  if (text.includes("home") || text.includes("house")) return "Home";
  if (text.includes("college") || text.includes("tuition") || text.includes("education")) return "College";
  if (text.includes("car") || text.includes("vehicle")) return "Car";
  if (text.includes("retire")) return "Retirement";
  if (text.includes("wedding")) return "Wedding";
  if (text.includes("child") || text.includes("family")) return "Children";
  if (text.includes("sabbatical") || text.includes("time off")) return "Time off work";
  if (text.includes("business")) return "Business investment";
  if (text.includes("medical") || text.includes("health")) return "Medical";
  return "Custom";
}
