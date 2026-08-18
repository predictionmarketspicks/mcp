#!/usr/bin/env node
// Entry point for `npx @predictionmarketspicks/mcp`.
//
//   (no flags)   bridge stdio to the hosted server — every tool, live data
//   --local      the 6 stateless calculators, offline, no network
//   --draft      bridge to the fantasy-draft surface instead of the quant one
//   --endpoint U bridge to an explicit URL

import { runRemote } from './remote.js'
import { runLocal } from './local.js'
import { VERSION } from './version.js'

const argv = process.argv.slice(2)

if (argv.includes('--version') || argv.includes('-v')) {
  console.log(VERSION)
  process.exit(0)
}

if (argv.includes('--help') || argv.includes('-h')) {
  console.log(
    [
      `PredictionMarketsPicks MCP ${VERSION}`,
      '',
      'Usage: npx @predictionmarketspicks/mcp [options]',
      '',
      '  (default)        bridge stdio to https://predictionmarketspicks.com/api/mcp/mcp',
      '  --local          run the 6 free calculators offline (no network)',
      '  --draft          bridge to the fantasy-draft server instead',
      '  --endpoint <url> bridge to an explicit endpoint',
      '',
      'Env: PMP_API_KEY — Pro key, sent as Authorization: Bearer. Optional.',
      'Hosts that speak Streamable HTTP should use the URL directly; no install needed.',
    ].join('\n'),
  )
  process.exit(0)
}

const run = argv.includes('--local') ? runLocal : runRemote

run().catch((err) => {
  console.error('Fatal:', err?.message || err)
  process.exit(1)
})
