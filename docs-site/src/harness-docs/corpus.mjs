// The documentation corpus, read IN PLACE from the repository: no copies, no symlinks.
//
// Two kinds of page come from the repository:
//   - Template docs. A template doc's route is the path its file has under an installed
//     project's docs/ folder: template/base/docs/<rel> and template/modules/<module>/docs/<rel>
//     both install to docs/<rel>. So a relative link that works in an installed project works
//     on the site, and a route claimed by two trees is a real install-path collision, which
//     fails the build.
//   - Repository documents (REPOSITORY_DOCS): files about the harness itself, which install
//     nowhere, so each has a fixed route.
// The site's own pages (src/content/docs) are listed by sitePages().
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { checkPageMeta, pageMetaFor } from './page-meta.mjs'

export const GITHUB_REPO = 'https://github.com/cogvera-labs/next-expo-supabase-agent-harness'
export const DEFAULT_BRANCH = 'main'
/** The site title: the header, og:site_name, and the end of every <title>. */
export const SITE_TITLE = 'next-expo-supabase-agent-harness'

/** The repository root: docs-site/src/harness-docs/ is three levels below it. */
export const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url))
if (!existsSync(join(REPO_ROOT, 'template', 'base', 'docs'))) {
  throw new Error(`no template/base/docs under ${REPO_ROOT}: the site renders that tree in place`)
}
/** This site's own directory, repo-relative (`docs-site`), for the edit links of its own pages. */
export const SITE_DIR = relative(REPO_ROOT, fileURLToPath(new URL('../../', import.meta.url))).split(sep).join('/')
const SITE_DOCS_DIR = fileURLToPath(new URL('../content/docs/', import.meta.url))

/**
 * The repository's own documents the site renders, in sidebar order, each at a fixed route.
 * The README and the pages themselves link to these routes, so a route here is a public
 * address: change one only with its links. A listed file that is missing fails the build,
 * and so does a route that a template doc or another entry also claims. Where each one sits
 * in the sidebar is LEAD_GROUPS in site-index.mjs.
 */
export const REPOSITORY_DOCS = [
  ['docs/getting-started.md', 'getting-started'],
  ['docs/how-it-works.md', 'how-it-works'],
  ['docs/faq.md', 'faq'],
  ['docs/comparison.md', 'comparison'],
  ['docs/glossary.md', 'glossary'],
  ['docs/cli.md', 'cli'],
  ['docs/evidence.md', 'evidence'],
  ['docs/building-with-agents.md', 'building-with-agents'],
  ['docs/architecture.md', 'architecture'],
  ['docs/security/assurance-case.md', 'assurance-case'],
  ['docs/forking.md', 'forking'],
]
const REPOSITORY_ROUTE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/

/**
 * Files under the corpus globs that are templates for files a project writes itself, not
 * documentation. They stay off the site; a link to one goes to its GitHub page instead.
 */
const EXCLUDED = new Map([
  ['template/base/docs/adr/0000-adr-template.md', 'the skeleton `/adr` copies for a new decision record'],
  ['template/modules/store-metadata/docs/store/app-review-notes.md', 'a fill-in template for the App Review notes'],
])

/** Sorted, recursive listing of `.md` files (readdir order is the filesystem's). */
function markdownFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { recursive: true })
    .map(String)
    .filter((rel) => rel.endsWith('.md') && statSync(join(dir, rel)).isFile())
    .sort()
}

