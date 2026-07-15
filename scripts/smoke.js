// Smoke test: spawn the stdio server, list tools, call a few, assert output.
// Exits non-zero on any failure so CI (and Glama's build test) can gate on it.

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const serverPath = join(__dirname, '..', 'src', 'index.js')

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg)
    process.exit(1)
  }
  console.log('ok:', msg)
}

const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] })
const client = new Client({ name: 'smoke', version: '1.0.0' })
await client.connect(transport)

// tools/list
const { tools } = await client.listTools()
const names = tools.map((t) => t.name).sort()
assert(names.length === 6, `6 tools listed (got ${names.length}: ${names.join(', ')})`)
const expected = ['base_rate_gap', 'bayes_update', 'calculate_ev', 'combo_edge', 'convert_probability', 'kelly_size']
assert(JSON.stringify(names) === JSON.stringify(expected), 'tool names match the free-tier set')

// calculate_ev — 40¢ vs 55% → +37.5% edge, BUY
const ev = await client.callTool({ name: 'calculate_ev', arguments: { marketPrice: 40, yourProbability: 55 } })
assert(ev.structuredContent?.signal === 'BUY', `calculate_ev(40,55) → BUY (got ${ev.structuredContent?.signal})`)
assert(ev.structuredContent?.edge_pct === 37.5, `calculate_ev edge 37.5 (got ${ev.structuredContent?.edge_pct})`)
assert(/predictionmarketspicks\.com\/tools\/ev-calculator/.test(ev.content[0].text), 'ev result carries branded backlink')

// convert_probability — +150 american → 40%
const conv = await client.callTool({ name: 'convert_probability', arguments: { value: 150, format: 'american' } })
assert(conv.structuredContent?.probability_pct === 40, `convert +150 → 40% (got ${conv.structuredContent?.probability_pct})`)

// kelly_size — sanity: positive stake, structured fields present
const kelly = await client.callTool({
  name: 'kelly_size',
  arguments: { winProbability: 60, marketPrice: 50, bankroll: 1000, fraction: 'half' },
})
assert(typeof kelly.structuredContent?.stake_dollars === 'number', 'kelly returns a numeric stake')

// combo_edge without offeredOdds — fair value + band, verdict withheld
const combo = await client.callTool({
  name: 'combo_edge',
  arguments: { legPrices: [50, 50], trueWinProbability: 30 },
})
assert(combo.structuredContent?.verdict === null, 'combo_edge withholds verdict without offeredOdds')
assert(combo.structuredContent?.fair_band != null, 'combo_edge returns a fair-value band')

// no vendor / OPRA leakage in any text output (defensive)
const allText = [ev, conv, kelly, combo].map((r) => r.content[0].text).join(' ').toLowerCase()
assert(!/(databento|opra|tradier|massive)/.test(allText), 'no vendor names leak in output')

await client.close()
console.log('\nAll smoke checks passed.')
process.exit(0)
