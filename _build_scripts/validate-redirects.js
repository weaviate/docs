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

// Comments are stripped first so that prose in the block (which discusses these
// very rules, and quotes them) can never be read as a rule or counted as one.
const block = toml
  .slice(markerAt)
  .split('\n')
  .filter((line) => !/^[ \t]*#/.test(line))
  .join('\n')

/**
 * Parse [[redirects]] tables into plain objects.
 *
 * Deliberately NOT one regex over from/to/status in a fixed order with fixed
 * spacing. TOML does not care about key order or whitespace, and this file is
 * hand-edited, so a checker that only recognises today's formatting would go
 * quietly blind on exactly the edit it exists to catch. Reads whatever keys are
 * present, in any order, single- or double-quoted.
 */
const parseRedirectTables = (text) =>
  text
    .split(/\[\[redirects\]\]/)
    .slice(1)
    .map((chunk) => {
      // A table ends at the next TOML header of any kind.
      const body = chunk.split(/\n[ \t]*\[/)[0]
      const KV = /^[ \t]*([A-Za-z_][A-Za-z0-9_-]*)[ \t]*=[ \t]*(?:"([^"]*)"|'([^']*)'|([^\s#]+))/gm
      const entry = {}
      for (const m of body.matchAll(KV)) {
        entry[m[1]] = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4]
      }
      return entry
    })

const tables = parseRedirectTables(block)
const rules = tables.filter((t) => typeof t.from === 'string' && t.from.startsWith('/e/'))

