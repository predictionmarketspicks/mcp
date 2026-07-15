#!/usr/bin/env node
// Local stdio MCP server — the free-calculator build of the PredictionMarketsPicks
// Quant server. Exposes the 6 stateless calculators (EV, Kelly, Bayes, odds
// conversion, base-rate gap, combo edge) with no network access, so it runs in
// any sandbox. The hosted server at https://predictionmarketspicks.com/api/mcp/mcp
// is canonical and additionally serves the 4 Pro tools (live edge engines).

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { MCP_TOOLS } from './tools.js'

const server = new McpServer({
  name: 'com.predictionmarketspicks/quant',
  version: '1.2.1',
})

for (const tool of MCP_TOOLS) {
  server.registerTool(tool.name, tool.config, tool.handler)
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // stdio server stays alive on the transport; log to stderr (stdout is the
  // MCP channel and must carry only protocol JSON).
  console.error('PredictionMarketsPicks Quant (local free tier) — 6 tools ready on stdio')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
