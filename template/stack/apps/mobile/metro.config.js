// metro.config.js — the expo/metro-config default, plus the project-root env
// file and ONE resolver shim. SDK 54+ has built-in monorepo support
// (workspace-root watching + isolated pnpm store resolution), so no
// node-linker=hoisted, no manual watchFolders (design record: EXPO-FACTS).
//
// The shim: the workspace packages this app consumes are `moduleResolution:
// "NodeNext"` (they also run server-side under Node and build with `tsc -b`),
// so their relative imports carry explicit `.js` extensions that map to a `.ts`
// source on disk. Metro does NOT rewrite `.js`→`.ts`, so a barrel like
// `@app/supabase/client` (`export … from './access-token.js'`) is unresolvable
// under the bare default and `expo export` fails. The resolver below tries the
// specifier as written FIRST (a genuine `.js` on disk still wins), and only on
// failure retries without the extension so Metro's sourceExts find the `.ts`.
// Scoped to relative specifiers — bare/package specifiers are untouched.
const { existsSync, readFileSync } = require('node:fs')
const { join } = require('node:path')
const { parseEnv } = require('node:util')
const { getDefaultConfig } = require('expo/metro-config')

// THE ENV FILE IS AT THE PROJECT ROOT, AND THE EXPO CLI DOES NOT LOOK THERE.
// `.env.example` is copied to `.env` beside it, one file for both apps, and the
// CLI reads env files from the app's own directory only. So this file loads the
// root one: the CLI evaluates it before it bundles, for `expo start` and for
// `expo export` alike, which is before an EXPO_PUBLIC_ value reaches a bundle.
//
// Only the EXPO_PUBLIC_ names are taken. The same file holds the server-only
// block (the service-role key, the database URL), and this process builds what
// ships to devices: a secret that is never in its environment cannot be compiled
// into a bundle by a plugin or by a mistake in app code.
//
// The root file ranks last. A name that is already set is left alone, and the
// CLI has read apps/mobile/.env* by the time it evaluates this file: the shell
// wins, then an env file in apps/mobile, then the root file. Where no root file
// exists, as on a build server (it is gitignored), nothing is loaded.
//
// The CLI watches its own env files and not this one: restart it after a change.
// SOURCE: https://docs.expo.dev/guides/environment-variables/ (the Expo CLI loads
// env files from the project directory and inlines EXPO_PUBLIC_ names in the bundle)
const ROOT_ENV_FILE = join(__dirname, '..', '..', '.env')
if (existsSync(ROOT_ENV_FILE)) {
  const rootFile = parseEnv(readFileSync(ROOT_ENV_FILE, 'utf8'))
  for (const [name, value] of Object.entries(rootFile)) {
    if (name.startsWith('EXPO_PUBLIC_') && process.env[name] === undefined) {
      process.env[name] = value
    }
  }
}

const config = getDefaultConfig(__dirname)

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if ((moduleName.startsWith('./') || moduleName.startsWith('../')) && moduleName.endsWith('.js')) {
    try {
      return context.resolveRequest(context, moduleName, platform)
    } catch {
      return context.resolveRequest(context, moduleName.slice(0, -3), platform)
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