// ---------------------------------------------------------------------------
// 0. THE PARSE ITSELF MUST BE COMPLETE.
//
// Every check below reasons over `rules`. If the parser silently drops a rule,
// each of them still passes, and the script reports success over a set it never
// examined. That is a worse outcome than having no checker at all, and it is
// the same failure shape as a link checker that validates zero files. So count
// the rules independently, as loosely as possible, and refuse to continue if
// the two numbers disagree.
// ---------------------------------------------------------------------------
const declared = (block.match(/^[ \t]*from[ \t]*=[ \t]*["']?\/e\//gm) || []).length
if (declared !== rules.length) {
  console.error(
    `\nnetlify.toml /e/ redirector: PARSE GAP.\n\n` +
      `  ${declared} rule(s) declare a /e/ source, but only ${rules.length} parsed.\n` +
      `  Every check in this script reasons over the parsed set, so it cannot be\n` +
      `  trusted until they agree. Fix the parser in ${path.basename(__filename)}\n` +
      `  rather than reformatting netlify.toml to suit it.\n`
  )
  process.exit(1)
}

if (rules.length === 0) fail('No /e/ redirect rules found.')

// Each rule must actually be a rule.
for (const r of rules) {
  if (!r.to) fail(`"${r.from}" has no "to" target.`)
  if (!r.status) fail(`"${r.from}" has no "status".`)
}

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
const seen = new Set()
for (const r of rules) {
  if (seen.has(r.from)) fail(`Duplicate rule for "${r.from}" (the later one can never match).`)
  seen.add(r.from)
}

// 5. No destination may carry a query string of its own.
//
//    Netlify forwards an incoming query to the destination only when the
//    destination has none. Measured with `netlify dev` and confirmed against
//    production:
//
//      to = "/errors/x#a"          + ?clusterid=U  ->  /errors/x?clusterid=U#a
//      to = "/errors/x?src=id#a"   + ?clusterid=U  ->  /errors/x?src=id#a
//
//    So a `?` here silently throws away the query the request arrived with,
//    including the `?clusterid=<uuid>` Weaviate puts on these links, with no
//    build error and no broken link to notice. The message id is added by
//    netlify/edge-functions/error-link-src.ts instead, which is why every
//    destination below can stay plain.
for (const r of rules) {
  if (r.to && r.to.includes('?')) {
    fail(
      `"${r.from}" has a query string in its destination ("${r.to}"). ` +
        `Netlify drops the reader's own query when the destination has one, ` +
        `so this would discard ?clusterid=. Let error-link-src.ts add the id instead.`
    )
  }
}

// 6. At most one fragment. (Check 5 already covers the other half of this:
//    "/x#a?b" is not a URL with a query, the "?b" is part of the fragment and
//    never reaches the server, and it trips the "?" test above.)
for (const r of rules) {
  if (!r.to) continue
  const hashes = (r.to.match(/#/g) || []).length
  if (hashes > 1) fail(`"${r.from}" has ${hashes} "#" in its destination ("${r.to}"). A URL has at most one fragment.`)
}

// 7. The edge function must be present and wired to /e/*.
//
//    It is the only thing that puts `src=<id>` on the destination URL, since no
//    `to` value here may carry a query string (check 5). Deleting or unwiring
//    the file leaves the redirects working and the parameter silently gone, and
//    nothing else would notice.
const EDGE_FN = path.join(ROOT, 'netlify', 'edge-functions', 'error-link-src.ts')
if (!fs.existsSync(EDGE_FN)) {
  fail(
    'netlify/edge-functions/error-link-src.ts is missing. It is what puts the ' +
      'message id on the destination URL as ?src=<id>; without it the /e/ links ' +
      'still resolve but the parameter is gone.'
  )
} else {
  // Comments are stripped first. The file's header quotes these settings
  // verbatim, so a check run over the raw source passes on the documentation of
  // a setting that has been deleted -- which is how this check failed its own
  // negative test the first time it was written.
  const fn = fs
    .readFileSync(EDGE_FN, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
  if (!/path:\s*["']\/e\/\*["']/.test(fn)) {
    fail('error-link-src.ts no longer declares path: "/e/*", so it will not run for these rules.')
  }
  if (!/onError:\s*["']bypass["']/.test(fn)) {
    fail(
      'error-link-src.ts no longer sets onError: "bypass". Without it a thrown ' +
        'error turns every /e/ link into a 500 instead of falling through to the ' +
        'redirect rules below.'
    )
  }
  // The deploy is `netlify deploy --dir=build`, and on that path the CLI only
  // bundles edge functions declared in netlify.toml; the in-file config is not
  // enough. Without this table the function is simply not deployed.
  const declared = /\[\[edge_functions\]\][^[]*?path[ \t]*=[ \t]*["']\/e\/\*["'][^[]*?function[ \t]*=[ \t]*["']error-link-src["']/s.test(block)
  if (!declared) {
    fail(
      'netlify.toml does not declare [[edge_functions]] path = "/e/*" function = "error-link-src". ' +
        'The site is deployed with `netlify deploy --dir`, which bundles edge functions only when ' +
        'they are declared here; without it the function is not deployed and ?src= is never set.'
    )
  }
}

// 8. Every destination must resolve to a real page AND a real anchor.
//    Nothing downstream catches a bad fragment: the build only warns on broken
//    anchors it finds in page links, and it never sees this file at all.
//
//    Inside /errors the anchor must be an explicit {#anchor}: entries use
//    overrides so that several ids can share one heading without the anchor
//    being tied to the heading's wording. Elsewhere the rule points at pages
//    the section does not own, so any anchor Docusaurus would render counts:
//    an explicit {#anchor}, a heading's generated slug, or an <APITable> row id
//    (the row's first cell, verbatim -- see src/components/APITable).
const docsPath = (route) => {
  const rel = route.replace(/^\//, '')
  for (const candidate of [`docs/${rel}.mdx`, `docs/${rel}.md`, `docs/${rel}/index.mdx`, `docs/${rel}/index.md`]) {
    const full = path.join(ROOT, candidate)
    if (fs.existsSync(full)) return full
  }
  return null
}

// github-slugger, as Docusaurus applies it to headings: lowercase, drop
// punctuation, spaces to hyphens. Inline code marks are dropped first since
// the slug is built from the rendered text.
const slugify = (text) =>
  text
    .replace(/`/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')

const anchorsIn = (body) => {
  const anchors = new Set()
  for (const m of body.matchAll(/\{#([^}\s]+)\}/g)) anchors.add(m[1])
  for (const m of body.matchAll(/^#{1,6}[ \t]+(.+?)(?:[ \t]+\{#[^}]+\})?[ \t]*$/gm)) anchors.add(slugify(m[1]))
  // APITable rows: <tr id={firstCellText}>, first cell verbatim minus code marks.
  for (const m of body.matchAll(/^\|[ \t]*`?([^|`]+?)`?[ \t]*\|/gm)) anchors.add(m[1].trim())
  return anchors
}

let checkedDestinations = 0
let checkedAnchors = 0
for (const r of rules) {
  if (!r.to || r.to === '/errors' && r.status === '302') continue
  if (!r.to.startsWith('/')) continue
  if (r.to.startsWith('/e/')) continue // alias onto another rule, checked through that rule
  const [route, fragment] = r.to.split('#')
  const file = docsPath(route)
  if (!file) {
    fail(`"${r.from}" points at "${route}", which has no page under docs/.`)
    continue
  }
  checkedDestinations++
  if (!fragment) continue
  checkedAnchors++
  const body = fs.readFileSync(file, 'utf8')
  const rel = path.relative(ROOT, file)
  if (route.startsWith('/errors')) {
    if (!body.includes(`{#${fragment}}`)) {
      fail(`"${r.from}" points at "#${fragment}", which is not an explicit {#...} anchor in ${rel}.`)
    }
  } else if (!anchorsIn(body).has(fragment)) {
    fail(`"${r.from}" points at "#${fragment}", which is not a heading slug, {#...} anchor, or APITable row id in ${rel}.`)
  }
}

if (failures.length > 0) {
  console.error(`\nnetlify.toml /e/ redirector: ${failures.length} problem(s)\n`)
  for (const f of failures) console.error(`  - ${f}`)
  console.error('')
  process.exit(1)
}

console.log(
  `netlify.toml /e/ redirector OK: ${rules.length} rules parsed (all ${declared} declared), ` +
    `${specific.length} specific (301), 1 catch-all (302, last), ` +
    `${checkedDestinations} destinations verified to a real page, ${checkedAnchors} of them to a real anchor.`
)
