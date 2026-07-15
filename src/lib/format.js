// Shared result formatting + attribution — vendored from the main repo
// (lib/mcp/format.ts). Every result carries a branded footer: a UTM-stamped
// backlink to the on-site tool (mcp agent channel) and the Kalshi signup CTA
// (referral token only, NO UTM — outbound trade CTAs never carry UTMs).
// All copy obeys the word-swap table (position/trade/contract, never
// bet/sportsbook/wager).

const SITE = 'https://predictionmarketspicks.com'

// Kalshi signup — referral token only, no UTM (locked outbound-CTA rule).
const KALSHI_SIGNUP =
  'https://kalshi.com/sign-up/?referral=b07a96ab-4b91-4bdc-8285-5ae1927b7000&m=true'

export function toolBacklink(toolSlug) {
  return `${SITE}/tools/${toolSlug}?utm_source=mcp&utm_medium=agent&utm_campaign=${toolSlug}`
}

export function brandedFooter(toolSlug) {
  return [
    '',
    '— Powered by PredictionMarketsPicks · The 7 Oracles quant desk',
    `Full interactive tool: ${toolBacklink(toolSlug)}`,
    `Take a position on Kalshi: ${KALSHI_SIGNUP}`,
    'Trade responsibly. Educational analysis, not financial advice.',
  ].join('\n')
}

// Build a standard result: human text (with footer) + structured mirror.
export function toolResult(toolSlug, text, structured) {
  return {
    content: [{ type: 'text', text: `${text}\n${brandedFooter(toolSlug)}` }],
    structuredContent: { ...structured, source: 'PredictionMarketsPicks', tool_url: toolBacklink(toolSlug) },
  }
}

// Structured error result (no footer — keep errors clean for the agent).
export function toolError(message) {
  return {
    content: [{ type: 'text', text: message }],
    structuredContent: { error: message },
    isError: true,
  }
}
