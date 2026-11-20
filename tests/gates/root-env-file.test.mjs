// The project root's env file reaches both dev servers.
//
// The docs and the example file's first line say to copy the example to `.env` at the
// project root. `pnpm dev:web` runs `next dev` in apps/web and `pnpm dev:mobile` runs
// `expo start` in apps/mobile, and each tool reads env files from its own directory only.
// So each app's build configuration loads the root file itself: apps/web/next.config.ts and
// apps/mobile/metro.config.js. Without those lines the documented file reaches neither app,
// and the web app answers 500 on every route.
//
// Each case below builds a throwaway project root, puts the shipped configuration file where
// a project has it, with a stand-in for the one module it imports, and loads it in a child
// process the way its tool does: a plain `require`. What the child then finds in its
// environment is the result.
//
// WHAT THIS CANNOT CATCH. It runs the loading code, not Next or the Expo CLI. If a later
// version of either tool stopped evaluating its configuration file before it compiles or
// bundles, these cases would stay green while the values no longer reached an app. Only a
// lane that starts a dev server from the documented file would see that.
//
// The web cases compile next.config.ts with the root's own `typescript`, to CommonJS as Next
// does: where it is not installed (selftest.yml's installer-unit runs the suite with no
// install) they SKIP loudly by name, and under HARNESS_TEST_REQUIRE_TYPESCRIPT=1 (lint.yml's
// machinery-lint, which installs the root) a compiler that cannot load FAILS. The mobile
// cases need nothing and run everywhere.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { tempDir } from '../helpers/temp-dir.mjs'

/** The root's `typescript`, or null where nothing is installed. */
const ts = await import('typescript').then(
  (m) => m.default ?? m,
  () => null,
)
const REQUIRE_TS = process.env.HARNESS_TEST_REQUIRE_TYPESCRIPT === '1'

/** A case that needs the compiler: skipped loudly without it, failed if this lane requires it. */
function tsTest(name, fn) {
  if (ts !== null) return test(name, fn)
  if (REQUIRE_TS) {
    return test(name, () =>
      assert.fail('typescript cannot be imported, and HARNESS_TEST_REQUIRE_TYPESCRIPT=1 says this lane compiles next.config.ts'),
    )
  }
  return test(
    name,
    {
      skip: 'typescript is not installed here (selftest.yml installer-unit runs with no install); lint.yml machinery-lint runs this case with the compiler',
    },
    fn,
  )
}

const REPO = fileURLToPath(new URL('../../', import.meta.url))
const METRO_CONFIG = join(REPO, 'template', 'stack', 'apps', 'mobile', 'metro.config.js')
/** Every tree that ships the web app's configuration: the stack, and the worked example's copy. */
const NEXT_CONFIGS = ['stack', 'demo'].map((tree) => ({
  tree,
  file: join(REPO, 'template', tree, 'apps', 'web', 'next.config.ts'),
}))

/** Every name a case sets or reads. The child starts with none of them set. */
const NAMES = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_DB_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE',
  'EXPO_PUBLIC_WEB_ORIGIN',
]

/** A root env file with a name of each class the example file has. */
const ROOT_FILE = [
  '# server-only',
  'SUPABASE_SERVICE_ROLE_KEY=from-the-root-file-server',
  'SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  '# web',
  'NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321',
  '# mobile',
  'EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321',
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE=from-the-root-file-mobile',
  'EXPO_PUBLIC_WEB_ORIGIN=',
  '',
].join('\n')

/**
 * Loads the configuration file named by argv[2] and prints, as JSON, what the process
 * environment then holds for each name in argv[3..]: its value, or null where it is not set.
 */
const PRINT_ENV = [
  'require(process.argv[2])',
  'const out = {}',
  'for (const name of process.argv.slice(3)) out[name] = process.env[name] ?? null',
  'process.stdout.write(JSON.stringify(out))',
  '',
].join('\n')

/**
 * A throwaway project root: apps/web and apps/mobile, and a script that loads one
 * configuration file and reports the environment.
 * @param {{ rootFile?: string | null }} [knobs] the root env file's text, or null for none
 */
function project({ rootFile = ROOT_FILE } = {}) {
  const root = tempDir('nesah-rootenv-')
  mkdirSync(join(root, 'apps', 'web', 'lib'), { recursive: true })
  mkdirSync(join(root, 'apps', 'mobile', 'node_modules', 'expo'), { recursive: true })
  writeFileSync(join(root, 'print-env.cjs'), PRINT_ENV)
  if (rootFile !== null) writeFileSync(join(root, '.env'), rootFile)
  return root
}

/** Puts the shipped metro.config.js in the project, with a stand-in for expo/metro-config. */
function plantMetroConfig(root) {
  const mobile = join(root, 'apps', 'mobile')
  copyFileSync(METRO_CONFIG, join(mobile, 'metro.config.js'))
  writeFileSync(
    join(mobile, 'node_modules', 'expo', 'metro-config.js'),
    'module.exports = { getDefaultConfig: () => ({ resolver: {} }) }\n',
  )
  return join(mobile, 'metro.config.js')
}

/**
 * Puts a shipped next.config.ts in the project, compiled to CommonJS the way Next compiles
 * it before it evaluates it, with a stand-in for the one module the file imports.
 */
function plantNextConfig(root, source) {
  const web = join(root, 'apps', 'web')
  const { outputText } = ts.transpileModule(readFileSync(source, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: 'next.config.ts',
  })
  writeFileSync(join(web, 'next.config.js'), outputText)
  writeFileSync(
    join(web, 'lib', 'security-headers.js'),
    'module.exports = { authenticatedCacheHeaders: () => [], staticSecurityHeaders: () => [] }\n',
  )
  return join(web, 'next.config.js')
}

