// The factory Stop gate's `format` step: one Biome run per template tree, each from inside
// its tree with template/base's biome.jsonc as its configuration.
//
// A scaffold merges the trees under one root, where that file governs every one of them.
// Biome applies a configuration's parser options to the files under the directory it runs
// in. A run from template/base that reaches a sibling tree by `../` therefore reads that
// tree's Tailwind CSS without `css.parser.tailwindDirectives` and fails to parse it (Biome
// 2.6.7 does; 2.5.15 did not), so the step went red on a tree no consumer would see red.
//
// The hook is parsed, not imported: it runs its gates on import.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const HOOK = readFileSync(`${ROOT}.claude/hooks/stop-factory-gate.mjs`, 'utf8')

/** The text of the `format` entry in the hook's TOOLCHAIN_STEPS table. */
function formatEntry() {
  const open = HOOK.indexOf('const TOOLCHAIN_STEPS = [')
  const close = HOOK.indexOf('\n]', open)
  assert.ok(open !== -1 && close !== -1, 'the hook exposes a TOOLCHAIN_STEPS table')
  const table = HOOK.slice(open, close)
  const start = table.search(/\[\s*'format',/)
  assert.ok(start !== -1, "TOOLCHAIN_STEPS has a 'format' entry")
  // The entry ends where the next step's entry, or its comment, begins.
  const rest = table.slice(start)
  const next = rest.search(/\n {2}(?:\/\/|\[\s*'(?!format')[a-z])/)
  return next === -1 ? rest : rest.slice(0, next)
}

/** Each Biome launch the entry makes: the directory it runs in and its arguments. */
function formatRuns() {
  const runs = []
  const launch = /\{\s*cwd:\s*'([^']+)',\s*argv:\s*\[([^\]]*)\]/g
  for (const m of formatEntry().matchAll(launch)) {
    const argv = [...m[2].matchAll(/'([^']*)'/g)].map((a) => a[1])
    runs.push({ cwd: m[1], argv })
  }
  return runs
}

/** Every tree `init` reads files from. template/shas holds generated tables no project gets. */
function templateTrees() {
  return readdirSync(`${ROOT}template`, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'shas')
    .map((entry) => `template/${entry.name}`)
    .sort()
}

test('the format step runs Biome inside every template tree', () => {
  const ran = formatRuns()
    .map((run) => run.cwd)
    .sort()
  assert.deepEqual(
    ran,
    templateTrees(),
    'a tree with no run of its own is a tree whose formatting no maintainer turn checks',
  )
})

test('no run reaches another tree by path', () => {
  for (const run of formatRuns()) {
    const paths = run.argv.filter((arg) => !arg.startsWith('-') && arg !== 'ci')
    assert.deepEqual(
      paths,
      ['.'],
      `the run in ${run.cwd} checks ${paths.join(' ')}: a file outside the directory Biome runs in is read without the configuration's parser options`,
    )
  }
})

test("every tree but base names base's configuration, and base reads its own", () => {
  const runs = formatRuns()
  assert.ok(runs.length > 1, 'the step makes one run per tree')
  for (const run of runs) {
    const configured = run.argv.includes('--config-path=../base')
    assert.equal(
      configured,
      run.cwd !== 'template/base',
      `the run in ${run.cwd} must ${run.cwd === 'template/base' ? 'not ' : ''}pass --config-path=../base`,
    )
    assert.ok(
      run.argv.includes('--vcs-enabled=false'),
      `the run in ${run.cwd} must pass --vcs-enabled=false: the ignore file is stored as \`gitignore\``,
    )
  }
})
