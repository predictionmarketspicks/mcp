// Smoke test for the stdio→HTTP bridge: spawn the default entry, which connects to
// the HOSTED server, and assert the relay is verbatim. Hits production, so it is a
// separate script from `npm run smoke` (offline) and is not run in CI.

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
const client = new Client({ name: 'smoke-bridge', version: '1.0.0' })
await client.connect(transport)

const { tools } = await client.listTools()
assert(tools.length >= 20, `hosted tool set relayed (${tools.length} tools)`)
const names = tools.map((t) => t.name)
for (const t of ['calculate_ev', 'draft_board', 'find_arbitrage', 'combo_edge']) {
  assert(names.includes(t), `relays ${t}`)
}
assert(
  tools.every((t) => t.inputSchema && typeof t.description === 'string'),
  'every relayed tool keeps its schema + description',
)

// A free calculator through the bridge must match the hosted contract exactly.
const ev = await client.callTool({ name: 'calculate_ev', arguments: { marketPrice: 40, yourProbability: 55 } })
assert(ev.structuredContent?.signal === 'BUY', `calculate_ev(40,55) → BUY (got ${ev.structuredContent?.signal})`)
assert(ev.structuredContent?.track_record != null, 'graded-record field survives the relay (GEO Phase 2)')
assert(/predictionmarketspicks\.com/.test(JSON.stringify(ev)), 'branded backlink survives the relay')

// A depth-capped list tool must arrive as a 200 success carrying the cap envelope,
// never as an error — that distinction is the whole conversion funnel.
const board = await client.callTool({ name: 'draft_board', arguments: { limit: 60 } })
assert(!board.isError, 'capped draft_board relays as success, not isError')
assert(board.structuredContent?.tell_user != null, 'cap CTA (tell_user) survives the relay')
assert(
  Object.keys(board.structuredContent)[0] === 'tell_user',
  'tell_user is still the FIRST key of structuredContent after the relay',
)

// Resources back the MCP Apps cards; the bridge must pass them through.
const { resources } = await client.listResources()
assert(Array.isArray(resources), `resources relayed (${resources.length})`)

await client.close()
console.log('\nAll bridge smoke checks passed.')
process.exit(0)
