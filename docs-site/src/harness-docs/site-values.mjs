// Build-time values for the site's own pages (src/content/docs). A `{{name}}` in such a page is
// replaced, before the page renders, with a value computed from the files that define it, so a
// count on the landing page is the count in the code on the day of the build, never a number
// someone typed. Only the site's own pages pass through here: in a template doc, `{{TOKENS}}`
// are init's placeholders and stay as they are. Every `{{…}}` in a site page must name a value
// below, so a typo fails the build instead of shipping braces (and a site page cannot show
// literal double braces).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { REPO_ROOT } from './corpus.mjs'

// A file outside the site, named at run time, so Vite is told not to bundle it.
const fromRepo = (repoPath) => import(/* @vite-ignore */ pathToFileURL(join(REPO_ROOT, repoPath)).href)

/** The names of the validate chain's gates, from the file that defines the chain. */
async function chainGates() {
  const { VALIDATE_STEPS } = await fromRepo('template/base/tools/harness.config.mjs')
  return VALIDATE_STEPS.map(([name]) => name)
}

/**
 * The can-fail proofs registered for the chain's gates. The landing page says every gate has at
 * least one, so a gate with none fails the build here, as scripts/check-canary-coverage.mjs
 * fails the pull request that adds it.
 */
async function canFailProofs() {
  const { steps } = JSON.parse(readFileSync(join(REPO_ROOT, 'tests/canary/injections.json'), 'utf8'))
  const gates = await chainGates()
  const unproven = gates.filter((gate) => !(steps[gate]?.length > 0))
  if (unproven.length > 0) throw new Error(`tests/canary/injections.json registers no can-fail proof for ${unproven.join(', ')}`)
  return gates.reduce((sum, gate) => sum + steps[gate].length, 0)
}

/** Guard-rule ids, counted the way scripts/check-claims.mjs counts them for the README: every exported array of `{ id }` rules. */
async function guardRuleIds() {
  const guards = await fromRepo('template/base/.claude/hooks/lib/guard-rules.mjs')
  return Object.values(guards)
    .filter((value) => Array.isArray(value) && value.length > 0 && typeof value[0]?.id === 'string')
    .reduce((sum, table) => sum + table.length, 0)
}

const VALUES = {
  gates: async () => (await chainGates()).length,
  'can-fail-proofs': canFailProofs,
  'guard-rule-ids': guardRuleIds,
}

const TOKEN = /\{\{([^{}]*)\}\}/g

/** `source` with each `{{name}}` replaced by its value. An unknown name fails the build. */
export async function fillSiteValues(source, where) {
  const names = [...new Set(Array.from(source.matchAll(TOKEN), (match) => match[1].trim()))]
  const values = new Map()
  for (const name of names) {
    if (!Object.hasOwn(VALUES, name)) {
      throw new Error(`${where}: {{${name}}} names no build-time value (site-values.mjs knows ${Object.keys(VALUES).join(', ')})`)
    }
    values.set(name, String(await VALUES[name]()))
  }
  return source.replace(TOKEN, (_, name) => values.get(name.trim()))
}
