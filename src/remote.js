// stdio → Streamable HTTP bridge to the hosted PredictionMarketsPicks Quant server.
//
// Most modern MCP hosts speak Streamable HTTP natively and should point straight at
// ENDPOINT — no install. This bridge exists for stdio-only clients, and it is a pure
// pass-through on purpose: tool schemas, `structuredContent`, `_meta.ui` resource URIs
// and the cap/unlock envelope all reach the host exactly as the hosted server wrote
// them. Anything that reshapes a payload here would silently diverge from the hosted
// behaviour the tests pin.

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { VERSION } from './version.js'

export const DEFAULT_ENDPOINT = 'https://predictionmarketspicks.com/api/mcp/mcp'
export const DRAFT_ENDPOINT = 'https://predictionmarketspicks.com/api/mcp-draft/mcp'

// Verbatim relay. A permissive schema is deliberate: validating upstream results
// against a narrower shape here would strip fields the host is meant to render.
const Passthrough = z.object({}).passthrough()

export function resolveEndpoint(argv = [], env = {}) {
  const flagIndex = argv.findIndex((a) => a === '--endpoint' || a === '--url')
  if (flagIndex !== -1 && argv[flagIndex + 1]) return argv[flagIndex + 1]
  if (argv.includes('--draft')) return DRAFT_ENDPOINT
  return env.PMP_MCP_ENDPOINT || DEFAULT_ENDPOINT
}

export function resolveApiKey(env = {}) {
  return env.PMP_API_KEY || env.PREDICTIONMARKETSPICKS_API_KEY || ''
}

export async function connectUpstream({ endpoint, apiKey }) {
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined
  const client = new Client(
    { name: 'predictionmarketspicks-mcp-bridge', version: VERSION },
    { capabilities: {} },
  )
  await client.connect(
    new StreamableHTTPClientTransport(new URL(endpoint), {
      requestInit: headers ? { headers } : undefined,
    }),
  )
  return client
}

export async function runRemote({ argv = process.argv.slice(2), env = process.env } = {}) {
  const endpoint = resolveEndpoint(argv, env)
  const apiKey = resolveApiKey(env)
  const client = await connectUpstream({ endpoint, apiKey })

  const upstream = client.getServerCapabilities() || {}
  const server = new Server(
    { name: 'com.predictionmarketspicks/quant', version: VERSION },
    { capabilities: { tools: {}, ...(upstream.resources ? { resources: {} } : {}) } },
  )

  const relay = (method) => async (request) =>
    client.request({ method, params: request.params ?? {} }, Passthrough)

  server.setRequestHandler(ListToolsRequestSchema, relay('tools/list'))
  server.setRequestHandler(CallToolRequestSchema, relay('tools/call'))
  if (upstream.resources) {
    server.setRequestHandler(ListResourcesRequestSchema, relay('resources/list'))
    server.setRequestHandler(ListResourceTemplatesRequestSchema, relay('resources/templates/list'))
    server.setRequestHandler(ReadResourceRequestSchema, relay('resources/read'))
  }

  await server.connect(new StdioServerTransport())

  const { tools } = await client.request({ method: 'tools/list', params: {} }, Passthrough)
  console.error(
    `PredictionMarketsPicks Quant ${VERSION} — bridged to ${endpoint}` +
      ` (${tools?.length ?? 0} tools${apiKey ? ', key present' : ', no key: free depth'})`,
  )
  return { server, client }
}
