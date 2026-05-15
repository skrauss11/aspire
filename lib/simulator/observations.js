import { project } from "../aspire.js";

const CASH_BASELINE = 4;

export function observe(currentScenario = {}, baselineScenario = {}) {
  const current = currentScenario.basket || currentScenario;
  const baseline = baselineScenario.basket || baselineScenario;
  const goals = current.goals || [];
  const holdings = current.holdings || [];
  const result = project(goals, holdings);
  const baselineResult = project(baseline.goals || [], baseline.holdings || []);
  const cards = [
    largestCostDriver(goals),
    allocationSkew(holdings),
    highCagrComponent(goals),
    longTimeline(result),
    lowMoneyGrowth(result),
    bigGap(result),
    userAhead(result),
    shiftedFromBaseline(result, baselineResult)
  ].filter(Boolean);

  if (!cards.length) {
    return [{
      id: "quiet-baseline",
      score: 1,
      observation: "Your scenario sits close to the model's baseline assumptions. Move any lever to see your gap respond.",
      pointer: null
    }];
  }

  return cards
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ score, ...card }) => card);
}

function largestCostDriver(goals) {
  const positiveGoals = goals.filter(goal => Number(goal.amount) > 0);
  const totalWeighted = positiveGoals.reduce((sum, goal) => sum + Number(goal.amount) * Math.max(0, Number(goal.growth) || 0), 0);
  if (!positiveGoals.length || !totalWeighted) return null;
  const driver = positiveGoals
    .map(goal => ({
      label: cleanLabel(goal.label || goal.goalType || "This goal"),
      share: (Number(goal.amount) * Math.max(0, Number(goal.growth) || 0)) / totalWeighted,
      growth: Number(goal.growth) || 0
    }))
    .sort((a, b) => b.share - a.share)[0];
  const share = Math.round(driver.share * 100);
  return {
    id: "largest-cost-driver",
    score: share,
    observation: `${driver.label} is ${share}% of your cost growth — the largest single driver.`,
    pointer: { label: "Refine the basket", target: { type: "lever", name: "basket" } }
  };
}

function allocationSkew(holdings) {
  const total = holdings.reduce((sum, asset) => sum + Math.max(0, Number(asset.amount) || 0), 0);
  if (!total) return null;
  const bucket = holdings
    .map(asset => ({
      label: cleanLabel(asset.label || asset.asset || "This bucket"),
      share: (Number(asset.amount) || 0) / total,
      growth: Number(asset.growth) || 0
    }))
    .sort((a, b) => b.share - a.share)[0];
  if (bucket.share <= 0.5) return null;
  const share = Math.round(bucket.share * 100);
  return {
    id: "allocation-skew",
    score: share,
    observation: `Your allocation is ${share}% ${bucket.label}. ${bucket.label} is assumed to grow at ${bucket.growth.toFixed(1)}%.`,
    pointer: { label: "See what the Allocation lever does", target: { type: "lever", name: "allocation" } }
  };
}

function highCagrComponent(goals) {
  const highest = goals
    .map(goal => ({ label: cleanLabel(goal.label || goal.goalType || "This component"), growth: Number(goal.growth) || 0 }))
    .sort((a, b) => b.growth - a.growth)[0];
  if (!highest || highest.growth <= 10) return null;
  return {
    id: "high-cagr-component",
    score: highest.growth * 5,
    observation: `${highest.label} is your highest-CAGR component — ${highest.growth.toFixed(1)}% at these assumptions.`,
    pointer: { label: "Try a different basket", target: { type: "lever", name: "basket" } }
  };
}

function longTimeline(result) {
  const years = Math.round(Number(result.horizon) || 0);
  if (years < 20) return null;
  return {
    id: "long-timeline",
    score: years * 2,
    observation: `Your timeline is ${years} years. Long horizons compound small contribution changes meaningfully.`,
    pointer: { label: "Move the Timeline lever", target: { type: "lever", name: "timeline" } }
  };
}

function lowMoneyGrowth(result) {
  if (Number(result.moneyRate) >= 5) return null;
  return {
    id: "low-money-growth",
    score: (5 - Number(result.moneyRate)) * 20,
    observation: `Your money is growing at ${result.moneyRate.toFixed(1)}% — close to the cash-only baseline of ${CASH_BASELINE.toFixed(1)}%.`,
    pointer: { label: "See what allocation does", target: { type: "lever", name: "allocation" } }
  };
}

function bigGap(result) {
  if (Number(result.gap) >= -15) return null;
  return {
    id: "big-gap",
    score: Math.abs(result.gap) * 10,
    observation: `Your gap is ${Math.abs(result.gap).toFixed(1)} pts. At these assumptions, no single lever closes it alone.`,
    pointer: null
  };
}

function userAhead(result) {
  if (Number(result.gap) <= 0) return null;
  return {
    id: "user-ahead",
    score: Number(result.gap) * 10,
    observation: `At these assumptions, you're ahead by ${result.gap.toFixed(1)} pts. Markets and rates move quarterly — worth checking back.`,
    pointer: { label: "Stress-test the CAGR assumptions", target: { type: "lever", name: "cagr" } }
  };
}

function shiftedFromBaseline(result, baselineResult) {
  const delta = Number(result.gap) - Number(baselineResult.gap);
  if (Math.abs(delta) < 1) return null;
  return {
    id: "baseline-shift",
    score: Math.abs(delta) * 8,
    observation: `This scenario has moved your gap ${delta >= 0 ? "up" : "down"} by ${Math.abs(delta).toFixed(1)} pts versus your current state.`,
    pointer: { label: "Compare the trajectory lines", target: { type: "chart", name: "trajectory" } }
  };
}

function cleanLabel(value = "") {
  return String(value)
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim() || "This component";
}
