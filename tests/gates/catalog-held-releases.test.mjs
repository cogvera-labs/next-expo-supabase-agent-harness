// The seeded catalog pins every held package at its held version, and Renovate never proposes
// a release recorded as broken.
//
// The scaffold ships no lockfile, so a range in template/base/pnpm-workspace.yaml resolves the
// newest matching release on every fresh install and every CI run. When that release is broken,
// the catalog holds the package at an exact earlier version, with the reason beside the pin.
// scripts/ci/catalog-holds.json is the register of those holds: the upgrade lane reads it to
// pin the same version into a baseline's own catalog (scripts/ci/apply-catalog-holds.mjs), and
// this file reads it so that a fresh scaffold and an upgraded one resolve the same release.
//
// Two changes can undo a hold with no other pull-request check going red: an edit that returns
// the entry to a range, and a Renovate bump to the broken release itself. So this file holds
// both halves for each row: the catalog entry, and the Renovate rule that skips the broken
// release.
//
// To lift a hold, pin a release that fixes the fault, then delete the row from the register and
// its rule from renovate.json in the same change. Until the row goes, a pull request that moves
// the pin fails here, which is the prompt to check the new release first.
//
// It reads three files and nothing else, so it runs unchanged on the Windows leg. Each judge is
// also driven over fixtures that must red.
// SOURCE: scripts/ci/catalog-holds.json, template/base/pnpm-workspace.yaml, renovate.json
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { catalogEntry } from '../../installer/lib/migrations.mjs'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const CATALOG = 'template/base/pnpm-workspace.yaml'
const REGISTER = 'scripts/ci/catalog-holds.json'
const read = (/** @type {string} */ rel) => readFileSync(join(ROOT, rel), 'utf8')

/**
 * @typedef {{ name: string, broken: string[], hold: string, why: string }} Hold
 * @typedef {{ matchFileNames?: string[], matchPackageNames?: string[], allowedVersions?: string }} PackageRule
 */

/** @type {Hold[]} */
const HELD = JSON.parse(read(REGISTER)).holds

/**
 * Why a pnpm-workspace.yaml text does not pin a held package at its held version; empty when
 * it does.
 * @param {string} workspaceYaml
 * @param {Hold} hold
 * @returns {string[]}
 */
function pinProblems(workspaceYaml, hold) {
  const value = catalogEntry(workspaceYaml, hold.name)
  if (value === null) return [`${CATALOG} catalogues no \`${hold.name}\`, so nothing holds it`]
  if (!/^\d+\.\d+\.\d+$/.test(value)) {
    return [
      `\`${hold.name}: ${value}\` is not an exact X.Y.Z: the scaffold ships no lockfile, so a range can resolve ${hold.broken.join(' or ')} (${hold.why})`,
    ]
  }
  if (hold.broken.includes(value)) return [`\`${hold.name}: ${value}\` is the broken release: ${hold.why}`]
  if (value !== hold.hold) {
    return [
      `\`${hold.name}: ${value}\` is not the held ${hold.hold}. Pin ${hold.hold}, or, once ${value} is shown to fix the fault, remove the row from ${REGISTER} and its rule from renovate.json (${hold.why})`,
    ]
  }
  return []
}

/**
 * Whether Renovate's `allowedVersions` admits a version, or null when the value is not the
 * negated-regex form (`!/…/`) this file can judge.
 * @param {string} allowedVersions
 * @param {string} version
 * @returns {boolean | null}
 */
function admits(allowedVersions, version) {
  const m = /^!\/(.*)\/$/.exec(allowedVersions)
  return m ? !new RegExp(m[1]).test(version) : null
}

/**
 * Why a Renovate config can still propose a held package's broken release; empty when it
 * cannot. The rule must also admit the held version, or Renovate reports the current pin
 * itself as disallowed.
 * @param {{ packageRules?: PackageRule[] }} renovate
 * @param {Hold} hold
 * @returns {string[]}
 */
function ruleProblems(renovate, hold) {
  const rule = (renovate.packageRules ?? []).find(
    (r) =>
      (r.matchFileNames ?? []).includes(CATALOG) &&
      (r.matchPackageNames ?? []).length === 1 &&
      r.matchPackageNames?.[0] === hold.name &&
      typeof r.allowedVersions === 'string',
  )
  if (!rule?.allowedVersions) {
    return [
      `no packageRule limits \`${hold.name}\` alone in ${CATALOG} with allowedVersions, so Renovate can propose ${hold.broken.join(' or ')}`,
    ]
  }
  const allowed = rule.allowedVersions
  if (admits(allowed, hold.hold) === null) {
    return [`the \`${hold.name}\` rule's allowedVersions ${JSON.stringify(allowed)} is not a negated regex (!/…/)`]
  }
  const problems = hold.broken
    .filter((version) => admits(allowed, version))
    .map((version) => `the \`${hold.name}\` rule's allowedVersions ${JSON.stringify(allowed)} admits ${version}`)
  if (!admits(allowed, hold.hold)) {
    problems.push(`the \`${hold.name}\` rule's allowedVersions ${JSON.stringify(allowed)} refuses the held ${hold.hold}`)
  }
  return problems
}

