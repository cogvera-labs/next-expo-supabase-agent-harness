// apps/web/next-env.d.ts is Next's own file, and a project does not track it.
//
// `next dev` and `next build` each rewrite that file, in different shapes and in a style the
// project's formatter rejects. While the scaffold tracked a copy, one `pnpm dev:web` left a
// modified tracked file behind and turned the first step of the gate chain, `format`, red on
// a file nobody had edited. Four things together keep that from happening, and each case
// below holds one of them:
//
//   1. no template tree ships the file, so a new project never tracks it;
//   2. the project's `.gitignore` ignores it, so Next's copy is not an untracked change;
//   3. apps/web/tsconfig.json names the two type packages the file references, so a clean
//      clone, where Next has written nothing yet, typechecks the same code;
//   4. the project's Biome configuration leaves the file out, so a project that still
//      tracks it (one made before this) does not fail `format` on it either.
//
// WHAT THIS CANNOT CATCH. The cases read the shipped files and run git and Biome over a
// stand-in for what Next 16 writes. They do not start a dev server, so a later Next that
// rewrote some other tracked file would pass here.
//
// The Biome case runs the root's own binary: where it is not installed (selftest.yml's
// installer-unit runs the suite with no install) it SKIPS loudly by name, and under
// HARNESS_TEST_REQUIRE_TYPESCRIPT=1 (lint.yml's machinery-lint, which installs the root) a
// binary that is missing FAILS.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { tempDir } from '../helpers/temp-dir.mjs'

const REPO = fileURLToPath(new URL('../../', import.meta.url))
const TEMPLATE = join(REPO, 'template')
const NEXT_ENV = join('apps', 'web', 'next-env.d.ts')

/** The file as `next dev` writes it (Next 16.4.6): double quotes and semicolons. */
const AS_NEXT_DEV_WRITES_IT = [
  '/// <reference types="next" />',
  '/// <reference types="next/image-types/global" />',
  'import "./.next/dev/types/routes.d.ts";',
  'import "./.next/dev/types/root-params.d.ts";',
  '',
  '// NOTE: This file should not be edited',
  '// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.',
  '',
].join('\n')

const BIOME = join(REPO, 'node_modules', '.bin', process.platform === 'win32' ? 'biome.cmd' : 'biome')
const REQUIRE_TOOLCHAIN = process.env.HARNESS_TEST_REQUIRE_TYPESCRIPT === '1'

/** A case that runs the root's Biome: skipped loudly without it, failed if this lane requires it. */
function biomeTest(name, fn) {
  if (existsSync(BIOME)) return test(name, fn)
  if (REQUIRE_TOOLCHAIN) {
    return test(name, () =>
      assert.fail(`${BIOME} is missing, and HARNESS_TEST_REQUIRE_TYPESCRIPT=1 says this lane has the root toolchain`),
    )
  }
  return test(
    name,
    {
      skip: 'the root toolchain is not installed here (selftest.yml installer-unit runs with no install); lint.yml machinery-lint runs this case with Biome',
    },
    fn,
  )
}

/** Every file under `dir`, as paths relative to it. */
function filesUnder(dir, prefix = '') {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const rel = prefix === '' ? entry.name : `${prefix}/${entry.name}`
    if (entry.isDirectory()) out.push(...filesUnder(join(dir, entry.name), rel))
    else out.push(rel)
  }
  return out
}

/** Run a command in `cwd`; returns its exit status and combined output. */
function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { cwd, encoding: 'utf8', shell: cmd.endsWith('.cmd') })
  return { code: res.status, out: `${res.stdout ?? ''}${res.stderr ?? ''}` }
}

test('no template tree ships next-env.d.ts', () => {
  const shipped = filesUnder(TEMPLATE).filter((rel) => rel.endsWith('/next-env.d.ts'))
  assert.deepEqual(
    shipped,
    [],
    'a copy in a template tree is a tracked file in every new project, and Next rewrites it on every dev-server run',
  )
})

test("the project's .gitignore ignores the file Next writes", () => {
  // The template stores the ignore file as `gitignore`; a project gets it as `.gitignore`.
  const dir = tempDir('nesah-nextenv-')
  assert.equal(run('git', ['init', '-q', '.'], dir).code, 0)
  copyFileSync(join(TEMPLATE, 'base', 'gitignore'), join(dir, '.gitignore'))
  mkdirSync(join(dir, 'apps', 'web', 'app'), { recursive: true })
  writeFileSync(join(dir, NEXT_ENV), AS_NEXT_DEV_WRITES_IT)
  // Control: a source file beside it is still seen, so the pattern is not ignoring the folder.
  writeFileSync(join(dir, 'apps', 'web', 'app', 'page.tsx'), 'export default function P() {\n  return null\n}\n')
  const status = run('git', ['status', '--porcelain', '--untracked-files=all'], dir)
  assert.equal(status.code, 0, status.out)
  const untracked = status.out
    .split('\n')
    .filter((line) => line.startsWith('?? '))
    .map((line) => line.slice(3))
    .sort()
  assert.deepEqual(untracked, ['.gitignore', 'apps/web/app/page.tsx'])
})

for (const tree of ['stack', 'demo']) {
  test(`apps/web/tsconfig.json (${tree}) names the two type packages next-env.d.ts references`, () => {
    // On a clean clone the file does not exist. Without these two entries a static image
    // import typechecks on a machine where the dev server has run and fails in CI.
    const text = readFileSync(join(TEMPLATE, tree, 'apps', 'web', 'tsconfig.json'), 'utf8')
    const types = /"types":\s*(\[[^\]]*\])/.exec(text)
    assert.ok(types, 'apps/web/tsconfig.json has a compilerOptions.types list')
    const named = JSON.parse(types[1])
    for (const pkg of ['next', 'next/image-types/global']) {
      assert.ok(named.includes(pkg), `compilerOptions.types must name ${pkg}; it names ${named.join(', ')}`)
    }
    // The file stays in `include`, so the route types it imports are checked where it exists.
    const include = /"include":\s*(\[[^\]]*\])/.exec(text)
    assert.ok(include, 'apps/web/tsconfig.json has an include list')
    assert.ok(JSON.parse(include[1]).includes('next-env.d.ts'))
  })
}

biomeTest("the project's Biome configuration leaves next-env.d.ts out, and nothing else beside it", () => {
  // A project made before the file was gitignored still tracks it. Its `format` step runs
  // this configuration, which `update` delivers.
  const dir = tempDir('nesah-nextenv-')
  copyFileSync(join(TEMPLATE, 'base', 'biome.jsonc'), join(dir, 'biome.jsonc'))
  mkdirSync(join(dir, 'apps', 'web'), { recursive: true })
  writeFileSync(join(dir, NEXT_ENV), AS_NEXT_DEV_WRITES_IT)
  // Control: the same bytes under another name must fail, or the fixture is not a file Biome
  // rejects and the first assertion proves nothing.
  const control = join(dir, 'apps', 'web', 'other-env.d.ts')
  writeFileSync(control, AS_NEXT_DEV_WRITES_IT)
  const withControl = run(BIOME, ['ci', '--vcs-enabled=false', '.'], dir)
  assert.notEqual(withControl.code, 0, `Biome passed a file in the style Next writes:\n${withControl.out}`)
  assert.ok(withControl.out.includes('other-env.d.ts'), withControl.out)
  assert.ok(!withControl.out.includes('next-env.d.ts'), `Biome judged next-env.d.ts:\n${withControl.out}`)
  rmSync(control)
  const alone = run(BIOME, ['ci', '--vcs-enabled=false', '.'], dir)
  assert.equal(alone.code, 0, alone.out)
})
