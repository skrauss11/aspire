import { project, scenarioToBasket, normalizeGoals, normalizeAssets } from "./aspire.js";

export const DRAFT_KEY = "aspire:scenario:draft";

export function toPersisted(state = {}) {
  const basket = scenarioToBasket(state);
  basket.goals = preserveGoalSeeded(basket.goals, state.goals || state.basket?.goals || []);
  const computed = project(basket.goals, basket.holdings);
  return {
    version: 1,
    createdAt: state.createdAt || new Date().toISOString(),
    score: Math.max(0, Math.min(100, Math.round(computed.coverage))),
    basket: {
      goals: basket.goals,
      holdings: basket.holdings,
      computed: {
        moneyRate: computed.moneyRate,
        costRate: computed.costRate,
        gap: computed.gap,
        horizon: computed.horizon
      }
    }
  };
}

export function fromPersisted(input = {}) {
  const scenario = migrate(input);
  const goals = preserveGoalSeeded(normalizeGoals(scenario.basket?.goals || []), scenario.basket?.goals || []);
  return {
    version: 1,
    createdAt: scenario.createdAt || new Date().toISOString(),
    score: Number(scenario.score) || 0,
    basket: {
      goals,
      holdings: normalizeAssets(scenario.basket?.holdings || scenario.basket?.assets || []),
      computed: scenario.basket?.computed || scenario.computed || {}
    }
  };
}

export function migrate(input = {}) {
  if (input.version === 1 && input.basket) return input;
  const basket = input.basket || input;
  return toPersisted({
    createdAt: input.createdAt,
    goals: basket.goals || [],
    holdings: basket.holdings || basket.assets || []
  });
}

export function validate(input = {}) {
  const scenario = fromPersisted(input);
  const hasGoal = scenario.basket.goals.some(goal => goal.amount > 0 && goal.horizon > 0);
  const hasAsset = scenario.basket.holdings.some(asset => asset.amount > 0);
  return { ok: hasGoal && hasAsset, scenario, errors: hasGoal && hasAsset ? [] : ["Valid goals and holdings are required."] };
}

export function encodeFallbackToken(scenario) {
  const json = JSON.stringify(fromPersisted(scenario));
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeFallbackToken(token = "") {
  const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return fromPersisted(JSON.parse(decodeURIComponent(escape(atob(padded)))));
}

function preserveGoalSeeded(goals = [], sourceGoals = []) {
  return goals.map((goal, index) => {
    const source = sourceGoals[index] || {};
    return {
      ...goal,
      ...(typeof source.seeded === "boolean" ? { seeded: source.seeded } : {})
    };
  });
}
