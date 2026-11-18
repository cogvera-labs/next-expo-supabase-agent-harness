// The seeded catalog never resolves a release recorded here as broken.
//
// The scaffold ships no lockfile, so a range in template/base/pnpm-workspace.yaml resolves the
// newest matching release on every fresh install and every CI run. When that release is broken,
// the catalog holds the package at an exact earlier version, with the reason beside the pin.
//
// Two changes can undo a hold with no pull-request check going red: an edit that returns the
// entry to a range, and a Renovate bump to the broken release itself. The lane that would
// notice either one (maestro-smoke, for the hold below) runs on a schedule, not per pull
// request. So this file holds both halves for each held package: the catalog entry, and the
// Renovate rule that skips the broken release.
//
// To lift a hold, pin a release that fixes the fault, then delete the row here and its rule in
// renovate.json in the same change.
//
// It reads two files and nothing else, so it runs unchanged on the Windows leg. Each judge is
// also driven over fixtures that must red.
// SOURCE: template/base/pnpm-workspace.yaml, renovate.json
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { catalogEntry } from '../../installer/lib/migrations.mjs'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const CATALOG = 'template/base/pnpm-workspace.yaml'
const read = (/** @type {string} */ rel) => readFileSync(join(ROOT, rel), 'utf8')

/**
 * @typedef {{ name: string, broken: string[], why: string }} Hold
 * @typedef {{ matchFileNames?: string[], matchPackageNames?: string[], allowedVersions?: string }} PackageRule
 */

/** @type {Hold[]} */
const HELD = [
  {
    name: 'expo-sqlite',
    broken: ['57.0.5'],
    // Checkable from the published package alone:
    //   npm pack expo-sqlite@57.0.5 && tar -xzf expo-sqlite-57.0.5.tgz
    //   unzip -l package/local-maven-repo/host/exp/exponent/expo.modules.sqlite/57.0.5/*.aar
    // lists jni/arm64-v8a/libexpo-sqlite.so and no other ABI; 57.0.4 lists four.
    why: 'its prebuilt Android library carries arm64-v8a only (expo/expo#53673), so on an x86_64 emulator or a 32-bit device the kv store cannot load and every key reads as absent',
  },
]

/**
 * Why a pnpm-workspace.yaml text does not hold a package off its broken releases; empty when
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
 * cannot. The rule must also admit the version the catalog pins, or Renovate reports the
 * current pin itself as disallowed.
 * @param {{ packageRules?: PackageRule[] }} renovate
 * @param {Hold} hold
 * @param {string} pinned the catalog's current value for the package
 * @returns {string[]}
 */
function ruleProblems(renovate, hold, pinned) {
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
  if (admits(allowed, pinned) === null) {
    return [`the \`${hold.name}\` rule's allowedVersions ${JSON.stringify(allowed)} is not a negated regex (!/…/)`]
  }
  const problems = hold.broken
    .filter((version) => admits(allowed, version))
    .map((version) => `the \`${hold.name}\` rule's allowedVersions ${JSON.stringify(allowed)} admits ${version}`)
  if (!admits(allowed, pinned)) {
    problems.push(`the \`${hold.name}\` rule's allowedVersions ${JSON.stringify(allowed)} refuses the pinned ${pinned}`)
  }
  return problems
}

for (const hold of HELD) {
  test(`the catalog holds ${hold.name} at an exact version that is not ${hold.broken.join(' or ')}`, () => {
    assert.deepEqual(pinProblems(read(CATALOG), hold), [])
  })

  test(`root renovate.json never proposes ${hold.name} ${hold.broken.join(' or ')}`, () => {
    const pinned = catalogEntry(read(CATALOG), hold.name)
    assert.ok(pinned, `precondition: ${CATALOG} catalogues ${hold.name}`)
    assert.deepEqual(ruleProblems(JSON.parse(read('renovate.json')), hold, pinned), [])
  })
}

test('every hold names at least one broken release as an exact X.Y.Z, and says why', () => {
  for (const hold of HELD) {
    assert.ok(hold.broken.length > 0, `${hold.name}: no broken release listed`)
    for (const version of hold.broken) assert.match(version, /^\d+\.\d+\.\d+$/, `${hold.name}: ${version}`)
    assert.ok(hold.why.length >= 40, `${hold.name}: the reason is too short to act on`)
  }
})

const FIXTURE = { name: 'expo-sqlite', broken: ['57.0.5'], why: 'a reason long enough to pass, for the fixtures only' }

test('the pin judge reds a range, the broken release and a missing entry', () => {
  const yaml = (/** @type {string} */ line) => `catalog:\n  expo: 57.0.9\n${line}\n  zod: ^4.4.3\n`
  assert.match(pinProblems(yaml('  expo-sqlite: ~57.0.1'), FIXTURE).join(), /not an exact X\.Y\.Z/)
  assert.match(pinProblems(yaml('  expo-sqlite: ^57.0.4 # a range again'), FIXTURE).join(), /not an exact X\.Y\.Z/)
  assert.match(pinProblems(yaml('  expo-sqlite: 57.0.5'), FIXTURE).join(), /is the broken release/)
  assert.match(pinProblems(yaml("  'expo-sqlite': '57.0.5'"), FIXTURE).join(), /is the broken release/)
  assert.match(pinProblems(yaml('  other: 1.0.0'), FIXTURE).join(), /catalogues no `expo-sqlite`/)
  // The accepted shapes: the release before the fault, a later fixed one, quoted, commented.
  assert.deepEqual(pinProblems(yaml('  expo-sqlite: 57.0.4 # exact'), FIXTURE), [])
  assert.deepEqual(pinProblems(yaml("  expo-sqlite: '57.0.6'"), FIXTURE), [])
  assert.deepEqual(pinProblems(yaml('  expo-sqlite: 57.0.4').replace(/\n/g, '\r\n'), FIXTURE), [], 'CRLF checkout')
})

test('the rule judge reds a missing rule, a shared rule, a rule that admits the broken release and one that refuses the pin', () => {
  const rule = { matchFileNames: [CATALOG], matchPackageNames: ['expo-sqlite'], allowedVersions: '!/^57\\.0\\.5$/' }
  const judge = (/** @type {PackageRule[]} */ packageRules) => ruleProblems({ packageRules }, FIXTURE, '57.0.4').join()
  assert.equal(judge([rule]), '')
  assert.match(judge([]), /no packageRule limits/)
  assert.match(judge([{ ...rule, matchFileNames: ['template/**'] }]), /no packageRule limits/)
  // A limit shared with other packages would hold them back too, so it does not count.
  assert.match(judge([{ ...rule, matchPackageNames: ['expo-sqlite', 'expo-*'] }]), /no packageRule limits/)
  assert.match(judge([{ ...rule, allowedVersions: undefined }]), /no packageRule limits/)
  assert.match(judge([{ ...rule, allowedVersions: '<57.0.5' }]), /not a negated regex/)
  assert.match(judge([{ ...rule, allowedVersions: '!/^57\\.0\\.6$/' }]), /admits 57\.0\.5/)
  assert.match(judge([{ ...rule, allowedVersions: '!/^57\\.0\\./' }]), /refuses the pinned 57\.0\.4/)
})
