// The 6 free stateless calculators — vendored from the main repo
// (lib/mcp/tools.ts). Pure, no DB, no live data. The 4 Pro tools
// (find_arbitrage / market_pulse / commodity_edge / scan_mispricings) read live
// PMP edge engines behind auth and are ONLY available on the hosted server at
// https://predictionmarketspicks.com/api/mcp/mcp — they are intentionally not in
// this local build.
//
// Tool descriptions ARE agent SEO — keyword-dense, outcome-first. All copy obeys
// the word-swap table (position/trade/contract, never bet/sportsbook/wager).

import { z } from 'zod'
import {
  calculateEVEdge,
  getEVSignal,
  getEVInterpretation,
  calcPayoutRatio,
  calculateKellyFraction,
  applyKellyFraction,
  calculateKellyPositionSize,
  getKellyRating,
  chainBayesUpdates,
  probToAmerican,
  americanToProb,
  probToDecimal,
  decimalToProb,
  decimalToAmerican,
  americanToDecimal,
  formatAmerican,
  formatCurrency,
  roundTo,
  calculateBaseRateGap,
  getBaseRateSignal,
  getBaseRateInterpretation,
  getDataQuality,
} from './lib/formulas.js'
import { verdictForOffered, fairBandFor, expectedQuoteFor } from './lib/combo-price.js'
import { getBaseRateById, BASE_RATES } from './lib/base-rates.js'
import { toolResult, toolError } from './lib/format.js'

const PHASE1_ANNOTATIONS = { readOnlyHint: true, openWorldHint: false }

const sign = (n) => (n > 0 ? `+${n}` : `${n}`)

// ─── calculate_ev ────────────────────────────────────────────────────────────

const calculateEv = {
  name: 'calculate_ev',
  config: {
    title: 'Calculate EV Edge',
    description:
      'Calculate the expected-value edge on a Kalshi or Polymarket prediction-market contract. ' +
      'Given the current market price (in cents, i.e. the implied probability) and your own ' +
      'probability estimate, returns the % edge and a BUY / SELL / SKIP signal with a plain-English read. ' +
      'Use for "is this contract mispriced", "what is my edge", "should I take this position".',
    inputSchema: {
      marketPrice: z
        .number()
        .min(1)
        .max(99)
        .describe('Current contract price in cents (1–99), equal to the implied probability in %.'),
      yourProbability: z
        .number()
        .min(0)
        .max(100)
        .describe('Your own estimate of the true probability the contract resolves YES, in % (0–100).'),
    },
    annotations: PHASE1_ANNOTATIONS,
  },
  handler: (args) => {
    const marketPrice = Number(args.marketPrice)
    const yourProbability = Number(args.yourProbability)
    const edge = calculateEVEdge(marketPrice, yourProbability)
    const signal = getEVSignal(edge)
    const interpretation = getEVInterpretation(edge, signal)
    const text =
      `EV edge: ${sign(edge)}% — ${signal}. ${interpretation}. ` +
      `Market price ${marketPrice}¢ (implies ${marketPrice}%); your estimate ${yourProbability}%.`
    return toolResult('ev-calculator', text, {
      edge_pct: edge,
      signal,
      interpretation,
      market_price_cents: marketPrice,
      your_probability_pct: yourProbability,
    })
  },
}

// ─── kelly_size ──────────────────────────────────────────────────────────────

const kellySize = {
  name: 'kelly_size',
  config: {
    title: 'Kelly Position Size',
    description:
      'Compute the optimal Kelly position size for a prediction-market contract. Given your win ' +
      'probability, the market price (which sets the payout), your bankroll, and a Kelly fraction ' +
      '(full / half / quarter / eighth), returns the dollar stake and a risk rating. Use for ' +
      '"how much should I stake", "what is my position size", "Kelly sizing for this trade".',
    inputSchema: {
      winProbability: z.number().min(0).max(100).describe('Your probability the contract resolves YES, in % (0–100).'),
      marketPrice: z.number().min(1).max(99).describe('Contract price in cents (1–99). Sets the payout ratio.'),
      bankroll: z.number().positive().describe('Total bankroll in dollars.'),
      fraction: z
        .enum(['full', 'half', 'quarter', 'eighth'])
        .default('half')
        .describe('Kelly fraction to apply. Half-Kelly is the common sharp-money default.'),
    },
    annotations: PHASE1_ANNOTATIONS,
  },
  handler: (args) => {
    const winProbability = Number(args.winProbability)
    const marketPrice = Number(args.marketPrice)
    const bankroll = Number(args.bankroll)
    const fraction = args.fraction ?? 'half'
    const payout = calcPayoutRatio(marketPrice / 100)
    const fStar = calculateKellyFraction(winProbability, payout)
    const adjusted = applyKellyFraction(fStar, fraction)
    const size = calculateKellyPositionSize(adjusted, bankroll)
    const rating = getKellyRating(adjusted)
    const text =
      `${fraction}-Kelly stake: ${formatCurrency(size)} of a ${formatCurrency(bankroll)} bankroll ` +
      `(${roundTo(adjusted * 100, 1)}% of bankroll). Full-Kelly f* = ${roundTo(fStar * 100, 1)}%, ` +
      `payout ratio ${roundTo(payout, 2)}:1. ${rating.message}.`
    return toolResult('kelly', text, {
      stake_dollars: size,
      fraction,
      full_kelly_pct: roundTo(fStar * 100, 1),
      applied_fraction_pct: roundTo(adjusted * 100, 1),
      payout_ratio: roundTo(payout, 2),
      rating: rating.rating,
      bankroll,
    })
  },
}

