// package.json, server.json and src/version.js must agree. They are read by three
// different consumers (npm, the MCP registry, and every connected client's
// serverInfo), so a drift shows up as three different answers to "what version is
// this". Gates `npm publish` via prepublishOnly.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => JSON.parse(readFileSync(join(root, f), 'utf8'))

const pkg = read('package.json').version
const manifest = read('server.json').version
const src = readFileSync(join(root, 'src/version.js'), 'utf8').match(/VERSION = '([^']+)'/)?.[1]

if (pkg !== manifest || pkg !== src) {
  console.error(`FAIL: version drift — package.json ${pkg}, server.json ${manifest}, src/version.js ${src}`)
  process.exit(1)
}
console.log(`ok: version ${pkg} consistent across package.json, server.json, src/version.js`)
