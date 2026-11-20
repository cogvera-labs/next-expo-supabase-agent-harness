// scripts/ci/apply-catalog-holds.mjs — the upgrade lane pinning a baseline's catalog off an
// upstream release recorded as broken.
//
// pnpm-workspace.yaml is seeded, so `update` never writes it: an install made from an earlier
// release keeps that release's ranges, and a range resolves the newest release it admits. When
// that release is broken, every upgrade leg that must reach a green chain reds for a fault no
// change in this repository can fix. The lane makes the edit an existing project makes by
// hand, and the chain judges the remedied tree.
//
// The part worth pinning is what the script leaves alone. A hold applies only where the
// baseline's own range admits a broken release and the held version too, so a baseline on
// another major line keeps its entry, and a register that cannot be applied fails by name
// instead of pinning a version the range never admitted.
// SOURCE: scripts/ci/apply-catalog-holds.mjs · scripts/ci/catalog-holds.json
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { catalogEntry } from '../../installer/lib/migrations.mjs'
import { admits, applyHolds, registerProblems } from '../../scripts/ci/apply-catalog-holds.mjs'
import { tempDir } from '../helpers/temp-dir.mjs'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const SCRIPT = join(ROOT, 'scripts/ci/apply-catalog-holds.mjs')
const REGISTER = join(ROOT, 'scripts/ci/catalog-holds.json')
const LANE = join(ROOT, 'scripts/ci/upgrade-lane.sh')
const CATALOG = join(ROOT, 'template/base/pnpm-workspace.yaml')

const HOLDS = [
  { name: 'typescript-eslint', broken: ['8.73.0'], hold: '8.72.2', why: 'a reason long enough to pass, for the fixtures only' },
  { name: 'expo-sqlite', broken: ['57.0.5'], hold: '57.0.4', why: 'a reason long enough to pass, for the fixtures only' },
]

const yamlWith = (/** @type {string[]} */ ...lines) => ['packages:', '  - apps/*', '', 'catalog:', ...lines, '  zod: ^4.4.3', ''].join('\n')

// A private directory per fixture, removed when the file is done.
const made = []
after(() => {
  for (const dir of made) rmSync(dir, { recursive: true, force: true })
})

/** @param {string | null} yaml the scaffold's pnpm-workspace.yaml, or null for none */
function scaffold(yaml) {
  const dir = tempDir('harness-holds-')
  made.push(dir)
  if (yaml !== null) writeFileSync(join(dir, 'pnpm-workspace.yaml'), yaml)
  return dir
}

/** @param {string} dir @param {object} [register] a register to pass with --holds */
function run(dir, register) {
  const args = [SCRIPT, dir]
  if (register !== undefined) {
    const path = join(scaffold(null), 'holds.json')
    writeFileSync(path, JSON.stringify(register))
    args.push('--holds', path)
  }
  const res = spawnSync(process.execPath, args, { encoding: 'utf8' })
  let yaml = ''
  try {
    yaml = readFileSync(join(dir, 'pnpm-workspace.yaml'), 'utf8')
  } catch {
    // No workspace file: the case under test.
  }
  return { code: res.status, out: `${res.stdout ?? ''}${res.stderr ?? ''}`, yaml }
}

test('admits: an exact specifier admits itself alone', () => {
  assert.equal(admits('8.72.2', '8.72.2'), true)
  assert.equal(admits('8.72.2', '8.73.0'), false)
})

test('admits: a caret holds the leftmost non-zero part', () => {
  assert.equal(admits('^8.63.0', '8.73.0'), true)
  assert.equal(admits('^8.63.0', '8.63.0'), true)
  assert.equal(admits('^8.63.0', '8.62.9'), false, 'below the base')
  assert.equal(admits('^8.63.0', '9.0.0'), false, 'the next major')
  assert.equal(admits('^0.10.2', '0.10.9'), true)
  assert.equal(admits('^0.10.2', '0.11.0'), false, 'a 0.x caret holds the minor')
  assert.equal(admits('^0.0.3', '0.0.3'), true)
  assert.equal(admits('^0.0.3', '0.0.4'), false, 'a 0.0.x caret admits only itself')
})

test('admits: a tilde holds the minor', () => {
  assert.equal(admits('~57.0.1', '57.0.5'), true)
  assert.equal(admits('~57.0.1', '57.0.0'), false, 'below the base')
  assert.equal(admits('~57.0.1', '57.1.0'), false)
  assert.equal(admits('~55.0.3', '57.0.5'), false, 'another major line')
})

test('admits: any other shape on either side is not judged', () => {
  for (const spec of ['>=8.63.0 <9', 'latest', 'workspace:*', '8.x', '^8.63', '']) {
    assert.equal(admits(spec, '8.73.0'), null, spec)
  }
  assert.equal(admits('^8.63.0', '8.73.0-alpha.1'), null)
})

