// THE DOCUMENTATION SITE'S SEARCH METADATA (docs-site/src/harness-docs/).
//
// The site's build proves that every page renders and every internal link resolves. It
// cannot tell a <title> that a search result shows whole from one it cuts, or a sitemap date
// that is a page's own from one that is not, so both are held here, on every pull request and
// not only on those that build the site.
//
// The modules under test import Node built-ins and each other, never the site's
// dependencies, so the installer-unit job, which installs nothing, runs this file on Linux,
// Windows and macOS.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'
import { loadCorpus, pageSourcePaths, sitePages } from '../../docs-site/src/harness-docs/corpus.mjs'
import { PAGE_TITLE_MAX, TITLE_MAX, TITLE_SUFFIX, documentTitle, llmsTxtLink, setDocumentTitle, verificationTags, wholeTitle } from '../../docs-site/src/harness-docs/head.mjs'
import { lastCommitDates, lastmodByUrl } from '../../docs-site/src/harness-docs/page-dates.mjs'
import { firstH1 } from '../../docs-site/src/harness-docs/site-index.mjs'
import { tempDir } from '../helpers/temp-dir.mjs'

// ---- the <title> ---------------------------------------------------------------------

test('a <title> is the page title and the suffix, and a title at its limit fills it exactly', () => {
  assert.equal(TITLE_MAX, 60)
  assert.equal(documentTitle('Gates catalog'), `Gates catalog${TITLE_SUFFIX}`)
  assert.equal(documentTitle('x'.repeat(PAGE_TITLE_MAX)).length, TITLE_MAX)
  assert.ok(PAGE_TITLE_MAX >= 30, `the suffix leaves a page title ${String(PAGE_TITLE_MAX)} characters, too few to say what a page is about`)
})

test("every page's <title> fits in what a search result shows", () => {
  const long = loadCorpus().pages.flatMap((page) => {
    const title = documentTitle(page.meta.title ?? firstH1(readFileSync(page.absPath, 'utf8')) ?? '')
    return title.length > TITLE_MAX ? [`${page.repoPath}: "${title}" is ${String(title.length)} characters`] : []
  })
  assert.deepEqual(long, [], `give each page a title of at most ${String(PAGE_TITLE_MAX)} characters in docs-site/src/harness-docs/page-meta.mjs`)
})

test("a page's own <title> stays, and Starlight's default takes the suffix", () => {
  const defaults = () => [
    { tag: 'meta', attrs: { charset: 'utf-8' } },
    { tag: 'title', content: 'Gates catalog | next-expo-supabase-agent-harness' },
  ]

  const plain = defaults()
  setDocumentTitle(plain, [], 'Gates catalog')
  assert.equal(plain[1].content, `Gates catalog${TITLE_SUFFIX}`)

  // The home page, and a page whose title comes from page-meta.mjs, state the whole <title>.
  const own = [{ tag: 'title', content: 'Claude Code harness for Next.js, Expo and Supabase' }]
  const home = [defaults()[0], ...own]
  setDocumentTitle(home, own, 'Claude Code harness for Next.js, Expo and Supabase')
  assert.equal(home[1].content, 'Claude Code harness for Next.js, Expo and Supabase')

  // The loader measures the same <title> for the build log.
  assert.equal(wholeTitle([], 'Gates catalog'), `Gates catalog${TITLE_SUFFIX}`)
  assert.equal(wholeTitle(own, 'Home'), own[0].content)

  const untitled = [defaults()[0]]
  setDocumentTitle(untitled, [], 'Gates catalog')
  assert.deepEqual(untitled, [defaults()[0]])
})

// ---- the link to llms.txt --------------------------------------------------------------

// The build's link validator does not read a <head>, so the shape of this link is held here.
test('a page links the llms.txt at the site base, with the relation the llms.txt proposal names', () => {
  assert.deepEqual(llmsTxtLink('/next-expo-supabase-agent-harness'), {
    tag: 'link',
    attrs: { rel: 'describedby', href: '/next-expo-supabase-agent-harness/llms.txt' },
  })
})

// ---- search-engine verification --------------------------------------------------------

// Made-up codes in the two shapes the services issue: base64 text, and hexadecimal.
const GOOGLE_SAMPLE = 'sample_Google-code+123/abc='
const BING_SAMPLE = '0123456789ABCDEF0123456789ABCDEF'

test('a verification tag is written for each code that is set, and none for an empty one', () => {
  assert.deepEqual(verificationTags({ google: '', bing: '' }), [])
  assert.deepEqual(verificationTags({ google: GOOGLE_SAMPLE, bing: '' }), [{ tag: 'meta', attrs: { name: 'google-site-verification', content: GOOGLE_SAMPLE } }])
  assert.deepEqual(verificationTags({ google: GOOGLE_SAMPLE, bing: BING_SAMPLE }), [
    { tag: 'meta', attrs: { name: 'google-site-verification', content: GOOGLE_SAMPLE } },
    { tag: 'meta', attrs: { name: 'msvalidate.01', content: BING_SAMPLE } },
  ])
})

