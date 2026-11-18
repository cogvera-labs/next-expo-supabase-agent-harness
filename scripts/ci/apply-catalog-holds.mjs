#!/usr/bin/env node
// Pin a scaffold's catalog off the upstream releases recorded as broken, the way an existing
// project has to.
//
// pnpm-workspace.yaml is seeded, so `update` never writes it. An install made from an earlier
// release keeps that release's ranges, and a range resolves the newest release it admits.
// When that release is broken, a fresh scaffold is protected by an exact pin in the seeded
// catalog, and an existing project by the same pin made by hand. The upgrade lane installs
// earlier releases, so it meets the broken release on every leg whose range admits it. This
// script makes the project's edit, and the chain then judges the remedied tree, as it does
// after scripts/ci/apply-framework-floor.mjs raises a pin to the security floor.
//
// A hold applies only where the scaffold's own range admits a broken release, and only when
// that range admits the held version too, so a baseline on another major line is left alone.
// A range that admits a broken release and not the held version is a register that cannot be
// applied to this baseline: that fails, naming both.
//
// Usage: node scripts/ci/apply-catalog-holds.mjs <scaffold-dir> [--holds <register.json>]
// SOURCE: scripts/ci/catalog-holds.json · scripts/ci/upgrade-lane.sh
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { compareVersions } from '../../template/base/tools/lib/framework-floor.mjs'

/** @typedef {{ name: string, broken: string[], hold: string, why: string }} Hold */

const PLAIN = /^\d+\.\d+\.\d+$/

/**
 * Whether a catalog specifier admits a version, for the three shapes a catalog uses: exact,
 * `~` and `^`. null when either side is another shape, which this script does not judge.
 * @param {string} spec
 * @param {string} version
 * @returns {boolean | null}
 */
export function admits(spec, version) {
  const m = /^([~^]?)(\d+\.\d+\.\d+)$/.exec(spec)
  if (m === null || !PLAIN.test(version)) return null
  const [, op, base] = m
  if (op === '') return compareVersions(version, base) === 0
  if (compareVersions(version, base) < 0) return false
  const [vMajor, vMinor] = version.split('.').map(Number)
  const [bMajor, bMinor] = base.split('.').map(Number)
  if (op === '~') return vMajor === bMajor && vMinor === bMinor
  // A caret holds the leftmost non-zero part: ^1.2.3 the major, ^0.2.3 the minor, and
  // ^0.0.3 admits nothing but itself.
  if (bMajor > 0) return vMajor === bMajor
  if (bMinor > 0) return vMajor === 0 && vMinor === bMinor
  return compareVersions(version, base) === 0
}

/**
 * Apply every hold a pnpm-workspace.yaml text needs. Pure: the text in, the text out.
 * @param {string} yaml
 * @param {Hold[]} holds
 * @returns {{ yaml: string, held: string[], notes: string[], problems: string[] }}
 */
export function applyHolds(yaml, holds) {
  const held = []
  const notes = []
  const problems = []
  for (const hold of holds) {
    const key = hold.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // The entry's line, split so that the indentation, the key and whatever follows the value
    // (a trailing comment, a carriage return) survive the edit.
    const line = new RegExp(`^(\\s{2,}(['"]?)${key}\\2\\s*:\\s*)(['"]?)([^\\s#'"]+)\\3(.*)$`, 'm')
    const m = line.exec(yaml)
    if (m === null) continue
    const spec = m[4]
    const verdicts = hold.broken.map((version) => admits(spec, version))
    if (verdicts.includes(null)) {
      notes.push(`${hold.name}: \`${spec}\` is not an exact, ~ or ^ specifier, so it is left alone`)
      continue
    }
    const hit = hold.broken.find((_, i) => verdicts[i] === true)
    if (hit === undefined) continue
    if (admits(spec, hold.hold) !== true) {
      problems.push(
        `${hold.name}: \`${spec}\` admits the broken ${hit} and not the held ${hold.hold}, so this register cannot be applied to this baseline (${hold.why})`,
      )
      continue
    }
    yaml = yaml.replace(line, `$1${hold.hold}$5`)
    held.push(`${hold.name} ${spec} -> ${hold.hold} (the range admits ${hit})`)
  }
  return { yaml, held, notes, problems }
}

/**
 * Why a parsed register is not usable; empty when it is.
 * @param {unknown} register
 * @returns {string[]}
 */
export function registerProblems(register) {
  const holds = /** @type {{ holds?: unknown }} */ (register)?.holds
  if (!Array.isArray(holds)) return ['the register has no `holds` list']
  const problems = []
  const seen = new Set()
  for (const [i, row] of holds.entries()) {
    const at = `holds[${String(i)}]`
    const { name, broken, hold, why } = /** @type {Partial<Hold>} */ (row ?? {})
    if (typeof name !== 'string' || name === '') {
      problems.push(`${at} has no name`)
      continue
    }
    if (seen.has(name)) problems.push(`${at} repeats ${name}`)
    seen.add(name)
    if (!Array.isArray(broken) || broken.length === 0 || !broken.every((v) => typeof v === 'string' && PLAIN.test(v))) {
      problems.push(`${name}: \`broken\` must list at least one release as an exact X.Y.Z`)
    }
    if (typeof hold !== 'string' || !PLAIN.test(hold)) {
      problems.push(`${name}: \`hold\` must be an exact X.Y.Z`)
    } else if (Array.isArray(broken) && broken.includes(hold)) {
      problems.push(`${name}: \`hold\` ${hold} is one of the broken releases`)
    }
    if (typeof why !== 'string' || why.length < 40) {
      problems.push(`${name}: \`why\` must say what fails, in 40 characters or more`)
    }
  }
  return problems
}

/** @param {string[]} argv */
function main(argv) {
  const scaffold = argv[0]
  const flag = argv.indexOf('--holds')
  const registerPath =
    flag === -1 ? fileURLToPath(new URL('./catalog-holds.json', import.meta.url)) : argv[flag + 1]
  if (scaffold === undefined || scaffold === '' || scaffold.startsWith('--') || registerPath === undefined) {
    console.error('usage: node scripts/ci/apply-catalog-holds.mjs <scaffold-dir> [--holds <register.json>]')
    return 2
  }
  const yamlPath = join(scaffold, 'pnpm-workspace.yaml')
  // Read it once and judge that text. Asking first whether the file exists and opening it
  // afterwards would act on an answer the file system may no longer give.
  let before
  try {
    before = readFileSync(yamlPath, 'utf8')
  } catch (err) {
    if (/** @type {NodeJS.ErrnoException} */ (err).code !== 'ENOENT') throw err
    console.error(`apply-catalog-holds: FAIL — ${yamlPath} does not exist, so this is not a scaffold`)
    return 1
  }
  const register = JSON.parse(readFileSync(registerPath, 'utf8'))
  const shape = registerProblems(register)
  if (shape.length > 0) {
    console.error(`apply-catalog-holds: FAIL — ${registerPath} is not a usable register:`)
    for (const p of shape) console.error(`  - ${p}`)
    return 1
  }
  const { yaml, held, notes, problems } = applyHolds(before, register.holds)
  for (const n of notes) console.log(`  held releases: NOTE — ${n}`)
  if (problems.length > 0) {
    console.error('apply-catalog-holds: FAIL — a hold cannot be applied:')
    for (const p of problems) console.error(`  - ${p}`)
    return 1
  }
  if (held.length === 0) {
    console.log('  held releases: no catalog range on this baseline admits a broken release')
    return 0
  }
  writeFileSync(yamlPath, yaml)
  for (const h of held) console.log(`  held off a broken release: ${h}`)
  return 0
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
