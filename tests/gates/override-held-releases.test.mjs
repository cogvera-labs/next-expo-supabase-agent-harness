// The seeded workspace file holds two undeclared native packages at exact versions, and
// Renovate never proposes the releases recorded as broken.
//
// No workspace package declares react-native-reanimated or react-native-worklets. The first
// is a peer of react-native-css-interop, which NativeWind brings, and the second a peer of
// the first. The scaffold ships no lockfile, so pnpm installs the newest release of each on
// every fresh install, and Expo links both into the native build. When a release drops the
// React Native line the scaffold is on, the JavaScript gates stay green and the Android
// build fails: only the nightly device lane sees it.
//
// template/base/pnpm-workspace.yaml therefore pins both under `overrides:`, which holds the
// whole dependency graph. Two changes can undo that with no pull-request check going red: an
// edit that removes an override or turns it into a range, and a Renovate bump to the broken
// release itself. So this file holds both halves for each row of HELD below: the override,
// and the Renovate rule that skips the broken release.
//
// It also ties the hold to the React Native line it was chosen for. Each row lists the lines
// its held version supports, and the catalog's `react-native` pin must be one of them: moving
// the scaffold to a newer React Native is the moment to read the hold again.
//
// To lift or move a hold, pin a release that supports the catalog's React Native, then change
// the row here and the rule in renovate.json in the same change. Until then a pull request
// that moves the override fails here, which is the prompt to check the new release first.
//
// The catalog's holds have a register of their own, scripts/ci/catalog-holds.json, which the
// upgrade lane applies to old baselines. These two are not in it: the upgrade lane builds no
// native app, so it has nothing to hold them for.
//
// It reads the workspace file, renovate.json and the template's package manifests, and runs
// nothing, so it runs unchanged on the Windows leg. Each judge is also driven over fixtures
// that must red.
// SOURCE: template/base/pnpm-workspace.yaml, renovate.json
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { catalogEntry } from '../../installer/lib/migrations.mjs'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const WORKSPACE = 'template/base/pnpm-workspace.yaml'
const read = (/** @type {string} */ rel) => readFileSync(join(ROOT, rel), 'utf8')

/**
 * @typedef {{ name: string, broken: string[], hold: string, reactNative: string[], why: string }} Hold
 * @typedef {{ matchFileNames?: string[], matchPackageNames?: string[], allowedVersions?: string }} PackageRule
 */

/**
 * The holds. `broken` lists the releases that fail, `hold` is the version pinned in their
 * place, `reactNative` the React Native lines the held version supports (its own peer range),
 * and `why` says what fails.
 * @type {Hold[]}
 */
const HELD = [
  {
    name: 'react-native-reanimated',
    broken: ['4.8.0'],
    hold: '4.7.2',
    reactNative: ['0.86', '0.87', '0.88'],
    why: "4.8.0 supports React Native 0.87 to 0.89, so on 0.86 the Android build stops at reanimated's assertMinimalReactNativeVersionTask",
  },
  {
    name: 'react-native-worklets',
    broken: ['0.14.0'],
    hold: '0.13.1',
    reactNative: ['0.86', '0.87', '0.88'],
    why: '0.14.0 supports React Native 0.87 to 0.89 and is the release react-native-reanimated 4.8.0 needs; 4.7.2 needs 0.13.x',
  },
]

/**
 * The value of one entry under the top-level `overrides:` key of a pnpm-workspace.yaml text,
 * or null when the key or the entry is missing. Comments and quotes are dropped.
 * @param {string} workspaceYaml
 * @param {string} name
 * @returns {string | null}
 */