// ─── bayes_update ────────────────────────────────────────────────────────────

const bayesUpdate = {
  name: 'bayes_update',
  config: {
    title: 'Bayesian Probability Update',
    description:
      'Update a prior probability with one or more pieces of evidence using Bayes theorem. Given a ' +
      'prior and a list of evidence items (each with P(evidence | true) and P(evidence | false)), ' +
      'returns the posterior probability and the per-step chain. Use for "update my estimate with new ' +
      'information", "posterior probability", "how does this news change the odds".',
    inputSchema: {
      prior: z.number().min(0).max(100).describe('Prior probability the hypothesis is true, in % (0–100).'),
      evidence: z
        .array(
          z.object({
            label: z.string().describe('Short label for this piece of evidence.'),
            likelihoodIfTrue: z
              .number()
              .min(0)
              .max(100)
              .describe('P(observing this evidence | hypothesis is true), in % (0–100).'),
            likelihoodIfFalse: z
              .number()
              .min(0)
              .max(100)
              .describe('P(observing this evidence | hypothesis is false), in % (0–100).'),
          }),
        )
        .min(1)
        .describe('One or more evidence items, applied in order.'),
    },
    annotations: PHASE1_ANNOTATIONS,
  },
  handler: (args) => {
    const prior = Number(args.prior)
    const evidence = args.evidence ?? []
    const steps = chainBayesUpdates(prior, evidence)
    const posterior = steps.length ? steps[steps.length - 1].posterior : prior
    const lines = steps.map(
      (s) => `  ${s.stepNumber}. ${s.evidenceLabel}: ${s.prior}% → ${s.posterior}% (${sign(s.change)}pp)`,
    )
    const text = `Prior ${prior}% → posterior ${posterior}% after ${steps.length} update(s):\n${lines.join('\n')}`
    return toolResult('bayes-updater', text, {
      prior,
      posterior,
      steps: steps.map((s) => ({
        step: s.stepNumber,
        label: s.evidenceLabel,
        prior_pct: s.prior,
        posterior_pct: s.posterior,
        change_pp: s.change,
      })),
    })
  },
}

// ─── convert_probability ─────────────────────────────────────────────────────

const convertProbability = {
  name: 'convert_probability',
  config: {
    title: 'Convert Probability / Odds',
    description:
      'Convert between implied probability, American odds, and decimal odds. Give one value and its ' +
      'format and get all three back (American odds carry no commas, e.g. +441 or -200). Use for ' +
      '"what is +150 as a probability", "convert 62% to American odds", "decimal to implied odds".',
    inputSchema: {
      value: z.number().describe('The numeric value to convert.'),
      format: z
        .enum(['probability', 'american', 'decimal'])
        .describe('Format of `value`: probability (0–100 %), american (e.g. -200 / +150), or decimal (e.g. 2.5).'),
    },
    annotations: PHASE1_ANNOTATIONS,
  },
  handler: (args) => {
    const value = Number(args.value)
    const format = args.format
    let prob
    if (format === 'probability') prob = value / 100
    else if (format === 'american') prob = americanToProb(value)
    else prob = decimalToProb(value)

    if (!(prob > 0 && prob < 1)) {
      return toolError(
        'Value is out of range. Probability must be 0–100 (exclusive), American odds nonzero, decimal odds > 1.',
      )
    }
    const probPct = roundTo(prob * 100, 2)
    const american = probToAmerican(prob)
    const decimal = roundTo(probToDecimal(prob), 3)
    const text = `${probPct}% implied probability = ${formatAmerican(american)} American = ${decimal} decimal odds.`
    return toolResult('probability-converter', text, {
      probability_pct: probPct,
      american_odds: formatAmerican(american),
      decimal_odds: decimal,
    })
  },
}

