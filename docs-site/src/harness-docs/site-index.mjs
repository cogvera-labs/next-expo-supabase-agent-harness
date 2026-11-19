// Config-time views of the pages: the sidebar, the llms.txt page index and the sitemap's
// dates. All come from the same listings the loader renders, and the index follows the
// sidebar, so a new page appears everywhere at once.
//
// The sidebar is built from `slug` items rather than `autogenerate`: Starlight's autogenerate
// groups pages by their file path under src/content/docs, which a file read in place never
// has. A `slug` item takes its label from the item, else from the page title.
import { readFileSync } from 'node:fs'
import { REPO_ROOT, REPOSITORY_DOCS, loadCorpus, pageSourcePaths, sitePages } from './corpus.mjs'
import { lastCommitDates, lastmodByUrl } from './page-dates.mjs'

/**
 * The groups that open the sidebar, before the template docs' groups. Each item is the route
 * of a repository document (REPOSITORY_DOCS in corpus.mjs) or of one of the site's own pages
 * under src/content/docs, with its sidebar label. The build fails on a route that names no
 * page, and on a repository document that no group lists.
 */
export const LEAD_GROUPS = [
  {
    label: 'Start here',
    items: [
      ['getting-started', 'Getting started'],
      ['how-it-works', 'How it works'],
      ['faq', 'FAQ'],
      ['comparison', 'Comparison'],
    ],
  },
  {
    label: 'Reference',
    items: [
      ['cli', 'CLI'],
      ['glossary', 'Glossary'],
    ],
  },
  {
    label: 'Project',
    items: [
      ['evidence', 'Evidence'],
      ['building-with-agents', 'Building with agents'],
      ['architecture', 'Architecture'],
      ['assurance-case', 'Assurance case'],
      ['forking', 'Forking'],
    ],
  },
]

/** The template docs' groups, by first route segment, in this order; an unknown folder follows. */
const GROUP_LABELS = {
  harness: 'Harness',
  adr: 'Architecture decisions',
  runbooks: 'Runbooks',
  security: 'Security',
  compliance: 'Compliance',
  reviews: 'Review records',
  modules: 'Modules',
  store: 'Store metadata',
}
const GROUP_ORDER = Object.keys(GROUP_LABELS)

const labelFor = (dir) => GROUP_LABELS[dir] ?? dir.charAt(0).toUpperCase() + dir.slice(1)
const rank = (dir) => (GROUP_ORDER.includes(dir) ? GROUP_ORDER.indexOf(dir) : GROUP_ORDER.length)
// A folder's README (route === dir) first, then alphabetical.
const byRoute = (dir) => (a, b) => (a.route === dir ? -1 : b.route === dir ? 1 : a.route.localeCompare(b.route))
// A sidebar link, labelled from page-meta.mjs where the page's H1 is too long for one.
const linkTo = (page, label = page.meta.label) => ({ slug: page.route, ...(label ? { label } : {}) })

/** Pages grouped by a key, in first-seen order. */
function groupBy(pages, keyOf) {
  const groups = new Map()
  for (const page of pages) {
    const key = keyOf(page)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(page)
  }
  return groups
}

/** LEAD_GROUPS, checked against the pages that exist (loading the corpus checks its own routes first). */
function leadGroups() {
  const repositoryRoutes = loadCorpus()
    .pages.filter((p) => !p.installPath)
    .map((p) => p.route)
  const routes = new Set([...repositoryRoutes, ...sitePages().map((p) => p.route)])
  const listed = LEAD_GROUPS.flatMap((group) => group.items.map(([route]) => route))
  for (const route of listed) {
    if (!routes.has(route)) throw new Error(`site-index.mjs puts "${route}" in the sidebar, and no repository document or site page has that route`)
  }
  for (const [repoPath, route] of REPOSITORY_DOCS) {
    const times = listed.filter((r) => r === route).length
    if (times !== 1) throw new Error(`${repoPath} ("${route}") must be in exactly one LEAD_GROUPS group in site-index.mjs, not ${String(times)}`)
  }
  return LEAD_GROUPS.map(({ label, items }) => ({ label, items: items.map(([slug, itemLabel]) => ({ slug, label: itemLabel })) }))
}

/**
 * The modules group: a page at `modules` itself first, as other folders' READMEs come first;
 * then each module, as a single link when it has one page, or as a group whose README reads
 * "Overview".
 */
function modulesGroup(pages) {
  const index = pages.filter((p) => p.route === 'modules').map((p) => linkTo(p))
  const perModule = groupBy(
    pages.filter((p) => p.route !== 'modules'),
    (p) => p.route.split('/')[1],
  )
  const modules = [...perModule.keys()].sort().map((name) => {
    const own = perModule.get(name).sort(byRoute(`modules/${name}`))
    if (own.length === 1) return linkTo(own[0], name)
    return { label: name, items: own.map((p) => (p.route === `modules/${name}` ? linkTo(p, 'Overview') : linkTo(p))) }
  })
  return { label: labelFor('modules'), collapsed: true, items: [...index, ...modules] }
}

/** The template docs' groups, by the first segment of each route. */
function templateGroups() {
  const groups = groupBy(
    loadCorpus().pages.filter((p) => p.installPath),
    (p) => p.route.split('/')[0],
  )
  return [...groups.keys()]
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((dir) => {
      if (dir === 'modules') return modulesGroup(groups.get(dir))
      return { label: labelFor(dir), items: groups.get(dir).sort(byRoute(dir)).map((p) => linkTo(p)) }
    })
}

