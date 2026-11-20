// When each page's source file last changed, read from git. A page's "Last updated" line,
// its JSON-LD dateModified and its <lastmod> in the sitemap all come from this one lookup, so
// the three cannot disagree.
//
// This file imports Node built-ins only: tests/gates/docs-site.test.mjs runs it against
// throwaway repositories, without the site's dependencies installed.
import { spawnSync } from 'node:child_process'

const git = (args, cwd) => spawnSync('git', args, { cwd, encoding: 'utf8', timeout: 60_000, maxBuffer: 64 * 1024 * 1024 })

/**
 * The newest commit time of every file under `paths`, by repo-relative path, from one git
 * call in the repository at `cwd`.
 *
 * `failure` says why git could not answer. `shallow` is true in a clone cut short of its
 * history: there git lists every file as changed by the oldest commit it holds, so a file's
 * date can be the day the history was cut and not the day the file changed.
 *
 * @param {string[]} paths
 * @param {string} cwd
 * @returns {{ dates: Map<string, Date>, shallow: boolean, failure?: string }}
 */
export function lastCommitDates(paths, cwd) {
  const dates = new Map()
  const log = git(['log', '--format=t:%ct', '--name-only', '--', ...paths], cwd)
  if (log.status !== 0) return { dates, shallow: false, failure: log.error?.message ?? log.stderr.trim() }
  let current
  for (const line of log.stdout.split('\n')) {
    if (line.startsWith('t:')) current = new Date(Number(line.slice(2)) * 1000)
    else if (line && current && !dates.has(line)) dates.set(line, current)
  }
  return { dates, shallow: git(['rev-parse', '--is-shallow-repository'], cwd).stdout.trim() === 'true' }
}

/**
 * The sitemap's <lastmod> for each page, by the page's URL: the commit date of the page's
 * source file. It is empty when git could not answer or the clone is shallow, and has no
 * entry for a page without a commit: an entry with no <lastmod> is valid, and a date that is
 * not the page's own tells a crawler something false.
 *
 * @param {{ route: string, repoPath: string }[]} pages
 * @param {{ dates: Map<string, Date>, shallow: boolean, failure?: string }} lookup
 * @param {string} siteWithBase the URL of the site's root, with its trailing slash
 * @returns {Map<string, string>}
 */
export function lastmodByUrl(pages, lookup, siteWithBase) {
  const lastmod = new Map()
  if (lookup.failure || lookup.shallow) return lastmod
  for (const { route, repoPath } of pages) {
    const date = lookup.dates.get(repoPath)
    // The page at the site's root has the route `index`; every other page's URL ends in a slash.
    if (date) lastmod.set(`${siteWithBase}${route === 'index' ? '' : `${route}/`}`, date.toISOString())
  }
  return lastmod
}