/**
 * Load `config` in a child process and return what its environment holds afterwards.
 * @param {string} root the project root
 * @param {string} config the configuration file to load
 * @param {{ env?: Record<string, string>, cwd?: string }} [opts] names the caller's shell
 *   sets, and the directory the tool runs in (the app's own, as `pnpm --filter` runs it)
 * @returns {Record<string, string | null>}
 */
function environmentAfterLoading(root, config, { env = {}, cwd } = {}) {
  /** @type {Record<string, string | undefined>} */
  const childEnv = { ...process.env }
  for (const key of Object.keys(childEnv)) {
    if (NAMES.includes(key.toUpperCase())) delete childEnv[key]
  }
  const res = spawnSync(process.execPath, [join(root, 'print-env.cjs'), config, ...NAMES], {
    cwd: cwd ?? root,
    encoding: 'utf8',
    env: { ...childEnv, ...env },
  })
  assert.equal(res.status, 0, `loading ${config} failed:\n${res.stdout}${res.stderr}`)
  return JSON.parse(res.stdout)
}

// ── apps/mobile/metro.config.js ──────────────────────────────────────────────────────────

test('mobile: the root env file reaches the process that bundles, by its EXPO_PUBLIC_ names', () => {
  const root = project()
  const seen = environmentAfterLoading(root, plantMetroConfig(root))
  assert.equal(seen.EXPO_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321')
  assert.equal(seen.EXPO_PUBLIC_SUPABASE_PUBLISHABLE, 'from-the-root-file-mobile')
  // A name the file leaves empty is set to the empty string, as the Expo CLI sets a name
  // from its own env files; the app reads an empty value as "use the default".
  assert.equal(seen.EXPO_PUBLIC_WEB_ORIGIN, '')
})

test('mobile: no other name in the root file reaches that process, the server-only block least of all', () => {
  // The same file holds the service-role key and the database URL, and this process builds
  // what ships to devices.
  const root = project()
  const seen = environmentAfterLoading(root, plantMetroConfig(root))
  assert.equal(seen.SUPABASE_SERVICE_ROLE_KEY, null)
  assert.equal(seen.SUPABASE_DB_URL, null)
  assert.equal(seen.NEXT_PUBLIC_SUPABASE_URL, null)
})

test('mobile: a name that is already set outranks the root file', () => {
  // The shell, and the env files in apps/mobile that the Expo CLI loads before it evaluates
  // this file, both arrive as names already set.
  const root = project()
  const seen = environmentAfterLoading(root, plantMetroConfig(root), {
    env: { EXPO_PUBLIC_SUPABASE_PUBLISHABLE: 'from-the-shell' },
  })
  assert.equal(seen.EXPO_PUBLIC_SUPABASE_PUBLISHABLE, 'from-the-shell')
  assert.equal(seen.EXPO_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321', 'a name the shell leaves alone still comes from the file')
})

test('mobile: the file is found from the configuration file, wherever the tool was started', () => {
  // `pnpm dev:mobile` runs the CLI in apps/mobile, not at the root.
  const root = project()
  const config = plantMetroConfig(root)
  const seen = environmentAfterLoading(root, config, { cwd: join(root, 'apps', 'mobile') })
  assert.equal(seen.EXPO_PUBLIC_SUPABASE_PUBLISHABLE, 'from-the-root-file-mobile')
})

test('mobile: with no root env file the configuration loads and sets nothing', () => {
  // A build server and a clean clone have none: the file is gitignored.
  const root = project({ rootFile: null })
  const seen = environmentAfterLoading(root, plantMetroConfig(root))
  for (const name of NAMES) assert.equal(seen[name], null, `${name} must stay unset`)
})

// ── apps/web/next.config.ts ──────────────────────────────────────────────────────────────

for (const { tree, file } of NEXT_CONFIGS) {
  tsTest(`web (${tree}): the root env file reaches the process that serves and builds, every name in it`, () => {
    // The web app is the API host: it needs the server-only block as well as its public names.
    const root = project()
    const seen = environmentAfterLoading(root, plantNextConfig(root, file))
    assert.equal(seen.SUPABASE_SERVICE_ROLE_KEY, 'from-the-root-file-server')
    assert.equal(seen.SUPABASE_DB_URL, 'postgresql://postgres:postgres@127.0.0.1:54322/postgres')
    assert.equal(seen.NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321')
  })

  tsTest(`web (${tree}): a name that is already set outranks the root file`, () => {
    // The shell or a CI job, and the env files in apps/web that Next loads before it
    // evaluates this file, all arrive as names already set.
    const root = project()
    const seen = environmentAfterLoading(root, plantNextConfig(root, file), {
      env: { SUPABASE_SERVICE_ROLE_KEY: 'from-the-shell' },
    })
    assert.equal(seen.SUPABASE_SERVICE_ROLE_KEY, 'from-the-shell')
    assert.equal(seen.NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321', 'a name the shell leaves alone still comes from the file')
  })

  tsTest(`web (${tree}): the file is found from the configuration file, wherever the tool was started`, () => {
    // `pnpm dev:web` runs `next dev` in apps/web, not at the root.
    const root = project()
    const config = plantNextConfig(root, file)
    const seen = environmentAfterLoading(root, config, { cwd: join(root, 'apps', 'web') })
    assert.equal(seen.SUPABASE_SERVICE_ROLE_KEY, 'from-the-root-file-server')
  })

  tsTest(`web (${tree}): with no root env file the configuration loads and sets nothing`, () => {
    // CI and a deployment have none: the file is gitignored.
    const root = project({ rootFile: null })
    const seen = environmentAfterLoading(root, plantNextConfig(root, file))
    for (const name of NAMES) assert.equal(seen[name], null, `${name} must stay unset`)
  })
}
