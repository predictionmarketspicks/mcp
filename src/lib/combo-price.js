// Combo fair-value + verdict — vendored from the main repo
// (lib/combo-edge/price.ts), trimmed to the pure functions combo_edge uses.
// priceCombo() and its scoreline-grid dependency are omitted; the MCP tool takes
// the caller's correlation-aware joint estimate directly.

import { decimalToAmerican } from './formulas.js'

// 7-tier ladder keyed off BOTH value (EV%) and hit rate (Win%).
const LONGSHOT = 0.25
const LIKELY = 0.5
const EV_SMASH = 12
const EV_PLAY = 5
const EV_LEAN = 1.5
const EV_RUN = -5

// Per-leg model-error seed for the fair-value band.
const U_LEG = 0.03
const U_MIN = 0.06
const U_MAX = 0.25

const EPS = 1e-9
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export function verdictFor(evPct, winPct, trap) {
  if (trap || evPct <= EV_RUN) return 'RUN'
  if (evPct >= EV_LEAN) {
    if (winPct < LONGSHOT) return 'RISK'
    if (evPct >= EV_SMASH) return 'SMASH'
    if (evPct >= EV_PLAY) return 'PLAY'
    return 'LEAN'
  }
  if (winPct >= LIKELY) return 'NO_VALUE'
  return 'PASS'
}

export function fairBandFor(pJoint, legCount) {
  const U = clamp(1 - Math.pow(1 - U_LEG, Math.max(1, legCount)), U_MIN, U_MAX)
  const pLow = pJoint * (1 - U)
  const pHigh = Math.min(pJoint * (1 + U), 0.99)
  const lowDecimal = pHigh > 0 ? 1 / pHigh : 0
  const highDecimal = pLow > 0 ? 1 / pLow : 0
  return {
    uncertainty: U,
    pLow,
    pHigh,
    lowDecimal,
    highDecimal,
    lowAmerican: decimalToAmerican(lowDecimal),
    highAmerican: decimalToAmerican(highDecimal),
    lowMultiplier: lowDecimal,
    highMultiplier: highDecimal,
  }
}

// Expected maker margin. Kalshi combos / sportsbook SGPs quote ABOVE fair.
// Seeded at 1.7 percentage points on the joint.
const MAKER_MARGIN_PP = 0.017

export function expectedMakerMarginPp(legCount, pJoint) {
  void legCount
  void pJoint
  return MAKER_MARGIN_PP
}

export function expectedQuoteFor(pJoint, legCount) {
  const marginPp = expectedMakerMarginPp(legCount, pJoint)
  const prob = Math.min(pJoint + marginPp, 0.99)
  const decimal = prob > 0 ? 1 / prob : 0
  return {
    marginPp,
    prob,
    decimal,
    american: decimalToAmerican(decimal),
    multiplier: decimal,
  }
}

export function verdictForOffered(evPct, winPct, trap, offeredDecimal, band) {
  let v = verdictFor(evPct, winPct, trap)
  if (offeredDecimal <= band.lowDecimal + EPS) {
    if (v !== 'RUN' && v !== 'NO_VALUE') v = 'PASS'
  } else if (offeredDecimal <= band.highDecimal + EPS) {
    if (v === 'SMASH' || v === 'PLAY' || v === 'RISK') v = 'LEAN'
  }
  return v
}
