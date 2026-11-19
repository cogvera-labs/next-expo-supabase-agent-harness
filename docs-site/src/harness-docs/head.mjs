// What the site puts in a page's <head> beyond Starlight's own tags, for search engines and
// for clients that read llms.txt: the end of the <title>, the link to llms.txt, and the tags
// that prove to a search engine who owns the site.
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
 * The <title> a page ends up with. `ownHead` is the head the page itself asked for: a
 * <title> there is already whole (the home page's, or one the loader built from a
 * page-meta.mjs title) and stays as it is. Any other page gets its title and the suffix.
 */
export const wholeTitle = (ownHead, pageTitle) => ownHead.find((entry) => entry.tag === 'title')?.content ?? documentTitle(pageTitle)

/** Put that <title> into a page's head, in place of the "<page title> | <site title>" that Starlight writes. */
export function setDocumentTitle(head, ownHead, pageTitle) {
  const title = head.find((entry) => entry.tag === 'title')
  if (title) title.content = wholeTitle(ownHead, pageTitle)
}

/**
 * The <link> from a page to the llms.txt that covers it, for every page: the site's one
 * llms.txt sits at its base and describes all the pages under it. rel="describedby" is the
 * relation the llms.txt proposal recommends for this link (https://llmstxt.org/).
 *
 * @param {string} base Astro's `base`, without a trailing slash
 */
export const llmsTxtLink = (base) => ({ tag: 'link', attrs: { rel: 'describedby', href: `${base}/llms.txt` } })

// The <meta> name each service reads its code from.
const VERIFICATION_META = { google: 'google-site-verification', bing: 'msvalidate.01' }
// A code is base64 or hexadecimal text. A space, a quote or an angle bracket in the value
// means that more than the code was pasted.
const VERIFICATION_CODE = /^[A-Za-z0-9+/=_-]+$/

/**
 * The tags that prove to Google Search Console and Bing Webmaster Tools who owns the site,
 * one for each code that is set. An empty code writes no tag. A code is the value of the
 * tag's `content` attribute alone: the whole <meta> tag, pasted in its place, fails the
 * build here, where the message says what to paste, and never reaches a page as a tag the
 * service cannot read.
 *
 * @param {Record<string, string>} codes a code for `google`, for `bing`, or for both
 */
export function verificationTags(codes) {
  return Object.entries(codes).flatMap(([service, code]) => {
    if (!Object.hasOwn(VERIFICATION_META, service)) {
      throw new Error(`SITE_VERIFICATION has a code for "${service}"; the site writes tags for ${Object.keys(VERIFICATION_META).join(' and ')}`)
    }
    if (code === '') return []
    if (typeof code !== 'string' || !VERIFICATION_CODE.test(code)) {
      throw new Error(`SITE_VERIFICATION.${service} must be the value of the tag's content attribute alone, not the whole <meta> tag: got ${JSON.stringify(code)}`)
    }
    return [{ tag: 'meta', attrs: { name: VERIFICATION_META[service], content: code } }]
  })
}
