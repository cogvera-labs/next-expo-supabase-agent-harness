# Getting started

Go from an empty folder to a Next.js and Expo monorepo on Supabase whose first Claude Code
turn ends with every check green.

This page is the tutorial. The [CLI reference](cli.md) lists every command and flag, and
[How it works](how-it-works.md) explains what the hooks and gates do. Words the project uses
in a specific sense are defined in the [glossary](glossary.md).

## What you need

- **Node 22 or newer.**
- **pnpm 11.** If you do not have it, `corepack enable` provides the exact version the
  scaffold pins in its `packageManager` field. If `corepack` is not on your PATH (Node.js 25
  and later no longer bundle it), run `npm install -g corepack` first.
- **Docker, running.** `pnpm db:up` starts the local Supabase stack in containers, and the
  row-level security tests that run at the end of every turn need it.
- **Git.**
- **Claude Code** (the `claude` command). Its hooks are what send the agent back to work while
  a check fails. Keep it at or above the version that the scaffold's
  [`tools/cc-floor.json`](../template/base/tools/cc-floor.json) requires; that floor is
  derived from the published advisories the file records.
- **Optional: the `gitleaks` binary.** Without it the pre-commit secrets scan prints a skip
  notice. The `secrets` gate inside `pnpm validate` runs either way.