function overrideEntry(workspaceYaml, name) {
  const lines = workspaceYaml.split(/\r?\n/)
  const start = lines.findIndex((line) => /^overrides:\s*(#.*)?$/.test(line))
  if (start === -1) return null
  for (const line of lines.slice(start + 1)) {
    // The block ends at the next top-level key.
    if (/^\S/.test(line) && !line.startsWith('#')) break
    const m = /^\s+(['"]?)([^'"\s:#][^'":]*)\1\s*:(.*)$/.exec(line)
    if (m?.[2] !== name) continue
    return m[3]
      .replace(/\s+#.*$/, '')
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2')
  }
  return null
}

/**
 * Why a pnpm-workspace.yaml text does not hold a package at its held version; empty when it
 * does.
 * @param {string} workspaceYaml
 * @param {Hold} hold
 * @returns {string[]}
 */
function pinProblems(workspaceYaml, hold) {
  const value = overrideEntry(workspaceYaml, hold.name)
  if (value === null) {
    return [
      `${WORKSPACE} has no \`${hold.name}\` under \`overrides:\`, so a fresh install takes the newest release (${hold.why})`,
    ]
  }
  if (!/^\d+\.\d+\.\d+$/.test(value)) {
    return [
      `\`${hold.name}: ${value}\` is not an exact X.Y.Z: the scaffold ships no lockfile, so a range can resolve ${hold.broken.join(' or ')} (${hold.why})`,
    ]
  }
  if (hold.broken.includes(value)) return [`\`${hold.name}: ${value}\` is the broken release: ${hold.why}`]
  if (value !== hold.hold) {
    return [
      `\`${hold.name}: ${value}\` is not the held ${hold.hold}. Pin ${hold.hold}, or, once ${value} is shown to build on the catalog's React Native, change the row in this file and its rule in renovate.json in the same change`,
    ]
  }
  return []
}

/**
 * Why a held version does not cover the React Native line the catalog pins; empty when it
 * does.
 * @param {string} workspaceYaml
 * @param {Hold} hold
 * @returns {string[]}
 */
function lineProblems(workspaceYaml, hold) {
  const pinned = catalogEntry(workspaceYaml, 'react-native')
  const line = /^(\d+\.\d+)\.\d+$/.exec(pinned ?? '')?.[1]
  if (line === undefined) {
    return [`${WORKSPACE} does not pin \`react-native\` at an exact X.Y.Z (it says ${String(pinned)}), so the hold on ${hold.name} cannot be judged`]
  }
  if (hold.reactNative.includes(line)) return []
  return [
    `the catalog is on React Native ${line}, and ${hold.name} ${hold.hold} supports ${hold.reactNative.join(', ')}: read the hold again, and pin a release that supports ${line}`,
  ]
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
      (r.matchFileNames ?? []).includes(WORKSPACE) &&
      (r.matchPackageNames ?? []).length === 1 &&
      r.matchPackageNames?.[0] === hold.name &&
      typeof r.allowedVersions === 'string',
  )
  if (!rule?.allowedVersions) {
    return [
      `no packageRule limits \`${hold.name}\` alone in ${WORKSPACE} with allowedVersions, so Renovate can propose ${hold.broken.join(' or ')}`,
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

for (const hold of HELD) {
  test(`the workspace file overrides ${hold.name} to the held ${hold.hold}, not ${hold.broken.join(' or ')}`, () => {
    assert.deepEqual(pinProblems(read(WORKSPACE), hold), [])
  })

  test(`${hold.name} ${hold.hold} supports the React Native line the catalog pins`, () => {
    assert.deepEqual(lineProblems(read(WORKSPACE), hold), [])
  })

  test(`root renovate.json never proposes ${hold.name} ${hold.broken.join(' or ')}`, () => {
    assert.deepEqual(ruleProblems(JSON.parse(read('renovate.json')), hold), [])
  })
}

/** Every package manifest the template ships, as paths relative to the repository root. */
function shippedManifests(dir = 'template') {
  /** @type {string[]} */
  const out = []
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`
    if (entry.isDirectory()) out.push(...shippedManifests(rel))
    else if (entry.name === 'package.json' || entry.name === 'package.json.tmpl') out.push(rel)
  }
  return out.sort()
}

test('no shipped package declares a held package, so the override is the only pin', () => {
  // A declared dependency would be judged by the native-deps gate against the versions the
  // Expo SDK names for itself, and a second place to pin is a second place to forget.
  const workspace = read(WORKSPACE)
  const manifests = shippedManifests()
  assert.ok(manifests.length > 0, 'the template ships package manifests')
  for (const hold of HELD) {
    assert.equal(catalogEntry(workspace.slice(workspace.indexOf('\ncatalog:')), hold.name), null, `${hold.name} has a catalog entry`)
    const declaring = manifests.filter((rel) => read(rel).includes(`"${hold.name}"`))
    assert.deepEqual(declaring, [], `${hold.name} is named in a shipped manifest`)
  }
})

const FIXTURE = {
  name: 'react-native-reanimated',
  broken: ['4.8.0'],
  hold: '4.7.2',
  reactNative: ['0.86', '0.87', '0.88'],
  why: 'a reason long enough to pass, for the fixtures only',
}

/** A workspace file with one line under `overrides:` and a React Native pin in the catalog. */
const yaml = (/** @type {string} */ line, reactNative = '0.86.2') =>
  `packages:\n  - apps/*\n\noverrides:\n  other-package: 1.0.0\n${line}\n\ncatalog:\n  react-native: ${reactNative}\n  zod: ^4.4.3\n`

test('the override reader finds an entry under overrides: only, in each accepted shape', () => {
  assert.equal(overrideEntry(yaml('  react-native-reanimated: 4.7.2'), 'react-native-reanimated'), '4.7.2')
  assert.equal(overrideEntry(yaml('  react-native-reanimated: 4.7.2 # exact'), 'react-native-reanimated'), '4.7.2')
  assert.equal(overrideEntry(yaml("  'react-native-reanimated': '4.7.2'"), 'react-native-reanimated'), '4.7.2')
  assert.equal(overrideEntry(yaml('  react-native-reanimated: 4.7.2').replace(/\n/g, '\r\n'), 'react-native-reanimated'), '4.7.2', 'CRLF checkout')
  assert.equal(overrideEntry(yaml('  # react-native-reanimated: 4.7.2'), 'react-native-reanimated'), null, 'a commented line holds nothing')
  // The same name under `catalog:` is not an override, and neither is one with no block at all.
  assert.equal(overrideEntry(yaml('  filler: 1.0.0'), 'react-native'), null)
  assert.equal(overrideEntry('catalog:\n  react-native-reanimated: 4.7.2\n', 'react-native-reanimated'), null)
})

test('the pin judge reds a missing override, a range, the broken release and another version', () => {
  assert.match(pinProblems(yaml('  filler: 1.0.0'), FIXTURE).join(), /has no `react-native-reanimated` under `overrides:`/)
  assert.match(pinProblems('catalog:\n  react-native: 0.86.2\n', FIXTURE).join(), /has no `react-native-reanimated` under `overrides:`/)
  assert.match(pinProblems(yaml('  react-native-reanimated: ^4.7.2'), FIXTURE).join(), /not an exact X\.Y\.Z/)
  assert.match(pinProblems(yaml("  react-native-reanimated: '>=3.6.2'"), FIXTURE).join(), /not an exact X\.Y\.Z/)
  assert.match(pinProblems(yaml('  react-native-reanimated: 4.8.0'), FIXTURE).join(), /is the broken release/)
  // A later release may well support the line. Moving the pin to it is a decision the row
  // records, so it reds until the row moves with it.
  assert.match(pinProblems(yaml('  react-native-reanimated: 4.8.1'), FIXTURE).join(), /is not the held 4\.7\.2/)
  assert.match(pinProblems(yaml('  react-native-reanimated: 4.7.1'), FIXTURE).join(), /is not the held 4\.7\.2/)
  assert.deepEqual(pinProblems(yaml('  react-native-reanimated: 4.7.2 # exact'), FIXTURE), [])
})

test('the line judge reds a React Native line the held version does not support, and an unpinned one', () => {
  assert.deepEqual(lineProblems(yaml('  react-native-reanimated: 4.7.2'), FIXTURE), [])
  assert.deepEqual(lineProblems(yaml('  react-native-reanimated: 4.7.2', '0.88.1'), FIXTURE), [])
  assert.match(lineProblems(yaml('  react-native-reanimated: 4.7.2', '0.89.0'), FIXTURE).join(), /is on React Native 0\.89/)
  assert.match(lineProblems(yaml('  react-native-reanimated: 4.7.2', '0.85.3'), FIXTURE).join(), /is on React Native 0\.85/)
  assert.match(lineProblems(yaml('  react-native-reanimated: 4.7.2', '~0.86.2'), FIXTURE).join(), /does not pin `react-native` at an exact/)
})

test('the rule judge reds a missing rule, a shared rule, a rule that admits the broken release and one that refuses the hold', () => {
  const rule = { matchFileNames: [WORKSPACE], matchPackageNames: ['react-native-reanimated'], allowedVersions: '!/^4\\.8\\.0$/' }
  const judge = (/** @type {PackageRule[]} */ packageRules) => ruleProblems({ packageRules }, FIXTURE).join()
  assert.equal(judge([rule]), '')
  assert.match(judge([]), /no packageRule limits/)
  assert.match(judge([{ ...rule, matchFileNames: ['template/**'] }]), /no packageRule limits/)
  // A limit shared with other packages would hold them back too, so it does not count.
  assert.match(judge([{ ...rule, matchPackageNames: ['react-native-reanimated', 'react-native-*'] }]), /no packageRule limits/)
  assert.match(judge([{ ...rule, allowedVersions: undefined }]), /no packageRule limits/)
  assert.match(judge([{ ...rule, allowedVersions: '<4.8.0' }]), /not a negated regex/)
  assert.match(judge([{ ...rule, allowedVersions: '!/^4\\.9\\.0$/' }]), /admits 4\.8\.0/)
  assert.match(judge([{ ...rule, allowedVersions: '!/^4\\./' }]), /refuses the held 4\.7\.2/)
})
