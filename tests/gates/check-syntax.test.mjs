// THE FACTORY GATE'S OWN RED-PROOF (0.7.0) — check-syntax had zero test references, the
// factory-gate class the 0.6.0 changelog names for `hygiene`: no canary-registry entry
// (that registry closes over the shipped chain and the Stop chain; these scripts ship to
// nobody), so nothing ever demanded a watched failure.
//
// The gate's directory argument is the seam this suite uses — the module render lane
// already points it at a rendered scaffold, and a crafted-bad tree is the same shape. All
// three file classes the gate judges are watched failing: a broken .mjs (node --check), a
// broken .mjs.tmpl (checked via the temp-copy path, which is exactly the code a naive
// suffix filter would skip), and invalid JSON. The green control pins the counted summary,
// because "scanned nothing" is this gate's documented false-green shape — and so is a scan
// target that does not exist, which must fail loudly rather than pass empty.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { tempDir } from '../helpers/temp-dir.mjs'

const SCRIPT = fileURLToPath(new URL('../../scripts/check-syntax.mjs', import.meta.url))

// The lane-env doctrine: the local suite runs CI-shaped, so scrub the vars a leaked
// environment could steer a spawned gate with, even where the gate reads none today.
function cleanEnv() {
  const env = { ...process.env }
  for (const k of ['CI', 'HARNESS_REQUIRE_TOOLCHAINS', 'HARNESS_ALLOW_SELF_EDIT', 'GITHUB_BASE_REF']) {
    delete env[k]
  }
  return env
}

/** @param {Record<string, string>} files @returns {string} the fixture root */
function writeTree(files) {
  const dir = tempDir('nsah-syntax-fixture-')
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true })
    writeFileSync(join(dir, rel), content)
  }
  return dir
}

function run(target) {
  const r = spawnSync(process.execPath, [SCRIPT, target], { encoding: 'utf8', env: cleanEnv() })
  return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

test('RED: all three file classes fail and each is named — .mjs, .mjs.tmpl, .json', () => {
  const dir = writeTree({
    'broken-module.mjs': 'const = nope\n',
    // In a subdirectory, so the red also proves the walk recurses rather than skimming
    // the top level; the .tmpl suffix routes it through the temp-copy check path.
    'nested/broken-template.mjs.tmpl': 'export function {\n',
    'broken-data.json': '{ "unterminated": \n',
    'fine.mjs': 'export const ok = 1\n',
    // JSONC by convention (TypeScript strips comments) — exempt, and pinned as such:
    // counting it would make the tally 4 and the exemption's loss invisible.
    'tsconfig.build.json': '// comment, valid only as JSONC\n{}\n',
  })
  const { code, out } = run(dir)
  assert.equal(code, 1, `a tree with three broken files must red:\n${out}`)
  assert.match(out, /SYNTAX: FAIL \(3\)/)
  assert.match(out, /broken-module\.mjs:/)
  assert.match(out, /broken-template\.mjs\.tmpl:/)
  assert.match(out, /broken-data\.json: invalid JSON/)
  assert.ok(!out.includes('fine.mjs'), `a clean module must not be named:\n${out}`)
  assert.ok(!out.includes('tsconfig.build.json'), `tsconfig*.json is JSONC by convention:\n${out}`)
})

test('GREEN: a clean tree, with the counts proving the scan read every class', () => {
  const dir = writeTree({
    'fine.mjs': 'export const ok = 1\n',
    'fine.mjs.tmpl': 'export const rendered = true\n',
    'fine.json': '{ "ok": true }\n',
  })
  const { code, out } = run(dir)
  assert.equal(code, 0, out)
  // Exact counts, not just CLEAN: the .tmpl must be in the js tally (2, not 1) or the
  // temp-copy path silently stopped scanning the class the red above depends on.
  assert.match(out, /SYNTAX: CLEAN \(2 js modules, 1 json files\)/)
})

test('RED: a missing scan target fails loudly — a gate that scans nothing is a false green', () => {
  const { code, out } = run(join(tempDir('nsah-syntax-gone-'), 'does-not-exist'))
  assert.equal(code, 1, out)
  assert.match(out, /SYNTAX: FAIL — directory not found/)
})

/**
 * Run the script with an OS temp folder of its own, and return what the run left there under
 * the script's own prefix.
 * @param {string} target
 */
function leftBehind(target) {
  const own = tempDir('nsah-syntax-own-tmp-')
  const env = cleanEnv()
  // os.tmpdir() reads TMPDIR on POSIX, and TEMP then TMP on Windows, where names match in any case.
  for (const k of Object.keys(env)) {
    if (['TMPDIR', 'TEMP', 'TMP'].includes(k.toUpperCase())) delete env[k]
  }
  Object.assign(env, { TMPDIR: own, TEMP: own, TMP: own })
  const r = spawnSync(process.execPath, [SCRIPT, target], { encoding: 'utf8', env })
  return {
    code: r.status,
    out: `${r.stdout ?? ''}${r.stderr ?? ''}`,
    left: readdirSync(own).filter((entry) => entry.startsWith('nsah-syntax-')),
  }
}

test('the directory made for the .tmpl copies is removed again, on every way out of the script', () => {
  // A .tmpl file is checked through a copy in a directory the script makes under the OS temp
  // folder. Nothing clears that folder between runs, and this script runs in the Stop gate at
  // every turn end, so a directory left behind per run adds up without limit.
  const ways = [
    { name: 'a clean tree', exit: 0, target: writeTree({ 'fine.mjs.tmpl': 'export const rendered = true\n' }) },
    { name: 'a broken template', exit: 1, target: writeTree({ 'broken.mjs.tmpl': 'export function {\n' }) },
    { name: 'a missing scan target', exit: 1, target: join(tempDir('nsah-syntax-gone-'), 'does-not-exist') },
  ]
  for (const { name, exit, target } of ways) {
    const { code, out, left } = leftBehind(target)
    assert.equal(code, exit, `${name}:\n${out}`)
    assert.deepEqual(left, [], `${name}: the run left ${left.join(', ')} in the temp folder`)
  }
})
