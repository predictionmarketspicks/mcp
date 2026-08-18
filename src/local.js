// Offline stdio MCP server — the free-calculator build of the PredictionMarketsPicks
// Quant server. Exposes the 6 stateless calculators (EV, Kelly, Bayes, odds
// conversion, base-rate gap, combo edge) with no network access, so it runs in
// any sandbox. Reached with `--local`; the default entry bridges to the hosted
// server, which additionally serves the live edge engines and the draft desk.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { MCP_TOOLS } from './tools.js'
import { VERSION } from './version.js'

export async function runLocal() {
  const server = new McpServer({
    name: 'com.predictionmarketspicks/quant',
    version: VERSION,
  })

  for (const tool of MCP_TOOLS) {
    server.registerTool(tool.name, tool.config, tool.handler)
  }

  await server.connect(new StdioServerTransport())
  // stdout is the MCP channel and must carry only protocol JSON — log to stderr.
  console.error(
    `PredictionMarketsPicks Quant ${VERSION} (offline build) — ${MCP_TOOLS.length} calculators ready on stdio`,
  )
}
