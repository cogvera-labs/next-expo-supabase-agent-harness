// Starlight route middleware: each page's <title>, and JSON-LD built from the same validated
// entry data Starlight renders. Every page but the home page gets a TechArticle (title,
// description, lastUpdated); the home page gets the software and its publisher, beside the
// WebSite block that astro.config.mjs puts on every page.
//
// This file runs inside the built site, so it imports nothing that reads the repository at
// run time; the version is a JSON import, which the build inlines.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data'
import { version } from '../../package.json'
import { setDocumentTitle } from './harness-docs/head.mjs'

const REPOSITORY = 'https://github.com/cogvera-labs/next-expo-supabase-agent-harness'
const NPM_PACKAGE = 'https://www.npmjs.com/package/next-expo-supabase-agent-harness'
const PUBLISHER = {
  '@type': 'Organization',
  '@id': 'https://www.cogveralabs.ai/#organization',
  name: 'Cogvera Labs',
  url: 'https://www.cogveralabs.ai',
  sameAs: ['https://github.com/cogvera-labs'],
}

const jsonLd = (value) => ({ tag: 'script', attrs: { type: 'application/ld+json' }, content: JSON.stringify(value).replace(/</g, '\\u003c') })

/** The home page: the publisher, and the software this site documents. */
function homeJsonLd(route, url) {
  return [
    { '@context': 'https://schema.org', ...PUBLISHER },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: route.siteTitle,
      ...(route.entry.data.description ? { description: route.entry.data.description } : {}),
      url,
      codeRepository: REPOSITORY,
      sameAs: [NPM_PACKAGE],
      programmingLanguage: ['JavaScript', 'TypeScript'],
      runtimePlatform: 'Node.js',
      license: 'https://spdx.org/licenses/Apache-2.0.html',
      version,
      author: { '@id': PUBLISHER['@id'] },
      publisher: { '@id': PUBLISHER['@id'] },
    },
  ]
}

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute
  const { data } = route.entry
  setDocumentTitle(route.head, data.head, data.title)
  if (!context.site) return
  const url = new URL(context.url.pathname, context.site).href
  // Starlight gives the site root's entry (src/content/docs/index.md) the id ''.
  if (route.id === '') {
    route.head.push(...homeJsonLd(route, url).map(jsonLd))
    return
  }
  if (data.template === 'splash') return
  route.head.push(
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: data.title,
      ...(data.description ? { description: data.description } : {}),
      ...(route.lastUpdated ? { dateModified: route.lastUpdated.toISOString() } : {}),
      url,
      isPartOf: { '@type': 'WebSite', name: route.siteTitle, url: new URL(import.meta.env.BASE_URL, context.site).href },
    }),
  )
})
