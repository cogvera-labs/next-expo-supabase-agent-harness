// The documentation site (#171): Starlight over the docs that `init` installs, read in place
// from template/base/docs/ and template/modules/*/docs/, and over the repository's own
// documents listed in src/harness-docs/corpus.mjs. Nothing is copied into this folder.
// Build: `pnpm install --frozen-lockfile && pnpm run build` here; .github/workflows/pages.yml
// runs the same two commands and deploys dist/ to GitHub Pages from main. README.md here
// says how pages are sourced and how to add one.
import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { satteri } from '@astrojs/markdown-satteri'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightLinksValidator from 'starlight-links-validator'
import starlightLlmsTxt from 'starlight-llms-txt'
import { DEFAULT_BRANCH, GITHUB_REPO, REPO_ROOT, REPOSITORY_DOCS, SITE_DIR, SITE_TITLE, repositoryDocDirs } from './src/harness-docs/corpus.mjs'
import { llmsTxtLink } from './src/harness-docs/head.mjs'
import { harnessHastPlugins, harnessMdastPlugins } from './src/harness-docs/markdown-plugins.mjs'
import { LEAD_GROUPS, harnessSidebar, llmsPageIndex, sitemapLastmod } from './src/harness-docs/site-index.mjs'

const site = 'https://cogvera-labs.github.io'
const base = '/next-expo-supabase-agent-harness'
const title = SITE_TITLE
// The project's one-sentence description, the same as the landing page's tagline.
const description =
  'A Next.js + Expo (React Native) monorepo starter on Supabase with a Claude Code harness: hooks that send the agent back to work while a quality gate fails.'
// The og.png card (docs/media/social-preview.png) is text only; this is its text.
const OG_IMAGE_ALT =
  'next-expo-supabase-agent-harness: a CLI that scaffolds a pnpm monorepo with a Next.js web app and an Expo (React Native) mobile app on one Supabase backend, plus Claude Code hooks and CI gates.'
// What llms.txt says before its page index: the product first, then how this site is made.
const LLMS_DETAILS = [
  `${title} is an npm CLI. \`npx --yes ${title}@latest init\` writes a pnpm monorepo, a Next.js web app and an Expo (React Native) mobile app on one Supabase backend, together with the Claude Code harness that holds a coding agent to it: PreToolUse guard hooks that check each shell command, file write and MCP call before it runs; a Stop hook that sends the agent back to work while a quality gate fails; \`pnpm validate\`, a chain of gates that each have a registered can-fail proof; and CI that runs the same chain against a frozen copy of its step list, so a project can add a gate but cannot quietly drop one. \`update\` moves an existing project to a later release.`,
  `This site renders the repository's own documents and the docs \`init\` installs into every project, read in place from the main branch, so it can describe changes that are not released yet. The landing page is ${site}${base}/. Every other page is listed below by sidebar group, with the repository file it is rendered from.`,
].join('\n\n')

/**
 * og.png is docs/media/social-preview.png, the image made for the repository's social preview
 * (uploaded by hand: GitHub has no API for it), copied into the build output so the site and
 * the repository page can share one image. The build fails without it.
 */
function socialPreview() {
  const source = join(REPO_ROOT, 'docs', 'media', 'social-preview.png')
  return {
    name: 'harness-social-preview',
    hooks: {
      'astro:config:setup': () => {
        if (!existsSync(source)) throw new Error('docs/media/social-preview.png is missing: the site copies it to og.png for og:image')
      },
      'astro:build:done': ({ dir }) => {
        copyFileSync(source, new URL('og.png', dir))
      },
    },
  }
}

/**
 * The sitemap, with a <lastmod> on each page: the commit date of the page's source file,
 * which is the date the page shows as "Last updated". Starlight adds a sitemap of its own,
 * without dates, only when the config has none. The dates are read once, when a build
 * starts (`astro dev` writes no sitemap), so that writing an entry is a lookup that cannot
 * fail: the sitemap integration logs an error from `serialize` and then writes no sitemap.
 */
