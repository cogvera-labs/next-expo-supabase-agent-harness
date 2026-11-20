// The proof that tests/helpers/temp-dir.mjs removes what it makes.
//
// The helper cleans up from a file-level after() hook that the helper module registers, not
// the test file importing it, with a process `exit` listener behind the hook. Neither can be
// watched from inside the file it runs for. So each case below writes a small test file that
// imports the helper, runs it under `node --test` as the suites are run (one process per
// file), and reads what that process left: its temp folder, and a report written from an
// `exit` listener registered before the helper's own. A directory already gone in the report
// was removed by the hook. One still there in the report and gone afterwards was removed by
// the exit listener.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { test } from 'node:test'
import { tempDir } from './temp-dir.mjs'

const HELPER_URL = new URL('./temp-dir.mjs', import.meta.url).href

// Imported first by every case, so its `exit` listener runs before the helper's: the report
// shows what the after() hook left, and a case can undo a stand-in before the helper's
// listener makes its second attempt.
const RECORDER = `import { existsSync, writeFileSync } from 'node:fs'
import process from 'node:process'

export const made = []
export const beforeHelperExit = []
process.on('exit', () => {
  const leftAtExit = made.filter((dir) => existsSync(dir))
  writeFileSync(process.env.NESAH_TEMPDIR_REPORT, JSON.stringify({ made, leftAtExit }))
  for (const fn of beforeHelperExit) fn()
})
`

const PREAMBLE = `import { beforeHelperExit, made } from './recorder.mjs'
import { tempDir } from ${JSON.stringify(HELPER_URL)}
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { syncBuiltinESMExports } from 'node:module'
import { join } from 'node:path'
import process from 'node:process'
import { describe, test } from 'node:test'

/** A directory with a file two levels down, made through the helper and reported. */
function make(prefix) {
  const dir = tempDir(prefix)
  fs.mkdirSync(join(dir, 'nested'))
  fs.writeFileSync(join(dir, 'nested', 'file.txt'), 'content')
  made.push(dir)
  return dir
}
`

const PASSING = `
const shared = make('case-module-')

test('a directory made at module scope is there inside a test', () => {
  assert.ok(fs.existsSync(join(shared, 'nested', 'file.txt')))
})

test('a directory made inside a test', () => {
  assert.ok(fs.existsSync(make('case-test-')))
})

describe('a suite', () => {
  test('a directory made inside a suite', () => {
    assert.ok(fs.existsSync(make('case-suite-')))
  })
})

test('every directory outlives the test that made it', () => {
  assert.equal(made.length, 3)
  for (const dir of made) assert.ok(fs.existsSync(dir), dir)
})
`

const FAILING = `${PASSING}
test('a test that fails after making a directory', () => {
  make('case-failing-')
  assert.fail('this case fails on purpose')
})

test('a test after the failure makes one more', () => {
  make('case-after-failure-')
})
`

const EXITING = `
test('a test that ends the process', () => {
  make('case-exit-')
  process.exit(0)
})
`

/**
 * A file whose only directory cannot be removed: fs.rmSync is replaced by a stand-in that
 * throws what Windows reports while a handle is open. With `freedAtExit` the real function
 * is back before the helper's exit listener runs.
 * @param {{ freedAtExit: boolean }} opts
 */
const refusing = ({ freedAtExit }) => `
test('a directory whose removal is refused', () => {
  make('case-busy-')
  const real = fs.rmSync
  const restore = () => {
    fs.rmSync = real
    syncBuiltinESMExports()
  }
  fs.rmSync = () => {
    throw Object.assign(new Error('EBUSY: resource busy or locked'), { code: 'EBUSY' })
  }
  syncBuiltinESMExports()
  if (${String(freedAtExit)}) beforeHelperExit.push(restore)
})
`

/**
 * Run `body` as a test file under `node --test`, in a process whose OS temp folder is a
 * directory of its own, and return its exit status, its output, its report and the case
 * directories still in that folder.
 * @param {string} body
 */
