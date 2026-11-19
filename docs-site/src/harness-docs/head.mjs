// What the site puts in a page's <head> beyond Starlight's own tags, for search engines.
//
// This file imports nothing: the route middleware runs it inside the built site, and
// tests/gates/docs-site.test.mjs runs it without the site's dependencies installed.

/** The length the site holds a <title> to: about what a search result shows before it cuts the rest. */
export const TITLE_MAX = 60

/**
 * What follows a page's own title in its <title>. The site's title is the package name, which
 * alone would take more than half of TITLE_MAX, so a <title> ends with what the project is
 * instead. The header and og:site_name keep the name.
 */
export const TITLE_SUFFIX = ' | Claude Code harness'

/** The longest page title that fits in a <title> beside the suffix. page-meta.mjs holds its titles to it. */
export const PAGE_TITLE_MAX = TITLE_MAX - TITLE_SUFFIX.length

/** A page's <title>: its own title, then the suffix. */
export const documentTitle = (pageTitle) => `${pageTitle}${TITLE_SUFFIX}`

/**
 * Put the site's <title> into a page's head, in place of the "<page title> | <site title>"
 * that Starlight writes. `ownHead` is the head the page itself asked for: a <title> there is
 * already whole (the home page's, or one the loader built from a page-meta.mjs title) and
 * stays as it is.
 */
export function setDocumentTitle(head, ownHead, pageTitle) {
  if (ownHead.some((entry) => entry.tag === 'title')) return
  const title = head.find((entry) => entry.tag === 'title')
  if (title) title.content = documentTitle(pageTitle)
}