/** `harness/README.md` -> `harness`; `x/mobile-sentry.patch.md` -> `x/mobile-sentry-patch`. */
export function routeFor(docsRel) {
  const segments = docsRel.replace(/\.md$/, '').split('/')
  if (segments.at(-1) === 'README') segments.pop()
  return segments.map((s) => s.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')).join('/')
}

/** Repo-relative docs folders: the base tree's, then every module's. Modules are discovered, never listed. */
function corpusRoots() {
  const roots = ['template/base/docs']
  const modulesDir = join(REPO_ROOT, 'template', 'modules')
  for (const name of readdirSync(modulesDir).sort()) {
    if (existsSync(join(modulesDir, name, 'docs'))) roots.push(`template/modules/${name}/docs`)
  }
  return roots
}

/** Every `.md` file under the corpus roots, as [root, path relative to the root's docs/]. */
function corpusFiles() {
  return corpusRoots().flatMap((root) => markdownFiles(join(REPO_ROOT, root)).map((f) => [root, f.split(sep).join('/')]))
}

/**
 * @typedef {{ description?: string, title?: string, label?: string }} PageMeta
 * @typedef {{ repoPath: string, installPath: string | null, absPath: string, fileURL: URL, route: string, meta: PageMeta }} CorpusPage
 *   `installPath` is the path under an installed project (`docs/<rel>`), or null for a repository document.
 */

/** A page read in place, its route recorded in `byRoute`; a route already held fails the build. */
function claimPage(byRoute, repoPath, route, installPath) {
  if (route === '') throw new Error(`${repoPath}: a corpus page cannot claim the site root`)
  const clash = byRoute.get(route)
  if (clash) throw new Error(`route "${route}" is claimed by both ${clash} and ${repoPath}`)
  byRoute.set(route, repoPath)
  const absPath = join(REPO_ROOT, repoPath)
  return { repoPath, installPath, absPath, fileURL: pathToFileURL(absPath), route, meta: pageMetaFor(repoPath) }
}

/** The template docs, each at its install path's route. */
function templatePages(byRoute) {
  const files = corpusFiles()
  // A stale exclusion would hide nothing and say something false, so it fails instead.
  for (const repoPath of EXCLUDED.keys()) {
    if (!files.some(([root, rel]) => posix.join(root, rel) === repoPath)) {
      throw new Error(`corpus.mjs excludes ${repoPath}, which no longer exists: remove the entry`)
    }
  }
  const pages = files
    .filter(([root, rel]) => !EXCLUDED.has(posix.join(root, rel)))
    .map(([root, rel]) => claimPage(byRoute, posix.join(root, rel), routeFor(rel), `docs/${rel}`))
  if (pages.length === 0) throw new Error('the docs corpus is empty: a site over nothing is a false green')
  return pages
}

/** The repository documents, each at its fixed route. A listed file that is missing fails the build. */
function repositoryPages(byRoute) {
  return REPOSITORY_DOCS.map(([repoPath, route]) => {
    if (!repoPath.endsWith('.md') || !REPOSITORY_ROUTE.test(route)) {
      throw new Error(`corpus.mjs lists ${repoPath} at "${route}": the file must be .md, the route lower-case words joined by - and /`)
    }
    if (!existsSync(join(REPO_ROOT, repoPath))) {
      throw new Error(`corpus.mjs lists ${repoPath} as a page of the site, and it does not exist: restore the file or remove its entry`)
    }
    if ([...byRoute.values()].includes(repoPath)) {
      throw new Error(`corpus.mjs renders ${repoPath} twice: it is listed twice, or it is a template doc too`)
    }
    return claimPage(byRoute, repoPath, route, null)
  })
}

/**
 * @type {{ pages: CorpusPage[], byAbsPath: Map<string, CorpusPage>, byInstallPath: Map<string, CorpusPage> } | undefined}
 */
let cached
export function loadCorpus() {
  if (cached) return cached
  const byRoute = new Map()
  const pages = [...templatePages(byRoute), ...repositoryPages(byRoute)]
  checkPageMeta(new Set(pages.map((p) => p.repoPath)))
  cached = {
    pages,
    byAbsPath: new Map(pages.map((p) => [p.absPath, p])),
    byInstallPath: new Map(pages.filter((p) => p.installPath).map((p) => [p.installPath, p])),
  }
  return cached
}

/** The site's own pages (src/content/docs), which carry frontmatter. `index` is the site root. */
export function sitePages() {
  return markdownFiles(SITE_DOCS_DIR).map((file) => {
    const rel = file.split(sep).join('/')
    const absPath = join(SITE_DOCS_DIR, rel)
    const route = rel.replace(/\.md$/, '').replace(/\/index$/, '')
    return { repoPath: repoRelative(absPath), installPath: null, absPath, fileURL: pathToFileURL(absPath), route, local: true }
  })
}

/** The folders the repository documents live in, for Starlight's Markdown processing. */
export const repositoryDocDirs = () => [...new Set(REPOSITORY_DOCS.map(([repoPath]) => join(REPO_ROOT, posix.dirname(repoPath), '/')))]

/** Repo-relative POSIX path for an absolute path. */
export function repoRelative(absPath) {
  return relative(REPO_ROOT, absPath).split(sep).join('/')
}