export function harnessSidebar() {
  return [...leadGroups(), ...templateGroups()]
}

/**
 * Plain-text title of the first `# ` heading outside code fences: the label of a page's line
 * in llms.txt, and what tests/gates/docs-site.test.mjs measures a page's <title> by.
 */
export function firstH1(source) {
  let fence = null
  for (const line of source.split('\n')) {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1][0]
    if (marker) {
      if (fence === null) fence = marker
      else if (fence === marker) fence = null
      continue
    }
    const heading = fence === null ? /^ {0,3}#[ \t]+(.*)$/.exec(line) : null
    if (heading) {
      // An ATX heading may close with `#`s; inline code and emphasis keep their text.
      const text = heading[1].replace(/[ \t]#+[ \t]*$/, '').trim()
      return text.replace(/`([^`]*)`/g, '$1').replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    }
  }
  return undefined
}

/** Every link under a sidebar entry, in sidebar order. */
const linksOf = (entry) => (entry.slug === undefined ? entry.items.flatMap(linksOf) : [entry])

const LINK = /\[([^\]]+)\]\([^)\s]+\)/g
// Markup that would reach llms.txt as raw characters once code spans and links are text.
const MARKUP = /[[\]<>*_#|\\]/
// What a summary paragraph opens with; a list, a quote, a table or a fence opens otherwise.
const PROSE_START = /^[\p{L}\p{N}`[("']/u

/** A description over 160 characters, cut as the render cuts it (titleFromFirstH1 in markdown-plugins.mjs). */
function cutLikeTheRender(text) {
  if (text.length <= 160) return text
  const cut = text.lastIndexOf(' ', 157)
  return `${text.slice(0, cut > 0 ? cut : 157).replace(/[\s,;:.–—-]+$/, '')}…`
}

/**
 * A repository document's opening paragraph as plain text, for its llms.txt line when
 * page-meta.mjs gives it no description. A docs/*.md page opens with a one- or two-sentence
 * summary under its `# ` heading, which the render also makes the page's meta description,
 * so llms.txt and the page say the same thing. Code spans and links keep their text. A
 * paragraph that is missing, holds other markup, or is one the render passes over (a status
 * line, a lead-in ending in a colon) fails the build: describe that page in page-meta.mjs.
 */
function openingParagraph(page) {
  const lines = readFileSync(page.absPath, 'utf8').split(/\r?\n/)
  const heading = lines.findIndex((line) => line.startsWith('# '))
  const start = lines.findIndex((line, i) => heading !== -1 && i > heading && line.trim() !== '')
  const end = lines.findIndex((line, i) => start !== -1 && i > start && line.trim() === '')
  const raw = start === -1 ? '' : lines.slice(start, end === -1 ? undefined : end).join(' ').trim()
  // The odd parts of a split on backticks are code spans, kept as written.
  const parts = raw.split('`').map((part, i) => (i % 2 === 1 ? part : part.replace(LINK, '$1')))
  const text = parts.join('').replace(/\s+/g, ' ').trim()
  const markup = parts.some((part, i) => i % 2 === 0 && MARKUP.test(part))
  if (!PROSE_START.test(raw) || parts.length % 2 === 0 || markup || text.startsWith('Status:') || text.endsWith(':')) {
    throw new Error(
      `${page.repoPath}: llms.txt describes a repository document by the paragraph under its "# " heading, and that paragraph is missing, is not plain text, or is one the page's own description skips. Rewrite it as a one- or two-sentence summary, or describe the page in page-meta.mjs.`,
    )
  }
  return cutLikeTheRender(text)
}

/** What llms.txt says about a page: its page-meta.mjs description, else a repository document's opening paragraph. */
function descriptionOf(page) {
  if (page.meta?.description) return page.meta.description
  return page.local || page.installPath ? undefined : openingParagraph(page)
}

/**
 * The llms.txt page index, for starlight-llms-txt's `details`: one section per sidebar group,
 * in sidebar order, each page with its title, its description where page-meta.mjs has one or
 * it is a repository document, and the repository file it is rendered from.
 */
export function llmsPageIndex(siteWithBase) {
  const pages = new Map([...sitePages(), ...loadCorpus().pages].map((p) => [p.route, p]))
  const line = ({ slug, label }) => {
    const page = pages.get(slug)
    // A site page's title is in its frontmatter, which is not read here; its sidebar label stands in.
    const title = ('local' in page ? undefined : firstH1(readFileSync(page.absPath, 'utf8'))) ?? label ?? slug
    const description = descriptionOf(page)
    const about = description ? `${description} ` : ''
    return `- [${title}](${siteWithBase}${slug}/): ${about}Source: \`${page.repoPath}\`.`
  }
  return harnessSidebar()
    .map((group) => `## ${group.label}\n\n${linksOf(group).map(line).join('\n')}`)
    .join('\n\n')
}

/**
 * The sitemap's <lastmod> for a build, by page URL: each page's commit date, read as the
 * loader reads the "Last updated" dates. Where git cannot give true dates there are none,
 * and the build log says why.
 */
export function sitemapLastmod(siteWithBase, logger) {
  const lookup = lastCommitDates(pageSourcePaths(), REPO_ROOT)
  if (lookup.failure) logger.warn(`git log failed (${lookup.failure}): the sitemap is written without <lastmod>`)
  else if (lookup.shallow) logger.warn('shallow clone: git cannot say here when each page last changed, so the sitemap is written without <lastmod> (pages.yml fetches full history)')
  return lastmodByUrl([...sitePages(), ...loadCorpus().pages], lookup, siteWithBase)
}