CI proves the scaffold on Linux, and on macOS without the database gates. No CI lane runs a
scaffold on Windows; see
[Does it work on Windows or macOS?](faq.md#does-it-work-on-windows-or-macos)

## Create the project and run the first turn

Run these commands in order. It is the order the harness tests, and each step needs the one
before it.

```sh
mkdir my-app && cd my-app
npx --yes next-expo-supabase-agent-harness@latest init
git init          # before pnpm install: the prepare script (lefthook install) needs a repository
pnpm install
git add -A && git commit -m "chore: scaffold"   # the first commit must include pnpm-lock.yaml
pnpm db:up        # with Docker running; the first run downloads the Supabase images
pnpm validate
claude            # Claude Code: ask for one small change
```

> **A project made with 2.0.8 or earlier.** Those releases let an install resolve
> typescript-eslint 8.73.0, which crashes the `lint` gate with
> `RangeError: Maximum call stack size exceeded`, and expo-sqlite 57.0.5, whose prebuilt
> Android library supports arm64 only: on an x86_64 emulator or a 32-bit device the app's
> saved theme and locale do not load. 2.0.9 pins both in a new project's catalog. In an
> earlier one, set `typescript-eslint: 8.72.2` and `expo-sqlite: 57.0.4` under `catalog:` in
> `pnpm-workspace.yaml`, run `pnpm install` and commit the new `pnpm-lock.yaml`; `update`
> does not change a project's catalog. The
> [upgrade runbook](../template/base/docs/runbooks/harness-upgrade.md) has the steps under
> 2.0.9.

> **A project made with 2.0.9 or earlier, and its Android build.** No package in the project
> declares react-native-reanimated: it arrives as a peer of react-native-css-interop, which
> NativeWind brings, so an install takes the newest release. 4.8.0 supports React Native 0.87
> to 0.89, and the project is on 0.86, so the Android build stops with
> `Your installed version of React Native (0.86.2) is not compatible with installed version of
> Reanimated (4.8.0)`. The gates do not build the native app, so `pnpm validate` stays green.
> Check what your lockfile holds:
>
> ```sh
> grep -nE 'react-native-reanimated@4\.8\.|react-native-worklets@0\.14\.' pnpm-lock.yaml
> ```
>
> No output means it holds an earlier pair, and nothing changes until the lockfile is
> resolved again. Either way, add this to `pnpm-workspace.yaml` above `catalog:`, run
> `pnpm install` and commit the new `pnpm-lock.yaml`; `update` does not change that file.
>
> ```yaml
> overrides:
>   react-native-reanimated: 4.7.2
>   react-native-worklets: 0.13.1
> ```

**Use `npx` or a global install, never a local `npm i`.** A local
`npm i next-expo-supabase-agent-harness` in the project folder writes a `package-lock.json`,
and `init` refuses to run in a folder that has one, because the harness requires pnpm. To
install the CLI once instead, run `npm i -g next-expo-supabase-agent-harness` and then
`next-expo-supabase-agent-harness init`. A global install stays at the version you installed,
so run `npm i -g next-expo-supabase-agent-harness@latest` before an `update`: `update` refuses
to run from a CLI older than the project.

What each step does:

1. **`init`** asks for the project's details before it writes anything: its name, its package
   name, the app identifier, the Supabase project ref, the GitHub owner and a few more. Each
   question shows a default in brackets that Enter accepts, and `init --yes` accepts them all.
   The scaffold is written into the current folder. The CLI reference lists every
   [placeholder](cli.md#placeholders). To pin a release, put a version number from the
   [Releases](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/releases) page
   (the tag without its `v`) in place of `latest`.
2. **`git init`** comes before the install because the scaffold's `prepare` script installs
   the lefthook commit hooks, and they need a repository.
3. **`pnpm install`** installs the workspace and, through `prepare`, the commit hooks.
4. **The first commit** must include `pnpm-lock.yaml`. The shipped workflows install with
   `--frozen-lockfile`, which fails without it, and the `version-sync` gate fails on a missing
   lockfile. The commit hooks run on this commit: Biome on the staged files, gitleaks if it is
   installed, and commitlint on the message.
5. **`pnpm db:up`** runs `supabase start`, which applies the migrations to a local database.
   [Local development](../template/base/docs/runbooks/local-development.md) lists what it
   starts and on which ports.
6. **`pnpm validate`** runs the validate chain, the ordered list of
   [gates](glossary.md#gate) that CI also runs. A gate whose prerequisite is missing on your
   machine prints `SKIPPED` and still fails closed in CI: a skip is not a pass.
7. **`claude`** opens Claude Code in the folder. Ask for one small change.

## What the first turn looks like

When the agent tries to end its turn, the [Stop hook](glossary.md#stop-hook-and-stop-chain)
runs the Stop chain: the validate gates, the RLS isolation suites against your local
database, both unit suites with coverage, and the checks after them. While any step fails,
it sends the agent back to work with that step's output. `pnpm validate` does not run the RLS
suites, so a green `pnpm validate` alone does not mean the turn can end.

On a clean scaffold with the stack running, every step is green. Depending on the change, the
turn may also need per-file coverage for each changed source file and passing verdicts from
reviewer subagents: `torvalds-reviewer` and `citation-verifier` are owed on every non-empty
diff, and the other reviewers when the diff touches their paths. That diff is taken against
the branch's upstream, so until the repository has one, the reviewer step prints a NOTE
instead of judging. Some steps print NOTE lines on a new scaffold; they do not fail the turn.

If the stack is not running, the RLS step fails closed and tells the agent to run
`pnpm db:up`, which the shipped settings let it run without asking. Without Docker that
cannot succeed, so the turn ends red at Claude Code's [block cap](glossary.md#block-cap), and
the harness records it.

The [first-run runbook](../template/base/docs/runbooks/first-run.md) shows the exact
messages for both cases and what the next turn reports.

## Run the apps

Copy `.env.example` to `.env` in the project root and fill in the local values. Both dev
servers read that one file: `apps/web/next.config.ts` loads it for the web app, and
`apps/mobile/metro.config.js` loads its `EXPO_PUBLIC_` names for the mobile app. A variable
set in your shell, or an env file in `apps/web` or `apps/mobile`, takes precedence over it.

- **The web app** needs every name in blocks (a) and (b) of the example file:
  `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE` and `NEXT_PUBLIC_WEB_ORIGIN`. It checks them on the
  first request and answers 500 until all are set; the dev server's log names the ones
  that are missing. `pnpm db:up` prints the URL and both keys, and the comment above each
  name in the example file gives its local default.
- **The mobile app** needs `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE`
  from block (c). `EXPO_PUBLIC_WEB_ORIGIN` may stay empty: the app then calls the origin
  committed in `app.config.ts`.
- **Block (d)**, the Upstash pair, ships commented out. Leave it that way unless you use
  Upstash: the web app's API answers 500 when one of the two names is set but empty.

Then start the web app with `pnpm dev:web`, which also serves the tRPC API the mobile app
calls, and the mobile app with `pnpm dev:mobile`. Neither dev server watches the root file,
so restart it after you change a value.
[Local development](../template/base/docs/runbooks/local-development.md) explains the order
and how a phone reaches your machine.

## Next steps

### Protect `main`

Push the project to GitHub and add a ruleset on `main` that requires a pull request and the
`quality-gate` workflow's `gate-summary` check, which fails when any lane it waits for fails
(GitHub lists it as `gate-summary (mark THIS one required)`). For the CODEOWNERS sign-off
these docs describe, also require review from code owners, and check that
`.github/CODEOWNERS` names real accounts: `init` ran before the folder had a git remote, so
unless you typed your own account, it names the placeholder `@your-github-owner`. Without
these settings, CI reports but does not block.

### Build a feature

Ask Claude Code for a feature, or run `/new-feature <name>` in a session. The command follows
the vertical-slice recipe in one turn: the migration and its row-level security, the RLS
tests, the data function, the tRPC procedure (and a web Server Action), the web screen, the
mobile screen, tests and provenance, ending on a green gate. It hands the migration, the data
layer and the tests to author subagents. For a change that touches auth, row-level security,
migrations, the native config or the API contract, the project's instructions ask for a spec
first, in `specs/<feature>.md`, signed off by a person. See the scaffold's
[`AGENTS.md`](../template/base/AGENTS.md) and the
[vertical-slice skill](../template/base/.claude/skills/authoring-vertical-slice/SKILL.md).

### Start from a worked example instead

Run `init --with-demo` in place of `init` in an empty folder. It adds one feature end to end
on both apps: the `@app/notes` vertical, its screens, routes and migrations, and its rows in
the registers. `eject` takes it out again; the [CLI reference](cli.md#eject) explains how.

### Keep the harness current

Commit your work, then run `npx --yes next-expo-supabase-agent-harness@latest update --dry-run`
to see what would change, and the same command without `--dry-run` to apply it. Harness-owned
files that still match their record are replaced. A file you changed is kept, and the
incoming version is parked under `.harness/pending/` for you to merge. `update --rollback`
restores the tree from before the last update. A new gate can arrive as NOTE lines with a
deadline, a [ramp](glossary.md#ramp), instead of failing on the day you update. See
[`update`](cli.md#update) and the
[upgrade runbook](../template/base/docs/runbooks/harness-upgrade.md).

### Use the agents in other repositories

The harness's agents, slash commands and skills also come as a Claude Code plugin, for
sessions in projects the harness did not install. Add its marketplace with
`claude plugin marketplace add cogvera-labs/next-expo-supabase-agent-harness`, then run
`claude plugin install next-expo-supabase-agent-harness@next-expo-supabase-agent-harness`.
The plugin carries no hooks, gates or permission rules, and inside a harness-installed project
you do not need it. See the [plugin README](../plugin/README.md).

### Choose what else to install

`init --tier core|standard|strict` chooses which opt-in modules come with the scaffold, and
`enable <module>` and `disable <module>` change them later. See [Tiers](cli.md#tiers) and
[Modules](cli.md#modules).

### Read further

- [How it works](how-it-works.md): each enforcement layer, what it binds and what it cannot.
- [FAQ](faq.md): the questions people ask most, with the doc behind each answer.
- [Comparison](comparison.md): other starters and agent tools, and when to choose them.
- [Glossary](glossary.md): the project's terms.
