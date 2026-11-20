// Every temporary directory a test makes goes through tests/helpers/temp-dir.mjs.
//
// The helper removes what it made when the test file ends. A directory made with mkdtemp
// directly stays in the OS temp folder after every run, and nothing in a single run shows
// it: the leftovers only add up. So this file reads the code under tests/ and fails on any
// line that names an mkdtemp function outside the helper.
//
// It is a scan of text, and these are its limits:
//   - it reads the files ESLint lints (.mjs, .cjs, .js), by line. A line that starts as a
//     comment (`//`, `/*`, `*`) is skipped, and any other line that holds the name counts,
//     a trailing comment or a string included;
//   - it does not see a directory made another way (mkdirSync under os.tmpdir(), a file
//     written there), one a child process makes (a script under test has to remove its
//     own), or one a test renames away from the path the helper returned;
//   - it does not see whether a removal succeeded. tests/helpers/temp-dir.test.mjs proves
//     the helper removes what it made.
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { tempDir } from '../helpers/temp-dir.mjs'

const TESTS = fileURLToPath(new URL('../', import.meta.url))
const HELPER = 'tests/helpers/temp-dir.mjs'

// The files that may name the function, each with its reason. A test whose directory has to
// outlive its own file would be added here, with the reason beside the call as well.
const ALLOWED = {
  [HELPER]: 'the one place a temporary directory is made',
  'tests/gates/test-temp-dirs.test.mjs': 'this file, whose cases spell the calls it must find',
}

const CODE = /\.(?:mjs|cjs|js)$/
// mkdtemp, mkdtempSync and mkdtempDisposableSync, bare or through any object.
const NAMES_MKDTEMP = /\bmkdtemp\w*/
const COMMENT = /^\s*(?:\/\/|\/\*|\*)/

/**
 * The lines of `source` that name an mkdtemp function outside a comment line.
 * @param {string} source @returns {{ line: number, text: string }[]}
 */
function directCalls(source) {
  return source
    .split(/\r?\n/)
    .map((text, i) => ({ line: i + 1, text: text.trim() }))
    .filter(({ text }) => !COMMENT.test(text) && NAMES_MKDTEMP.test(text))
}

/**
 * Every such line in the code under `root`, as `tests/<path>:<line>: <text>`, leaving out the
 * files in `allowed` (paths from the repository root).
 * @param {string} root the tests directory @param {Record<string, string>} allowed
 * @returns {{ scanned: string[], found: string[] }}
 */
function scan(root, allowed) {
  const scanned = readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && CODE.test(entry.name))
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .map((rel) => `tests/${rel.split('\\').join('/')}`)
    .sort()
  const found = scanned
    .filter((path) => !Object.hasOwn(allowed, path))
    .flatMap((path) =>
      directCalls(readFileSync(join(root, path.slice('tests/'.length)), 'utf8')).map(
        ({ line, text }) => `${path}:${String(line)}: ${text}`,
      ),
    )
  return { scanned, found }
}

/**
 * A tests directory holding `files` (path under tests/ -> text).
 * @param {Record<string, string>} files
 */
function treeOf(files) {
  const root = tempDir('nesah-tempdir-guard-')
  for (const [rel, text] of Object.entries(files)) {
    const abs = join(root, ...rel.split('/'))
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, text)
  }
  return root
}

test('no code under tests/ makes a temporary directory except through the helper', () => {
  const { scanned, found } = scan(TESTS, ALLOWED)
  assert.deepEqual(
    found,
    [],
    [
      `${String(found.length)} line(s) under tests/ name mkdtemp outside ${HELPER}.`,
      'Make the directory with tempDir(prefix) from that helper, which removes it when the test',
      'file ends. A directory made directly stays in the OS temp folder after every run.',
    ].join(' '),
  )
  // The scan read the suites, not an empty folder: it holds this file, the helper and its test.
  for (const path of [...Object.keys(ALLOWED), 'tests/helpers/temp-dir.test.mjs']) {
    assert.ok(scanned.includes(path), `the scan did not read ${path}`)
  }
})

test('the scan finds the call in the helper: only the allowed list keeps the tree green', () => {
  const { found } = scan(TESTS, {})
  assert.ok(found.some((f) => f.startsWith(`${HELPER}:`)), found.join('\n'))
})

test('RED: a direct call in a test file, a helper module or a nested folder is found', () => {
  const call = "const dir = mkdtempSync(join(tmpdir(), 'x-'))"
  const viaHelper = "import { tempDir } from '../helpers/temp-dir.mjs'\nconst dir = tempDir('x-')\n"
  const root = treeOf({
    'gates/a.test.mjs': `import { mkdtempSync } from 'node:fs'\n\n${call}\n`,
    'installer/helpers/fixture.mjs': `export function fresh() {\n  ${call}\n  return dir\n}\n`,
    'evals/deep/er/b.test.mjs': `  ${call}\n`,
    'gates/clean.test.mjs': viaHelper,
  })
  assert.deepEqual(scan(root, ALLOWED).found, [
    `tests/evals/deep/er/b.test.mjs:1: ${call}`,
    "tests/gates/a.test.mjs:1: import { mkdtempSync } from 'node:fs'",
    `tests/gates/a.test.mjs:3: ${call}`,
    `tests/installer/helpers/fixture.mjs:2: ${call}`,
  ])
})

test('RED: every spelling of the call is found', () => {
  const spellings = [
    "import { mkdtemp } from 'node:fs/promises'",
    "const dir = await mkdtemp(join(tmpdir(), 'x-'))",
    "const dir = fs.mkdtempSync(join(os.tmpdir(), 'x-'))",
    "const dir = await fs.promises.mkdtemp(join(os.tmpdir(), 'x-'))",
    "using dir = fs.mkdtempDisposableSync(join(os.tmpdir(), 'x-'))",
    'const { mkdtempSync: make } = fs',
    "const make = fs['mkdtempSync']",
    "const dir = tempDir('x-') // not mkdtempSync",
  ]
  const found = directCalls(spellings.join('\n'))
  assert.deepEqual(found.map((f) => f.text), spellings)
  assert.deepEqual(found.map((f) => f.line), spellings.map((_, i) => i + 1))
})

test('GREEN: a comment may name the function, and so may a file that is not code', () => {
  const root = treeOf({
    'gates/prose.test.mjs': [
      '// Every fixture is a mkdtemp directory removed after the file.',
      '/** A fresh directory: mkdtemp never reuses a path. */',
      '/*',
      ' * mkdtempSync is what the helper calls.',
      ' */',
      "const dir = tempDir('x-')",
      '',
    ].join('\n'),
    'fixtures/released/1.0.0/validate.mjs.txt': "root = mkdtempSync(join(tmpdir(), 'x-'))\n",
    'canary/injections.json': '{ "note": "a mkdtempSync fixture" }\n',
    'README.md': 'not with `mkdtemp`\n',
    // A directory named like a module is not read as one.
    'fixtures/vendored.js/notes.txt': 'mkdtempSync\n',
  })
  const { scanned, found } = scan(root, ALLOWED)
  assert.deepEqual(found, [])
  assert.deepEqual(scanned, ['tests/gates/prose.test.mjs'])
})

test('RED: the helper is allowed at its own path, not a file that shares its name', () => {
  const body = "import { mkdtempSync } from 'node:fs'\n"
  const root = treeOf({
    'helpers/temp-dir.mjs': body,
    'gates/helpers/temp-dir.mjs': body,
  })
  assert.deepEqual(scan(root, ALLOWED).found, [
    "tests/gates/helpers/temp-dir.mjs:1: import { mkdtempSync } from 'node:fs'",
  ])
})
