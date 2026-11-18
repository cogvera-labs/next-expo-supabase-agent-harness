# The documentation site

This folder builds <https://cogvera-labs.github.io/next-expo-supabase-agent-harness/>, the
project's public front door: a landing page, the repository's own documents (getting
started, how it works, the CLI reference, the evidence), and the docs `init` writes into
every project. It is an [Astro Starlight](https://starlight.astro.build/) site.
[`.github/workflows/pages.yml`](../.github/workflows/pages.yml) builds it on pull requests
that change this folder or the template docs, and builds and deploys it on every push to
`main`.

Nothing here ships to a scaffold: the npm package's `files` list leaves this folder out, and
`init --consume` deletes it.

## Where pages come from

Every page has one source file, read in place. Nothing is copied into this folder.

| Kind | Source | Route | Title and description | Edit link |
|---|---|---|---|---|
| Template docs | `template/base/docs/**/*.md` and `template/modules/*/docs/**/*.md` | the file's path under an installed project's `docs/`, so `docs/runbooks/first-run.md` is `/runbooks/first-run/` | the first `# ` heading and the first paragraph, or an entry in `page-meta.mjs` | the file, or the register a generated page names |
| Repository documents | the files listed in `REPOSITORY_DOCS` in [`src/harness-docs/corpus.mjs`](src/harness-docs/corpus.mjs) | fixed in that list | the first `# ` heading and the first paragraph, or an entry in `page-meta.mjs` | the file |
| The site's own pages | `src/content/docs/**/*.md`, such as the landing page | the path, with `index.md` at the root | frontmatter (`title`, `description`) | the file |

The two kinds read in place carry no frontmatter. The build gives each page its route,
takes its title from the first heading, and takes its description from the first paragraph,
cut at a word near 157 characters when it is longer than 160. Where that falls short,
[`src/harness-docs/page-meta.mjs`](src/harness-docs/page-meta.mjs) holds a hand-written
description, a shorter `<title>` and a sidebar label; the page still shows its own heading.
The build log names each page whose description was cut or missing.

The sidebar opens with the groups in `LEAD_GROUPS` in
[`src/harness-docs/site-index.mjs`](src/harness-docs/site-index.mjs) (Start here, Reference,
Project), then one group per template docs folder. `llms.txt` lists every page in the same
order.

## Links

- **In a page read in place**, write relative links, as for GitHub. A link to a page the site
  renders becomes that page's route, whether it is resolved against the installed path or the
  repository path. A link to any other file in the repository becomes its GitHub page, and a
  relative image is shown from its raw file. A link that leaves the repository, or names a file
  that does not exist, fails the build.
- **In one of the site's own pages**, write absolute links with the base and a trailing slash:
  `/next-expo-supabase-agent-harness/<route>/`. The links validator rejects relative links.
- Every internal link and `#anchor` is checked at build time. External URLs are never fetched.
- Gates in the gates catalog have stable anchors, `#gate-<name>`, that survive a renumbering of
  the chain.
- Raw HTML in a page read in place is shown as text, except comments and bare `<details>`,
  `<summary>`, `<kbd>`, `<sub>`, `<sup>` and `<br>`, which render as they do on GitHub.

## Add a page

- **A repository document.** Write `docs/<name>.md` with no frontmatter, a `# ` title and a
  first paragraph of one or two sentences under 160 characters, which becomes the
  description. Add `['docs/<name>.md', '<route>']` to `REPOSITORY_DOCS` in `corpus.mjs` and
  `['<route>', '<sidebar label>']` to a group in `LEAD_GROUPS`. The route is public once
  deployed, so keep it stable.
- **A page of the site's own.** Write `src/content/docs/<name>.md` with `title` and
  `description` frontmatter. To list it in the sidebar and in `llms.txt`, add its route and
  label to a group in `LEAD_GROUPS`. Keep it out of the folders the template docs use
  (`harness`, `adr`, `runbooks`, `security`, `compliance`, `reviews`, `modules`, `store`), or a
  later template doc at the same route would fail the build.
- **A template doc** needs nothing here: it appears in its folder's group. If its heading or
  first paragraph is long, give it an entry in `page-meta.mjs`.

After adding or removing a file, restart `astro dev`: the routes and the sidebar are computed
when the config loads.

## Build-time values

In the site's own pages only, `{{gates}}`, `{{guard-rule-ids}}` and `{{can-fail-proofs}}`
are replaced at build time with values counted from
`template/base/tools/harness.config.mjs`, `template/base/.claude/hooks/lib/guard-rules.mjs`
and `tests/canary/injections.json`. Any other `{{…}}` in a site page fails the build, so a
site page cannot show literal double braces. Write no other number that can go stale.
[`src/harness-docs/site-values.mjs`](src/harness-docs/site-values.mjs) defines the values.

## What fails the build

- A file listed in `REPOSITORY_DOCS` that does not exist, or one with frontmatter or no `# `
  heading.
- Two pages claiming one route, or a page claiming the site root.
- A stale exclusion in `corpus.mjs`, or an empty template docs tree.
- A `page-meta.mjs` entry for a page the site does not render, an unknown field, or a field
  over its limit (description 155 characters, title 40, label 32).
- A route in `LEAD_GROUPS` that names no page, or a repository document in no group.
- An unknown build-time value in a site page.
- A relative link that leaves the repository or names nothing; an internal link, `#anchor`
  or hero action that does not resolve; an internal link without its trailing slash.
- A gates catalog with no stable gate anchors, or two gates claiming one.
- `docs/media/social-preview.png` missing (it becomes `og.png`).

## Build it

```sh
pnpm --dir docs-site install --frozen-lockfile
pnpm --dir docs-site run build    # writes docs-site/dist/
pnpm --dir docs-site run dev      # a local server
```

The site has its own lockfile and pnpm root. It needs Node 22.22 or newer (CI uses Node 24)
and the pnpm version in `package.json` (`corepack enable` provides it). "Last updated" dates
come from `git log`, so a shallow clone stamps every page with one date. CI also sets
`ASTRO_TELEMETRY_DISABLED=1`.

## Checks that cover this folder

ESLint lints the `.mjs` files here with the repository's cognitive-complexity budget, and
`scripts/hygiene.mjs` and REUSE cover every file. Two gaps:

- A pull request that changes only the repository documents under `docs/` does not build the
  site, because `pages.yml` does not list `docs/**` among its paths. A broken link there
  first shows on `main`, whose build then fails and leaves the deployed site as it was.
- `scripts/check-claims.mjs` and the standards-claim sweep read neither `docs/` nor this
  folder, so a number or a standards claim on these pages is checked by its author, and by the
  build-time values above.