test('the register holds at least one release, so the cases below are not vacuous', () => {
  // scripts/ci/apply-catalog-holds.mjs judges each row's shape, with its own cases in
  // tests/gates/apply-catalog-holds.test.mjs. An empty register is a legitimate state once
  // every hold is lifted: delete this case with the last row.
  assert.ok(Array.isArray(HELD) && HELD.length > 0, `${REGISTER} lists no hold`)
})

for (const hold of HELD) {
  test(`the catalog pins ${hold.name} at the held ${hold.hold}, not ${hold.broken.join(' or ')}`, () => {
    assert.deepEqual(pinProblems(read(CATALOG), hold), [])
  })

  test(`root renovate.json never proposes ${hold.name} ${hold.broken.join(' or ')}`, () => {
    assert.deepEqual(ruleProblems(JSON.parse(read('renovate.json')), hold), [])
  })
}

const FIXTURE = {
  name: 'expo-sqlite',
  broken: ['57.0.5'],
  hold: '57.0.4',
  why: 'a reason long enough to pass, for the fixtures only',
}

test('the pin judge reds a range, the broken release, another version and a missing entry', () => {
  const yaml = (/** @type {string} */ line) => `catalog:\n  expo: 57.0.9\n${line}\n  zod: ^4.4.3\n`
  assert.match(pinProblems(yaml('  expo-sqlite: ~57.0.1'), FIXTURE).join(), /not an exact X\.Y\.Z/)
  assert.match(pinProblems(yaml('  expo-sqlite: ^57.0.4 # a range again'), FIXTURE).join(), /not an exact X\.Y\.Z/)
  assert.match(pinProblems(yaml('  expo-sqlite: 57.0.5'), FIXTURE).join(), /is the broken release/)
  assert.match(pinProblems(yaml("  'expo-sqlite': '57.0.5'"), FIXTURE).join(), /is the broken release/)
  // A later release may well be the fix. Moving the pin to it is a decision the row records,
  // so it reds until the row is removed with it.
  assert.match(pinProblems(yaml('  expo-sqlite: 57.0.6'), FIXTURE).join(), /is not the held 57\.0\.4/)
  assert.match(pinProblems(yaml('  expo-sqlite: 57.0.3'), FIXTURE).join(), /is not the held 57\.0\.4/)
  assert.match(pinProblems(yaml('  other: 1.0.0'), FIXTURE).join(), /catalogues no `expo-sqlite`/)
  // The accepted shapes: bare, quoted, commented.
  assert.deepEqual(pinProblems(yaml('  expo-sqlite: 57.0.4 # exact'), FIXTURE), [])
  assert.deepEqual(pinProblems(yaml("  expo-sqlite: '57.0.4'"), FIXTURE), [])
  assert.deepEqual(pinProblems(yaml('  expo-sqlite: 57.0.4').replace(/\n/g, '\r\n'), FIXTURE), [], 'CRLF checkout')
})

test('the rule judge reds a missing rule, a shared rule, a rule that admits the broken release and one that refuses the hold', () => {
  const rule = { matchFileNames: [CATALOG], matchPackageNames: ['expo-sqlite'], allowedVersions: '!/^57\\.0\\.5$/' }
  const judge = (/** @type {PackageRule[]} */ packageRules) => ruleProblems({ packageRules }, FIXTURE).join()
  assert.equal(judge([rule]), '')
  assert.match(judge([]), /no packageRule limits/)
  assert.match(judge([{ ...rule, matchFileNames: ['template/**'] }]), /no packageRule limits/)
  // A limit shared with other packages would hold them back too, so it does not count.
  assert.match(judge([{ ...rule, matchPackageNames: ['expo-sqlite', 'expo-*'] }]), /no packageRule limits/)
  assert.match(judge([{ ...rule, allowedVersions: undefined }]), /no packageRule limits/)
  assert.match(judge([{ ...rule, allowedVersions: '<57.0.5' }]), /not a negated regex/)
  assert.match(judge([{ ...rule, allowedVersions: '!/^57\\.0\\.6$/' }]), /admits 57\.0\.5/)
  assert.match(judge([{ ...rule, allowedVersions: '!/^57\\.0\\./' }]), /refuses the held 57\.0\.4/)
})