function sitemapWithLastmod() {
  let lastmod = new Map()
  const dates = {
    name: 'harness-sitemap-lastmod',
    hooks: {
      'astro:build:start': ({ logger }) => {
        lastmod = sitemapLastmod(`${site}${base}/`, logger)
      },
    },
  }
  return [dates, sitemap({ serialize: (item) => (lastmod.has(item.url) ? { ...item, lastmod: lastmod.get(item.url) } : item) })]
}

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  markdown: {
    // Sätteri is Astro 7's default processor; it is configured here to add the plugins.
    processor: satteri({
      // GitHub renders these files without smart punctuation, so the site does too: straight
      // quotes, and `--hard` stays two hyphens.
      features: { smartPunctuation: false },
      mdastPlugins: harnessMdastPlugins({ base: `${base}/` }),
      hastPlugins: harnessHastPlugins(),
    }),
  },
  integrations: [
    socialPreview(),
    starlight({
      title,
      description,
      social: [
        { icon: 'github', label: 'GitHub', href: GITHUB_REPO },
        { icon: 'npm', label: 'npm', href: `https://www.npmjs.com/package/${title}` },
      ],
      // Pages read in place carry their own edit link (set by the loader); this covers the site's own pages.
      editLink: { baseUrl: `${GITHUB_REPO}/edit/${DEFAULT_BRANCH}/${SITE_DIR}/` },
      lastUpdated: true,
      // Starlight's own Markdown transforms (heading anchor links, asides) run only on
      // src/content/docs unless the folders read in place are listed here.
      markdown: {
        processedDirs: [join(REPO_ROOT, 'template/base/docs/'), join(REPO_ROOT, 'template/modules/'), ...repositoryDocDirs()],
      },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      sidebar: harnessSidebar(),
      // The landing page's card grid; it is scoped to that page.
      customCss: ['./src/styles/landing.css'],
      routeMiddleware: './src/route-data.mjs',
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: `${site}${base}/og.png` } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${site}${base}/og.png` } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: OG_IMAGE_ALT } },
        { tag: 'meta', attrs: { name: 'twitter:image:alt', content: OG_IMAGE_ALT } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1280' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '640' } },
        llmsTxtLink(base),
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: title, url: `${site}${base}/` }).replace(/</g, '\\u003c'),
        },
      ],
      plugins: [
        // Internal links and #anchors only; it never fetches an external URL.
        starlightLinksValidator({
          errorOnRelativeLinks: true,
          errorOnInvalidHashes: true,
          errorOnLocalLinks: true,
          sameSitePolicy: 'validate',
        }),
        starlightLlmsTxt({
          projectName: title,
          description,
          // llms.txt lists no pages by itself; this puts every page in it, in sidebar order.
          details: `${LLMS_DETAILS}\n\n${llmsPageIndex(`${site}${base}/`)}`,
          customSets: [
            {
              label: 'Getting started, reference and project',
              paths: REPOSITORY_DOCS.map(([, route]) => route),
              description: 'getting started, how the harness works, the FAQ, the CLI reference, the evidence and how this repository is built',
            },
            { label: 'Harness doctrine and gates', paths: ['harness/**', 'reviews/**'], description: 'the doctrine, enforcement tiers, the gates catalog and review records' },
            { label: 'Architecture decisions', paths: ['adr/**'] },
            { label: 'Runbooks', paths: ['runbooks/**'] },
            { label: 'Security and compliance', paths: ['security/**', 'compliance/**'] },
            { label: 'Modules', paths: ['modules/**', 'store/**'] },
          ],
          // llms-full.txt and llms-small.txt open with the landing page, then the sidebar's lead groups.
          promote: ['index*', ...LEAD_GROUPS.flatMap((group) => group.items.map(([route]) => route)), 'harness*'],
          // The release-by-release upgrade log is most of llms-small.txt's size.
          exclude: ['runbooks/harness-upgrade'],
          // Starlight's heading anchor links read as "Section titled …" noise in plain text.
          customSelectors: { all: ['.sl-anchor-link'] },
        }),
      ],
    }),
    ...sitemapWithLastmod(),
  ],
})