// ─── base_rate_gap ───────────────────────────────────────────────────────────

const baseRateIds = BASE_RATES.map((r) => r.id)

const baseRateGap = {
  name: 'base_rate_gap',
  config: {
    title: 'Base Rate Gap',
    description:
      'Compare a market price against the historical base rate for a class of events and get the gap ' +
      'in percentage points plus a signal and sample-size quality. Pass either a known base-rate id ' +
      `(one of: ${baseRateIds.join(', ')}) or your own baseRateValue. Use for "how does this price ` +
      'compare to history", "is the market ignoring the base rate", "historical frequency vs market".',
    inputSchema: {
      marketPrice: z.number().min(0).max(100).describe('Current market price in cents / implied probability % (0–100).'),
      baseRateId: z
        .enum(baseRateIds)
        .optional()
        .describe('Known base-rate id to look up (includes sample size + source).'),
      baseRateValue: z
        .number()
        .min(0)
        .max(100)
        .optional()
        .describe('Your own base rate in % (0–100), used when no baseRateId is given.'),
    },
    annotations: PHASE1_ANNOTATIONS,
  },
  handler: (args) => {
    const marketPrice = Number(args.marketPrice)
    const baseRateId = args.baseRateId
    const baseRateValueArg = args.baseRateValue

    let baseRate
    let sampleSize = null
    let label = 'custom base rate'
    let source = null

    if (baseRateId) {
      const entry = getBaseRateById(baseRateId)
      if (!entry) {
        return toolError(`Unknown baseRateId "${baseRateId}". Available ids: ${baseRateIds.join(', ')}.`)
      }
      baseRate = entry.baseRate
      sampleSize = entry.sampleSize
      label = entry.label
      source = entry.source
    } else if (typeof baseRateValueArg === 'number') {
      baseRate = baseRateValueArg
    } else {
      return toolError('Provide either a baseRateId or a baseRateValue.')
    }

    const gap = calculateBaseRateGap(baseRate, marketPrice)
    const signal = getBaseRateSignal(gap)
    const quality = sampleSize != null ? getDataQuality(sampleSize) : 'unknown'
    const interpretation = getBaseRateInterpretation(gap, baseRate, marketPrice)
    const text =
      `${label}: base rate ${baseRate}% vs market ${marketPrice}% → gap ${sign(gap)}pp — ${signal.label}. ` +
      `${interpretation}. Sample quality: ${quality}` +
      `${sampleSize != null ? ` (n=${sampleSize})` : ''}${source ? `, source: ${source}` : ''}.`
    return toolResult('base-rate', text, {
      base_rate_pct: baseRate,
      market_price_pct: marketPrice,
      gap_pp: gap,
      signal: signal.signal,
      signal_label: signal.label,
      sample_quality: quality,
      sample_size: sampleSize,
    })
  },
}

// ─── combo_edge (FREE — same-game combo fair value + verdict) ────────────────
// The naive product of the leg prices is NOT a purchasable combo price — no
// venue pays it on legs that settle simultaneously, so it never grades the
// verdict. We publish a fair-value BAND and grade the trader's actual quote
// against it. A number ≥100 (integer) or negative is American odds; anything
// else >1 is a decimal payout multiplier.
function offeredNumberToDecimal(v) {
  if (!Number.isFinite(v)) return null
  if (v < 0 || (Number.isInteger(v) && Math.abs(v) >= 100)) {
    const d = americanToDecimal(v)
    return d > 1 ? d : null
  }
  return v > 1 ? v : null
}

