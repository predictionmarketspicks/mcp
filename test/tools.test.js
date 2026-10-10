// Starts the stdio server (offline --local calculators), lists its tools and checks each
// declares a name and an inputSchema. Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const serverPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'index.js')

test('tools/list returns well-formed tools', async () => {
  const client = new Client({ name: 'tools-test', version: '1.0.0' })
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [serverPath, '--local'] }))
  try {
    const { tools } = await client.listTools()
    assert.ok(tools.length > 0, 'at least one tool')
    for (const t of tools) {
      assert.equal(typeof t.name, 'string', 'tool has a name')
      assert.ok(t.name.length > 0, 'tool name is non-empty')
      assert.equal(t.inputSchema?.type, 'object', `${t.name} declares an object inputSchema`)
    }
  } finally {
    await client.close()
  }
})