test('a range that admits the broken release is pinned to the held version, and the comment survives', () => {
  const before = yamlWith('  typescript-eslint: ^8.63.0 # the type-aware rules', '  expo-sqlite: ~57.0.1')
  const { yaml, held, notes, problems } = applyHolds(before, HOLDS)
  assert.deepEqual(problems, [])
  assert.deepEqual(notes, [])
  assert.deepEqual(held, [
    'typescript-eslint ^8.63.0 -> 8.72.2 (the range admits 8.73.0)',
    'expo-sqlite ~57.0.1 -> 57.0.4 (the range admits 57.0.5)',
  ])
  assert.match(yaml, /^ {2}typescript-eslint: 8\.72\.2 # the type-aware rules$/m)
  assert.match(yaml, /^ {2}expo-sqlite: 57\.0\.4$/m)
  assert.match(yaml, /^ {2}zod: \^4\.4\.3$/m, 'an unrelated entry is untouched')
})

test('an entry already held, and one pinned exactly elsewhere, are left alone; a second pass is a no-op', () => {
  const before = yamlWith('  typescript-eslint: 8.72.2 # exact', '  expo-sqlite: 57.0.2')
  const first = applyHolds(before, HOLDS)
  assert.deepEqual(first.held, [])
  assert.equal(first.yaml, before)
  const pinned = applyHolds(yamlWith('  typescript-eslint: ^8.63.0'), HOLDS).yaml
  assert.equal(applyHolds(pinned, HOLDS).yaml, pinned)
})

test('a baseline on another major line keeps its range', () => {
  // An older release's catalog sits on an earlier Expo SDK. Its range never admits 57.0.5, so
  // pinning 57.0.4 there would move the baseline two majors to fix a fault it does not have.
  const before = yamlWith('  expo-sqlite: ~55.0.3', '  typescript-eslint: ^7.18.0')
  const { yaml, held, problems } = applyHolds(before, HOLDS)
  assert.deepEqual(held, [])
  assert.deepEqual(problems, [])
  assert.equal(yaml, before)
})

test('a range above the held version, or an exact pin on the broken release, fails by name', () => {
  // The range admits the broken release and not the held one: no edit inside the range fixes
  // it, so the register does not fit this baseline and the lane must say so.
  const above = applyHolds(yamlWith('  typescript-eslint: ^8.73.0'), HOLDS)
  assert.deepEqual(above.held, [])
  assert.match(above.problems.join(), /typescript-eslint: `\^8\.73\.0` admits the broken 8\.73\.0 and not the held 8\.72\.2/)
  const exact = applyHolds(yamlWith('  expo-sqlite: 57.0.5'), HOLDS)
  assert.match(exact.problems.join(), /expo-sqlite: `57\.0\.5` admits the broken 57\.0\.5 and not the held 57\.0\.4/)
  assert.equal(exact.yaml, yamlWith('  expo-sqlite: 57.0.5'), 'nothing is written for an entry that cannot be held')
})

test('a specifier of another shape is noted and left alone', () => {
  const before = yamlWith("  typescript-eslint: '>=8.63.0'", '  expo-sqlite: latest')
  const { yaml, held, notes, problems } = applyHolds(before, HOLDS)
  assert.deepEqual(held, [])
  assert.deepEqual(problems, [])
  assert.equal(notes.length, 2)
  assert.match(notes[0], /typescript-eslint: `>=8\.63\.0` is not an exact, ~ or \^ specifier/)
  assert.equal(yaml, before)
})

test('quoted keys and values, a missing key and a CRLF file are all read as a catalog reads them', () => {
  const quoted = applyHolds(yamlWith(`  'typescript-eslint': '^8.63.0'`, `  "expo-sqlite": "~57.0.1" # kv-store`), HOLDS)
  assert.match(quoted.yaml, /^ {2}'typescript-eslint': 8\.72\.2$/m)
  assert.match(quoted.yaml, /^ {2}"expo-sqlite": 57\.0\.4 # kv-store$/m)
  assert.deepEqual(applyHolds(yamlWith('  eslint: ^9.39.4'), HOLDS).held, [], 'neither key is in the catalog')
  const crlf = yamlWith('  typescript-eslint: ^8.63.0').replace(/\n/g, '\r\n')
  const out = applyHolds(crlf, HOLDS).yaml
  assert.match(out, /\r\n {2}typescript-eslint: 8\.72\.2\r\n/)
  // A comment that names the package is not its entry.
  const decoy = yamlWith('  # typescript-eslint: ^8.63.0 was the range', '  typescript-eslint: 8.72.2')
  assert.equal(applyHolds(decoy, HOLDS).yaml, decoy)
})

test('CLI: it writes the pin, prints the line the lane greps for, and a second run changes nothing', () => {
  const dir = scaffold(yamlWith('  typescript-eslint: ^8.63.0', '  expo-sqlite: ~55.0.3'))
  const first = run(dir, { holds: HOLDS })
  assert.equal(first.code, 0, first.out)
  assert.match(first.out, /held off a broken release: typescript-eslint \^8\.63\.0 -> 8\.72\.2/)
  assert.doesNotMatch(first.out, /expo-sqlite/)
  assert.equal(catalogEntry(first.yaml, 'typescript-eslint'), '8.72.2')
  assert.equal(catalogEntry(first.yaml, 'expo-sqlite'), '~55.0.3')
  const second = run(dir, { holds: HOLDS })
  assert.equal(second.code, 0, second.out)
  assert.match(second.out, /no catalog range on this baseline admits a broken release/)
  assert.doesNotMatch(second.out, /held off a broken release/, 'the lane would reinstall for nothing')
  assert.equal(second.yaml, first.yaml)
})

test('CLI: a hold that cannot be applied exits 1 and writes nothing', () => {
  const before = yamlWith('  typescript-eslint: ^8.73.0')
  const r = run(scaffold(before), { holds: HOLDS })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /a hold cannot be applied/)
  assert.equal(r.yaml, before)
})

test('CLI: no scaffold argument is a usage error, and a directory with no workspace file fails', () => {
  const none = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' })
  assert.equal(none.status, 2)
  assert.match(`${none.stdout}${none.stderr}`, /usage:/)
  const empty = run(scaffold(null), { holds: HOLDS })
  assert.equal(empty.code, 1, empty.out)
  assert.match(empty.out, /is not a scaffold/)
})

test('CLI: a register with a bad row is refused before anything is written', () => {
  const before = yamlWith('  typescript-eslint: ^8.63.0')
  const r = run(scaffold(before), { holds: [{ name: 'typescript-eslint', broken: ['8.73.0'], hold: '8.73.0', why: 'short' }] })
  assert.equal(r.code, 1, r.out)
  assert.match(r.out, /`hold` 8\.73\.0 is one of the broken releases/)
  assert.match(r.out, /`why` must say what fails/)
  assert.equal(r.yaml, before)
})

test('the register judge reds a missing list, a duplicate, a range and a missing reason', () => {
  assert.deepEqual(registerProblems({ holds: HOLDS }), [])
  assert.match(registerProblems({}).join(), /no `holds` list/)
  assert.match(registerProblems({ holds: [HOLDS[0], HOLDS[0]] }).join(), /repeats typescript-eslint/)
  assert.match(registerProblems({ holds: [{ ...HOLDS[0], broken: ['^8.73.0'] }] }).join(), /`broken` must list/)
  assert.match(registerProblems({ holds: [{ ...HOLDS[0], broken: [] }] }).join(), /`broken` must list/)
  assert.match(registerProblems({ holds: [{ ...HOLDS[0], hold: '~8.72.2' }] }).join(), /`hold` must be an exact/)
  assert.match(registerProblems({ holds: [{ ...HOLDS[0], why: undefined }] }).join(), /`why` must say/)
  assert.match(registerProblems({ holds: [{ broken: ['1.0.0'] }] }).join(), /holds\[0\] has no name/)
})

test('the shipped register is usable, and the seeded catalog needs none of its holds applied', () => {
  /** @type {{ holds: { name: string, broken: string[], hold: string, why: string }[] }} */
  const register = JSON.parse(readFileSync(REGISTER, 'utf8'))
  assert.deepEqual(registerProblems(register), [])
  // A fresh scaffold is already where the lane puts an upgraded one: run over the seeded
  // catalog, the script finds nothing to hold. tests/gates/catalog-held-releases.test.mjs
  // holds the stronger claim, that the catalog pins exactly each held version.
  const catalog = readFileSync(CATALOG, 'utf8')
  const { yaml, held, notes, problems } = applyHolds(catalog, register.holds)
  assert.deepEqual({ held, notes, problems }, { held: [], notes: [], problems: [] })
  assert.equal(yaml, catalog)
})

test('the upgrade lane applies the holds and reinstalls when one was applied', () => {
  // The lane runs only in CI, so its wiring is read here: the script is called on the
  // scaffold, its output decides HOLDS_APPLIED, and the one reinstall is gated on it.
  const lane = readFileSync(LANE, 'utf8')
  assert.match(lane, /HOLDS_OUT="\$\(node "\$ROOT\/scripts\/ci\/apply-catalog-holds\.mjs" "\$SCAFFOLD"\)"/)
  assert.match(lane, /case "\$HOLDS_OUT" in \*'held off a broken release'\*\) HOLDS_APPLIED=1 ;; esac/)
  assert.match(lane, /if \[ -f "\$PARKED" \] \|\| \[ "\$FLOOR_RAISED" = 1 \] \|\| \[ "\$HOLDS_APPLIED" = 1 \]; then/)
  const applied = lane.indexOf('apply-catalog-holds.mjs')
  const install = lane.indexOf('pnpm-install-retry.mjs" --no-frozen-lockfile', applied)
  const validate = lane.indexOf('node tools/validate.mjs --report-all', applied)
  assert.ok(applied !== -1 && install > applied && validate > install, 'holds, then the reinstall, then validate')
})