const comboEdge = {
  name: 'combo_edge',
  config: {
    title: 'Combo Edge Verdict',
    description:
      'Grade a same-game combo (parlay-style multi-leg position) on a prediction market against its ' +
      'fair value. Given each leg price in cents and your correlation-aware estimate of the true joint ' +
      'win probability, returns the fair-value ODDS BAND to grade a quote against. Pass offeredOdds — ' +
      "the price your platform actually quotes for the combo (Kalshi combo RFQ or an SGP product) — to " +
      'get the expected-value %, a negative-correlation-trap flag, and a 7-tier verdict (SMASH / PLAY / ' +
      'LEAN / RISK / NO_VALUE / PASS / RUN). Without offeredOdds it returns fair value + band only (no ' +
      'verdict) — never grade EV off the product of the leg prices, which no venue pays. Use for "is this ' +
      'combo worth it", "grade my parlay quote", "same-game combo value".',
    inputSchema: {
      legPrices: z
        .array(z.number().min(1).max(99))
        .min(2)
        .describe("Each leg's YES price in cents (1–99). Used only for the theoretical assemble ceiling."),
      trueWinProbability: z
        .number()
        .min(0)
        .max(100)
        .describe('Your correlation-aware estimate of the true joint probability all legs hit, in % (0–100).'),
      offeredOdds: z
        .number()
        .optional()
        .describe(
          'The combo price your platform actually quotes — American odds (e.g. -150, 988) or a decimal ' +
            'payout multiplier (e.g. 10.7). Grades EV + verdict against fair value. Omit to get fair value + band only.',
        ),
    },
    annotations: PHASE1_ANNOTATIONS,
  },
  handler: (args) => {
    const legPrices = args.legPrices ?? []
    const trueWinProbability = Number(args.trueWinProbability)
    const trueProb = trueWinProbability / 100
    const indepProb = legPrices.reduce((acc, c) => acc * (c / 100), 1) // naive product of marginals
    if (!(indepProb > 0) || !(trueProb > 0 && trueProb <= 1)) {
      return toolError('Provide 2+ leg prices (1–99¢) and a true win probability in 0–100.')
    }
    const legCount = legPrices.length
    const assembleDecimal = 1 / indepProb // theoretical only — NOT a purchasable price
    const fairAmerican = probToAmerican(trueProb)
    const trap = trueProb < indepProb // your joint below the naive product
    const band = fairBandFor(trueProb, legCount)
    const fairBandOut = {
      low_american: band.lowAmerican,
      high_american: band.highAmerican,
      low_multiplier: roundTo(band.lowMultiplier, 2),
      high_multiplier: roundTo(band.highMultiplier, 2),
    }
    const expected = expectedQuoteFor(trueProb, legCount)
    const expectedQuoteOut = {
      american: expected.american,
      multiplier: roundTo(expected.multiplier, 2),
    }

    const offeredDecimal =
      args.offeredOdds == null ? null : offeredNumberToDecimal(Number(args.offeredOdds))

    if (offeredDecimal == null) {
      const text =
        `${legCount}-leg combo — fair value ${formatAmerican(fairAmerican)} (joint ${trueWinProbability}%). ` +
        `Fair-value play: between ${band.lowMultiplier.toFixed(1)}x and ${band.highMultiplier.toFixed(1)}x ` +
        `(${formatAmerican(band.lowAmerican)} to ${formatAmerican(band.highAmerican)}). ` +
        `A maker will likely quote near ${expected.multiplier.toFixed(1)}x (${formatAmerican(expected.american)}). ` +
        `Supply offeredOdds — the price your platform quotes for the combo — to grade EV and get a verdict. ` +
        `The product of the leg prices (${roundTo(indepProb * 100, 1)}%) is a theoretical assemble ceiling only; no venue pays it.` +
        (trap ? ' ⚠ Negative-correlation trap: your joint is below the naive product.' : '')
      return toolResult('combo-edge-builder', text, {
        leg_count: legCount,
        verdict: null,
        ev_pct: null,
        true_win_pct: trueWinProbability,
        fair_american: formatAmerican(fairAmerican),
        fair_band: fairBandOut,
        expected_quote: expectedQuoteOut,
        theoretical_assemble_ceiling: {
          pct: roundTo(indepProb * 100, 1),
          american: formatAmerican(decimalToAmerican(assembleDecimal)),
        },
        offered_american: null,
        negative_correlation_trap: trap,
      })
    }

    const evPct = roundTo((trueProb * offeredDecimal - 1) * 100, 2)
    const verdict = verdictForOffered(evPct, trueProb, trap, offeredDecimal, band)
    const offeredAmerican = decimalToAmerican(offeredDecimal)
    const text =
      `${legCount}-leg combo — ${verdict}. EV ${sign(evPct)}% at your quote of ${formatAmerican(offeredAmerican)}. ` +
      `Fair value ${formatAmerican(fairAmerican)}; fair-value play between ${band.lowMultiplier.toFixed(1)}x and ${band.highMultiplier.toFixed(1)}x ` +
      `(${formatAmerican(band.lowAmerican)} to ${formatAmerican(band.highAmerican)}). Your joint ${trueWinProbability}%.` +
      (trap ? ' ⚠ Negative-correlation trap: your joint is below the naive product — the price is a mirage.' : '')
    return toolResult('combo-edge-builder', text, {
      leg_count: legCount,
      verdict,
      ev_pct: evPct,
      true_win_pct: trueWinProbability,
      fair_american: formatAmerican(fairAmerican),
      fair_band: fairBandOut,
      expected_quote: expectedQuoteOut,
      offered_american: formatAmerican(offeredAmerican),
      negative_correlation_trap: trap,
    })
  },
}

export const MCP_TOOLS = [calculateEv, kellySize, bayesUpdate, convertProbability, baseRateGap, comboEdge]
