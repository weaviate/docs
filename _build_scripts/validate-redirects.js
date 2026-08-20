/**
 * Structural checks on the /e/<id> error-message redirector in netlify.toml.
 *
 * These invariants are load-bearing and none of them is enforced by anything
 * else: Netlify does not validate the file, the Docusaurus build never reads
 * it, and the link crawler only sees pages. They are also each one careless
 * edit away from breaking, which is why this exists rather than a comment.
 *
 * Reads netlify.toml and the MDX under docs/. Needs no build and no network.
 *
 *   node _build_scripts/validate-redirects.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const TOML = path.join(ROOT, 'netlify.toml')
const BLOCK_MARKER = 'ERROR-MESSAGE REDIRECTOR'

const failures = []
const fail = (msg) => failures.push(msg)

const toml = fs.readFileSync(TOML, 'utf8')
const markerAt = toml.indexOf(BLOCK_MARKER)
if (markerAt === -1) {
  console.error(`Could not find the "${BLOCK_MARKER}" block in netlify.toml.`)
  process.exit(1)
}

// Parse only the /e/ rules, in file order. Netlify matches first-to-last, so
// order is semantics here, not formatting.
const RULE = /\[\[redirects\]\]\nfrom = "(\/e\/[^"]+)"\nto {3}= "([^"]+)"\nstatus = (\d+)/g
const rules = [...toml.slice(markerAt).matchAll(RULE)].map(([, from, to, status]) => ({
  from,
  to,
  status,
}))

if (rules.length === 0) fail('No /e/ redirect rules found.')

const splats = rules.filter((r) => r.from.includes('*'))
const specific = rules.filter((r) => !r.from.includes('*'))
const last = rules[rules.length - 1]

// 1. Exactly one catch-all, and it is the last /e/ rule. A rule appended after
//    it would be unreachable, because the catch-all matches everything first.
if (splats.length !== 1) {
  fail(`Expected exactly one splat rule in the /e/ block, found ${splats.length}: ${splats.map((r) => r.from).join(', ')}`)
} else if (splats[0].from !== '/e/*') {
  fail(`The only splat should be "/e/*", found "${splats[0].from}".`)
} else if (last.from !== '/e/*') {
  fail(`The catch-all must be the LAST /e/ rule, but "${last.from}" follows it. Rules after the catch-all can never match.`)
}

// 2. Status codes. A specific id maps to one meaning forever, so 301 and an
//    indefinite browser cache are correct. The catch-all is the opposite: it
//    fires for ids whose entry is not written yet, so its destination changes
//    as soon as one is, and a cached 301 could never be corrected.
for (const r of specific) {
  if (r.status !== '301') fail(`"${r.from}" should be status 301, found ${r.status}.`)
}
if (splats.length === 1 && splats[0].status !== '302') {
  fail(`The "/e/*" catch-all should be status 302, found ${splats[0].status}. See the comment above it in netlify.toml.`)
}

// 3. Lowercase ids. Netlify matches paths case-sensitively, and messages print
//    the id in mixed case for readability ("Dep004"), so a mixed-case rule here
//    silently never fires.
for (const r of rules) {
  if (r.from !== r.from.toLowerCase()) fail(`Redirect sources must be lowercase: "${r.from}".`)
}

// 4. No duplicate sources: a second rule for the same id is dead, because the
//    first one always wins, and it reads as if it were in effect.
const seen = new Map()
for (const r of rules) {
  if (seen.has(r.from)) fail(`Duplicate rule for "${r.from}" (the later one can never match).`)
  seen.set(r.from, r.to)
}

// 5. Destinations inside /errors must resolve to a real page AND a real anchor.
//    Nothing downstream catches a bad fragment: the build only warns on broken
//    anchors it finds in page links, and it never sees this file at all.
const docsPath = (route) => {
  const rel = route.replace(/^\//, '')
  for (const candidate of [`docs/${rel}.mdx`, `docs/${rel}.md`, `docs/${rel}/index.mdx`, `docs/${rel}/index.md`]) {
    const full = path.join(ROOT, candidate)
    if (fs.existsSync(full)) return full
  }
  return null
}

for (const r of rules) {
  if (!r.to.startsWith('/errors')) continue
  const [route, fragment] = r.to.split('#')
  const file = docsPath(route)
  if (!file) {
    fail(`"${r.from}" points at "${route}", which has no page under docs/.`)
    continue
  }
  if (!fragment) continue
  const body = fs.readFileSync(file, 'utf8')
  // Entries use explicit {#anchor} overrides, so several ids can share one
  // heading without the anchor being tied to the heading's wording.
  if (!body.includes(`{#${fragment}}`)) {
    fail(`"${r.from}" points at "#${fragment}", which is not an explicit {#...} anchor in ${path.relative(ROOT, file)}.`)
  }
}

if (failures.length > 0) {
  console.error(`\nnetlify.toml /e/ redirector: ${failures.length} problem(s)\n`)
  for (const f of failures) console.error(`  - ${f}`)
  console.error('')
  process.exit(1)
}

console.log(
  `netlify.toml /e/ redirector OK: ${specific.length} specific rules (301), ` +
    `1 catch-all (302, last), ` +
    `${rules.filter((r) => r.to.startsWith('/errors')).length} destinations in /errors verified to a real page and anchor.`
)
