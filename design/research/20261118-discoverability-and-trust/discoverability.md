# Discoverability, as of 2026-11-18

Condensed from research reports 04 (GitHub), 05 (npm), 06 (docs-site search and answer engines),
11 (launch channels), 13 (the Claude Code ecosystem) and 14 (the measured baseline). A † marks a
fact resting on a search extract or secondary coverage, or not checkable from here.
www.npmjs.com, api.npmjs.org, the live docs site, Hacker News, Reddit and lobste.rs were
unreachable; the docs site was audited by rebuilding the commit Pages last deployed (`3902a3b`).
The shared web-search budget ran out, so Google rankings were not measured.

## Baseline

| Measure | Value on 2026-11-18 |
|---|---|
| Stars, watchers, forks | 8, 1, 2; no new star since 2026-09-27 |
| Traffic (views, unique visitors, referrers) | Consulted for 2026-11-03 to 11-16; not published here, because GitHub does not make it public |
| npm downloads | 488 a week, 1,183 a month (the registry search API's snapshot field); likely partly mirrors and scanners (inferred), so not a measure of adoption |
| npm dependents | 0 |
| Issues | 140, none opened by a human outside the organisation |
| Discussions | 5 automatic release posts, 0 replies |
| Web search | absent from all 18 generic queries; the exact package name alone found nothing about it |
| Lists | in 0 of 7 relevant awesome lists, and not in the official plugin marketplace |
| Third-party mentions | 2 small repositories citing the previous owner path, and an automated curator that rated it "off_topic" |

Hooks and guardrails queries go to official docs, tutorial posts and small single-purpose hook
repositories; starter queries go to MakerKit's paid kit, create-t3-turbo and Nexpo. Aggregator
mirrors such as awesome.ecosyste.ms appear in 8 of the 21 result sets.

## GitHub

- **Search reads only the name, description and topics** unless `in:readme` is given
  ([docs](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories)).
  A query word missing from all three hides the repository completely.

  | Query | Results | Position |
  |---|---|---|
  | nextjs expo supabase starter | 13 | 1 |
  | next expo supabase | 280 | 4 |
  | expo supabase starter | 105 | 7 |
  | react native supabase starter | 49 | not matched |
  | nextjs expo supabase boilerplate, template | 4, 12 | not matched |
  | agent harness; claude code hooks; harness engineering | thousands each | absent |

- **Topics.** Twenty at most; topic pages sort by stars and show 20 before "Load more". The
  repository is 10th on `pgtap`; `claude-code-hooks`, `quality-gates`, `row-level-security` and
  `ai-guardrails` reach page one at 16 to 38 stars. Report 04's set drops `expo-router`,
  `postgres` and `scaffolding` and adds `harness-engineering`, `boilerplate`, `template` and
  `ai-guardrails`.
- **The About description** is searched by default and fills the page `<title>`, the meta
  description and `og:description`; keep it near 160 characters. The homepage link is `nofollow`.
- **Keep the template flag off.** A template copy bypasses `init`'s questions and `update`; mark
  the example project (#164) as a template instead.
- **Releases** are titled with the bare tag (`release.yml:113`), so release pages spend their
  titles on version numbers. The organisation pins nothing; the community profile lacks
  SUPPORT.md.

## npm

- **Search is a text match** on title, description, README and keywords
  ([docs](https://docs.npmjs.com/searching-for-and-choosing-packages-to-download)). The old
  quality, popularity and maintenance weights do nothing: all 3,382 results from 15 queries report
  them as 1. The package name dominates: 1st for "next expo supabase", 3rd for "expo supabase",
  63rd for "claude code hooks", 269th for "agent harness", outside the top 1,000 for "claude code".
- **Keywords act as tags.** Small tags show the package (`pgtap` 2nd of 6); large ones never do.
- **The README renders through GitHub's API, and relative links resolve to the default branch**,
  not the published tag (indicated by npm's archived renderer and npmx's tests; the live page was
  unreachable†). A file move breaks the frozen README of every published version.
- **The install box is a trap.** `npm i` writes `package-lock.json`, and `init` then refuses,
  because the scaffold requires pnpm.
- **Hygiene.** `0.0.0-stage`, a staged-publishing placeholder, is public and not deprecated;
  versions 1.0.4 to 2.0.3 point at the previous owner path; nothing is deprecated although 2.0.8
  is a security patch; there is one maintainer; the package unpacks to 11.8 MB.
- **A `create-…` alias is deferred.** The name already wins, and an alias costs a first publish
  without OIDC, a second trusted publisher and a typosquat target. If wanted later, copy Nuxt: an
  exactly pinned alias published in lockstep.

## Docs site

- **A GitHub Pages project path limits what can be set.** No response headers; `robots.txt` is
  read only at the host root ([RFC 9309](https://datatracker.ietf.org/doc/html/rfc9309)); Google
  takes favicons and site names per hostname†; Lighthouse looks for `llms.txt` only at the origin
  root. Search Console works as a URL-prefix property verified by a meta tag; Bing can import it;
  IndexNow accepts a key in a subdirectory ([IndexNow](https://www.indexnow.org/documentation)).
  Creating `cogvera-labs.github.io` gives a root `robots.txt` with a `Sitemap:` line; only a
  project subdomain lifts every limit.
- **Structured data is hygiene, not a lever.** FAQ rich results have been limited to government
  and health sites since August 2023†, and software rich results need ratings this project cannot
  honestly supply†.
- **Core Web Vitals are fine in the lab** (Lighthouse 13.6.0, mobile): performance 100 on the
  home page, 80 on the 843 KB upgrade runbook.
- **The weakness is the words.** At the deployed commit the home `<title>` is
  "next-expo-supabase-agent-harness documentation" and its description sells the docs, not the
  product; 35 of 50 titles exceed 60 characters; 44 of 50 descriptions are cut mid-sentence; no
  title contains "Claude". There is no search-console verification, no sitemap `lastmod`, and
  nothing links to `llms.txt`.
- **Google's AI features draw on its normal index**†. `llms.txt` is an informal proposal
  ([v2, 2026-08-10](https://github.com/AnswerDotAI/llms-txt/blob/main/nbs/index.qmd)) that Google
  says it does not use†: cheap to keep, no ranking effect. In the
  [GEO paper](https://arxiv.org/abs/2311.09735), a 2024 lab benchmark, citations, quotations and
  statistics raised visibility; keyword stuffing did not.

## The Claude Code ecosystem

- **One-step install** from Claude Code v2.1.292:
  `claude plugin install <name> --marketplace <owner/repo>`
  ([install](https://code.claude.com/docs/en/plugins/install.md)).
- **Anthropic's directory** (`claude.ai/directory/manage`) feeds the read-only
  [claude-plugins-community](https://github.com/anthropics/claude-plugins-community) marketplace
  (2,283 entries) and Discover in claude.ai and Cowork; `claude-plugins-official` takes no
  submissions. The rewritten
  [checklist](https://claude.com/docs/plugins/pre-submission-checklist) holds, rather than
  refuses, more than 512 files, a non-image file over 256 KiB, or a name matching a known brand.
- **Context cost is visible.** This plugin adds about 2,778 always-on tokens (`claude plugin
  details`, local run); the official marketplace highlights 2,000 or more.
- **The skills are not portable yet.** All three use `argument-hint`, which the Agent Skills
  validator and claude.ai uploads reject
  ([spec](https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx)). A
  `skills.sh.json` with `"paths": ["./plugin/skills"]` would let `npx skills add` find them;
  [Context7](https://github.com/upstash/context7) lets anyone add a library and the owner claim it
  with `context7.json`.
- **Claude Code reads `AGENTS.md`** from v2.1.277, but only when no `CLAUDE.md` exists there or
  above, and it loads subdirectory memory on demand only from `CLAUDE.md`
  ([memory](https://code.claude.com/docs/en/memory.md)). A scaffold's nested `AGENTS.md` files
  under `supabase/` and `packages/` therefore never load in the default mode.
- **Agent Plugins 1.0** is a cross-vendor format without Anthropic on its committee
  ([spec](https://github.com/agentplugins/agent-plugins-spec)); VS Code and Copilot CLI already
  read Claude-format marketplaces.

## Launch channels

- **The 2026 climate is closing to AI-built work.** Show HN asks for non-trivial projects, not
  "quickly-generated one-offs"†; HN's guidelines added "Don't post generated/AI-edited comments"†;
  Lobsters bars self-promotion in a member's first 70 days and flags content "created without
  meaningful human authorship"
  ([source](https://github.com/lobsters/lobsters/blob/28bc8d6/app/views/about/about.html.erb));
  r/opensource has barred projects that use or are made by AI since 2026-10-24†; r/programming
  made most AI content off-topic†. So: state the authorship numbers up front, evidence before
  claims, and every word posted to HN, Lobsters and Reddit written by a person.
- **Expectations.** The median Show HN scores 2 points; among top posts, each upvote brought
  about 1.4 stars within 48 hours†
  ([analysis](https://danfking.github.io/blog/2026/04/23/show-hn-by-the-numbers/)). A Show HN is a
  day, not a strategy.
- **Lists.** [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code/blob/main/CONTRIBUTING.md)
  takes one resource at a time through a web form filed by a human, "not a sales pitch", no
  emojis; the project is eligible now. The two awesome-harness-engineering lists take pull
  requests with the affiliation disclosed;
  [awesome-agent-harness](https://github.com/Picrew/awesome-agent-harness) takes a YAML entry.
- **Assets first:** the public example project (#164); a recording of a real session in which an
  RLS test goes red and the agent fixes it; the FAQ, comparison and evidence pages; #170 results
  or an explicit "not measured yet".
- **Sequence.** Build those through mid-January 2027, avoiding US Thanksgiving and the December
  holidays. Launch in the second half of January: Show HN; the essay on the docs site with
  canonical cross-posts on dev.to and Hashnode; r/ClaudeCode and r/ClaudeAI; newsletter pitches
  (This Week in React, Changelog News; the others unverified†); r/Supabase with an RLS-testing
  write-up; the showcase threads of r/reactnative and r/nextjs.

## Measuring it again

Re-run in 90 days: the GitHub search and topic positions above; visitors and referrers (GitHub
keeps 14 days, so record weekly during a launch, and keep them out of the public record); the
18 generic web queries and Search Console's indexed pages; npm positions and dependents.
