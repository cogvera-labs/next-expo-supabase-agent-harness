// THE DOCUMENTATION SITE'S SEARCH METADATA (docs-site/src/harness-docs/).
//
// The site's build proves that every page renders and every internal link resolves. It
// cannot tell a <title> that a search result shows whole from one it cuts, so that is held
// here, on every pull request and not only on those that build the site.
//
// The modules under test import Node built-ins and each other, never the site's
// dependencies, so the installer-unit job, which installs nothing, runs this file on Linux,
// Windows and macOS.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { loadCorpus } from '../../docs-site/src/harness-docs/corpus.mjs'
import { PAGE_TITLE_MAX, TITLE_MAX, TITLE_SUFFIX, documentTitle, setDocumentTitle } from '../../docs-site/src/harness-docs/head.mjs'
import { firstH1 } from '../../docs-site/src/harness-docs/site-index.mjs'

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

  const untitled = [defaults()[0]]
  setDocumentTitle(untitled, [], 'Gates catalog')
  assert.deepEqual(untitled, [defaults()[0]])
})
