// Pure calculation functions — vendored from the PredictionMarketsPicks main
// repo (lib/formulas.ts). No UI/React deps; plain numbers and strings only.
// This is the local free-calculator build that Glama's sandbox runs; the hosted
// server at https://predictionmarketspicks.com/api/mcp/mcp is the canonical one.

// ─── Helpers ────────────────────────────────────────────────

export function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export function formatCurrency(value) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

// ─── EV Calculator ──────────────────────────────────────────

export function calculateEVEdge(marketPrice, yourProbability) {
  if (marketPrice <= 0) return 0
  const marketProb = marketPrice / 100
  const yourProb = yourProbability / 100
  return roundTo(((yourProb - marketProb) / marketProb) * 100, 2)
}

export function getEVSignal(edgePercent) {
  if (edgePercent > 5) return 'BUY'
  if (edgePercent < -5) return 'SELL'
  return 'SKIP'
}

export function getEVInterpretation(edgePercent, signal) {
  const abs = Math.abs(edgePercent)
  if (signal === 'BUY') return `Market is ${abs.toFixed(1)}% underpriced vs. your estimate`
  if (signal === 'SELL') return `Market is ${abs.toFixed(1)}% overpriced vs. your estimate`
  return 'Market is fairly priced within your confidence interval'
}

// ─── Kelly Criterion ────────────────────────────────────────

export function calcPayoutRatio(marketPrice) {
  if (marketPrice <= 0 || marketPrice >= 1) return 0
  return (1 - marketPrice) / marketPrice
}

export function calculateKellyFraction(winProbability, payoutOdds) {
  const p = winProbability / 100
  const q = 1 - p
  const b = payoutOdds
  if (b <= 0) return 0
  return Math.max(0, (p * b - q) / b)
}

const KELLY_MULTIPLIERS = { full: 1, half: 0.5, quarter: 0.25, eighth: 0.125 }

export function applyKellyFraction(f_star, fraction) {
  return f_star * KELLY_MULTIPLIERS[fraction]
}

export function calculateKellyPositionSize(adjustedFraction, bankroll) {
  return roundTo(adjustedFraction * bankroll, 2)
}

export function getKellyRating(adjustedFraction) {
  const pct = adjustedFraction * 100
  if (pct > 15) return { rating: 'too_aggressive', message: 'Aggressive — variance will be high' }
  if (pct < 3) return { rating: 'conservative', message: 'Conservative — low variance' }
  return { rating: 'optimal', message: 'Optimal — sharp money standard' }
}

// ─── Odds conversions (probability is a 0–1 fraction) ───────
// American odds carry NO commas. +1100 / -120.

export function probToDecimal(prob) {
  if (prob <= 0 || prob > 1) return 0
  return 1 / prob
}

export function decimalToProb(decimal) {
  if (decimal <= 0) return 0
  return 1 / decimal
}

export function probToAmerican(prob) {
  if (prob <= 0 || prob >= 1) return 0
  return prob >= 0.5
    ? -Math.round((prob / (1 - prob)) * 100) // favorite
    : Math.round(((1 - prob) / prob) * 100) // underdog
}

export function americanToProb(american) {
  if (american === 0) return 0
  return american > 0 ? 100 / (american + 100) : -american / (-american + 100)
}

export function decimalToAmerican(decimal) {
  if (decimal <= 1) return 0
  return probToAmerican(1 / decimal)
}

export function americanToDecimal(american) {
  if (american === 0) return 0
  return american > 0 ? american / 100 + 1 : 100 / -american + 1
}

export function formatAmerican(american) {
  if (american == null || !Number.isFinite(american) || american === 0) return '—'
  const n = Math.round(american)
  return n > 0 ? `+${n}` : `${n}`
}

// ─── Bayes Updater ──────────────────────────────────────────

export function calculateBayesianUpdate(prior, likelihoodIfTrue, likelihoodIfFalse) {
  const p = prior / 100
  const lT = likelihoodIfTrue / 100
  const lF = likelihoodIfFalse / 100
  const numerator = lT * p
  const denominator = lT * p + lF * (1 - p)
  if (denominator === 0) return prior
  return roundTo((numerator / denominator) * 100, 2)
}

export function chainBayesUpdates(prior, evidenceItems) {
  const steps = []
  let current = prior
  for (let i = 0; i < evidenceItems.length; i++) {
    const item = evidenceItems[i]
    const posterior = calculateBayesianUpdate(current, item.likelihoodIfTrue, item.likelihoodIfFalse)
    steps.push({
      stepNumber: i + 1,
      evidenceLabel: item.label || `Evidence ${i + 1}`,
      prior: current,
      posterior,
      change: roundTo(posterior - current, 2),
    })
    current = posterior
  }
  return steps
}

// ─── Base Rate Scanner ──────────────────────────────────────

export function calculateBaseRateGap(baseRate, marketPrice) {
  return roundTo(baseRate - marketPrice, 2)
}

export function getBaseRateSignal(gap) {
  if (gap > 10) return { signal: 'strong_buy', label: 'Strong BUY' }
  if (gap > 5) return { signal: 'buy', label: 'BUY' }
  if (gap < -10) return { signal: 'strong_sell', label: 'Strong SELL' }
  if (gap < -5) return { signal: 'sell', label: 'SELL' }
  return { signal: 'neutral', label: 'NEUTRAL' }
}

export function getBaseRateInterpretation(gap, baseRate, marketPrice) {
  const abs = Math.abs(gap)
  const dir = gap > 0 ? 'lower than' : 'higher than'
  return `Market pricing ${abs.toFixed(1)}pp ${dir} the ${baseRate.toFixed(0)}% historical average`
}

export function getDataQuality(sampleSize) {
  if (sampleSize >= 20) return 'high'
  if (sampleSize >= 10) return 'medium'
  return 'low'
}