function runCase(body) {
  const root = tempDir('nesah-tempdir-case-')
  const temp = join(root, 'temp')
  const report = join(root, 'report.json')
  mkdirSync(temp)
  writeFileSync(join(root, 'recorder.mjs'), RECORDER)
  writeFileSync(join(root, 'case.test.mjs'), `${PREAMBLE}${body}`)
  // os.tmpdir() reads TMPDIR on POSIX and TEMP on Windows. NODE_TEST_CONTEXT is dropped
  // because this file is itself run by `node --test`, which sets it for its children: left
  // in place, the run below would report as a nested child and not as a run of its own.
  const env = { ...process.env, TMPDIR: temp, TEMP: temp, TMP: temp, NESAH_TEMPDIR_REPORT: report }
  for (const key of Object.keys(env)) if (key.startsWith('NODE_TEST')) delete env[key]
  // `node --test` reads its argument as a glob pattern, so the file is named from the working
  // directory: an absolute Windows path would put a drive letter and backslashes in the pattern.
  const run = spawnSync(process.execPath, ['--test', 'case.test.mjs'], {
    cwd: root,
    encoding: 'utf8',
    env,
  })
  const out = `${run.stdout ?? ''}${run.stderr ?? ''}`
  assert.ok(existsSync(report), `the case wrote no report, so it did not run to its end:\n${out}`)
  /** @type {{ made: string[], leftAtExit: string[] }} */
  const { made, leftAtExit } = JSON.parse(readFileSync(report, 'utf8'))
  for (const dir of made) {
    assert.equal(dirname(dir), temp, 'the case made a directory outside its own temp folder')
  }
  const left = readdirSync(temp).filter((name) => name.startsWith('case-'))
  return { status: run.status, out, made, leftAtExit, left }
}

test('tempDir makes a new, empty directory in the OS temp folder, named from the prefix', () => {
  const first = tempDir('nesah-tempdir-')
  const second = tempDir('nesah-tempdir-')
  assert.notEqual(first, second)
  for (const dir of [first, second]) {
    assert.equal(dirname(dir), dirname(join(tmpdir(), 'x')))
    assert.match(basename(dir), /^nesah-tempdir-.{6}$/)
    assert.ok(statSync(dir).isDirectory())
    assert.deepEqual(readdirSync(dir), [])
  }
})

test('the hook the helper registers runs for the importing file: every directory is gone', () => {
  const r = runCase(PASSING)
  assert.equal(r.status, 0, r.out)
  assert.equal(r.made.length, 3, r.out)
  assert.deepEqual(r.leftAtExit, [], 'the after() hook left directories for the exit listener')
  assert.deepEqual(r.left, [], r.out)
})

test('the hook runs when a test in the file fails', () => {
  const r = runCase(FAILING)
  assert.equal(r.status, 1, `the case holds a failing test, so its run must fail:\n${r.out}`)
  assert.match(r.out, /this case fails on purpose/)
  assert.equal(r.made.length, 5, r.out)
  assert.deepEqual(r.leftAtExit, [], 'the after() hook left directories for the exit listener')
  assert.deepEqual(r.left, [], r.out)
})

test('the exit listener removes what the hook never reached: a test ended the process', () => {
  const r = runCase(EXITING)
  assert.equal(r.made.length, 1, r.out)
  assert.deepEqual(r.leftAtExit, r.made, 'the hook ran, so the exit listener had nothing to do')
  assert.deepEqual(r.left, [], r.out)
})

test('a refused removal does not fail the file, and the exit listener tries again', () => {
  const r = runCase(refusing({ freedAtExit: true }))
  assert.equal(r.status, 0, `a removal that failed turned a passing file red:\n${r.out}`)
  assert.equal(r.made.length, 1, r.out)
  assert.deepEqual(r.leftAtExit, r.made, 'the stand-in did not refuse the removal in the hook')
  assert.deepEqual(r.left, [], r.out)
})

test('a directory that can never be removed is left behind, and the file still passes', () => {
  const r = runCase(refusing({ freedAtExit: false }))
  assert.equal(r.status, 0, `a removal that failed turned a passing file red:\n${r.out}`)
  assert.equal(r.made.length, 1, r.out)
  assert.deepEqual(r.leftAtExit, r.made)
  assert.deepEqual(r.left, [basename(r.made[0])], r.out)
})