test('a whole tag pasted as a code, a padded code and an unknown service fail before they reach a page', () => {
  const wholeTag = `<meta name="google-site-verification" content="${GOOGLE_SAMPLE}" />`
  assert.throws(() => verificationTags({ google: wholeTag, bing: '' }), /SITE_VERIFICATION\.google must be the value of the tag's content attribute alone/)
  assert.throws(() => verificationTags({ google: '', bing: ` ${BING_SAMPLE}` }), /SITE_VERIFICATION\.bing must be the value/)
  assert.throws(() => verificationTags({ google: '', bing: '', yandex: 'abc' }), /has a code for "yandex"/)
})

// ---- the sitemap's <lastmod> -----------------------------------------------------------

// A private directory per fixture. The helper removes it when the file is done.
const scratch = () => tempDir('harness-docs-site-')

// A fixture's git commands must reach the fixture alone, whatever repository the run was started from.
const NO_GIT_ENV = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('GIT_')))

function git(cwd, args, env = {}) {
  const res = spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...NO_GIT_ENV, ...env } })
  assert.equal(res.status, 0, `git ${args.join(' ')} failed: ${res.stderr}`)
}

const FIRST = new Date('2026-01-05T10:00:00Z')
const SECOND = new Date('2026-03-09T16:30:00Z')

/** Write files and commit them at a given time. */
function commit(dir, files, when) {
  for (const [path, text] of Object.entries(files)) writeFileSync(join(dir, path), text)
  // Git's own date format: seconds since the epoch, then a zone offset.
  const stamp = `${String(when.getTime() / 1000)} +0000`
  git(dir, ['add', '-A'])
  git(dir, ['commit', '-q', '-m', 'change'], { GIT_AUTHOR_DATE: stamp, GIT_COMMITTER_DATE: stamp })
}

/** A repository of two commits: the first writes docs/a.md and docs/b.md, the second changes docs/b.md alone. */
function repository() {
  const dir = scratch()
  git(dir, ['init', '-q'])
  for (const [key, value] of [
    ['user.email', 'docs-site-test@example.invalid'],
    ['user.name', 'docs-site-test'],
    ['core.autocrlf', 'false'],
    ['commit.gpgsign', 'false'],
  ]) {
    git(dir, ['config', key, value])
  }
  mkdirSync(join(dir, 'docs'))
  commit(dir, { 'docs/a.md': '# A\n', 'docs/b.md': '# B\n' }, FIRST)
  commit(dir, { 'docs/b.md': '# B\n\nChanged.\n' }, SECOND)
  return dir
}

const SITE = 'https://example.invalid/site/'
const PAGES = [
  { route: 'index', repoPath: 'docs/a.md' },
  { route: 'guide/b', repoPath: 'docs/b.md' },
  { route: 'new', repoPath: 'docs/not-committed.md' },
]

test('with full history, a page takes the date of the last commit to its own file', () => {
  const lookup = lastCommitDates(['docs'], repository())
  assert.equal(lookup.failure, undefined)
  assert.equal(lookup.shallow, false)
  // The site's root has no path of its own, every other URL ends in a slash, and a page git
  // has no commit for has no entry.
  assert.deepEqual(
    [...lastmodByUrl(PAGES, lookup, SITE)],
    [
      [SITE, FIRST.toISOString()],
      [`${SITE}guide/b/`, SECOND.toISOString()],
    ],
  )
})

test('in a shallow clone the sitemap carries no date, where git would give every page the newest', () => {
  const clone = join(scratch(), 'clone')
  git(tmpdir(), ['clone', '-q', '--depth', '1', pathToFileURL(repository()).href, clone])
  const lookup = lastCommitDates(['docs'], clone)
  assert.equal(lookup.failure, undefined)
  assert.equal(lookup.shallow, true)
  // The date that would be false: docs/a.md was last changed by the first commit, and here
  // git reports it as changed by the second, the only commit the clone holds.
  assert.equal(lookup.dates.get('docs/a.md')?.getTime(), SECOND.getTime())
  assert.equal(lastmodByUrl(PAGES, lookup, SITE).size, 0)
})

test('when git cannot answer, the sitemap carries no date', () => {
  const lookup = lastCommitDates(['docs'], join(scratch(), 'no-such-folder'))
  assert.ok(lookup.failure, 'a lookup in a folder that does not exist says why it failed')
  assert.equal(lastmodByUrl(PAGES, lookup, SITE).size, 0)
})

test("every page's source file is under a path the date lookup reads", () => {
  const paths = pageSourcePaths()
  const unread = [...sitePages(), ...loadCorpus().pages]
    .map((page) => page.repoPath)
    .filter((repoPath) => !paths.some((path) => repoPath === path || repoPath.startsWith(`${path}/`)))
  assert.deepEqual(unread, [], 'pageSourcePaths() in corpus.mjs must cover these files, or their pages get no "Last updated" date and no <lastmod>')
})
