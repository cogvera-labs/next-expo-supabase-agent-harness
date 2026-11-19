// Temporary directories for the test suites, removed when the file that made them has ended.
//
// Nothing clears the OS temp folder between runs, and the suites build scaffolds and
// repository copies there, so a directory a test leaves behind stays until the disk is full.
// tempDir() records every directory it makes, and this module removes them in a file-level
// after() hook. `node --test` runs each file in its own process, so the hook fires once that
// file's tests have ended, passed or failed. A directory therefore lives for the whole file: a
// test may read it after a helper returns, hand it to a child process, or share one made at
// module scope. The hook is registered on import, ahead of the importing file's own after()
// hooks, so those cannot read a directory made here.
//
// The `exit` listener covers what the hook cannot: a test that ends the process, a directory
// made after the hook has run, and a removal that failed the first time.
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { after } from 'node:test'

/** @type {string[]} */
const made = []

// A removal must never fail a file whose tests passed. Windows refuses with EBUSY or EPERM
// while a handle is open (a child process still exiting, a scanner reading a new file), so
// rmSync retries. A directory that still cannot go is kept for the exit listener, and after
// that it is left behind.
function removeMade() {
  for (const dir of made.splice(0)) {
    try {
      rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
    } catch {
      made.push(dir)
    }
  }
}

after(removeMade)
process.on('exit', removeMade)

/**
 * A new directory in the OS temp folder, removed when the calling test file has ended.
 * @param {string} prefix the start of its name; mkdtemp appends six random characters
 * @returns {string} the path, exactly as mkdtempSync returns it
 */
export function tempDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  made.push(dir)
  return dir
}
