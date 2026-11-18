# template/

What `init` writes into a project, and the data the installer reads to upgrade one. This
README is not installed: the installer walks the layers below, never the files beside them.
It does ship in the npm package, which carries this whole folder.

A path in the shipped docs, such as `tools/check-secrets.mjs`, is an install path: where the
file lands in a project. Here the same file is
[`base/tools/check-secrets.mjs`](base/tools/check-secrets.mjs).

## The layers

| Layer | What it holds | Installed by |
|---|---|---|
| [`base/`](base/) | The harness: gates and registers in `tools/`; hooks, agents, commands, rules and skills in `.claude/`; workflows in `github/`; the docs in `docs/`; the root configs and `AGENTS.md` | every `init` |
| [`stack/`](stack/) | The reference app: `apps/web`, `apps/mobile`, `packages/`, `supabase/` | every `init` |
| [`presets/<name>/`](presets/) | An alternative design-token set for the stack | `init --set DESIGN_TOKENS=<preset>` (`metal` is `presets/tokens-metal/`) |
| [`demo/`](demo/) | The worked example: the notes vertical, its screens, routes and migrations, and its rows in the seeded registers | `init --with-demo`; `eject` takes it out |
| [`modules/<name>/`](modules/) | Opt-in modules, each a partial tree. A module's guide is `modules/<name>/docs/modules/<name>/README.md` | a tier, `--modules` or `enable`; `disable` removes one |

## How `init` merges them

1. It walks `base/`, then `stack/` with the chosen preset laid over it: a preset file replaces
   the stack file at the same install path, and the preset's other files are added.
2. With `--with-demo`, it lays `demo/` over both the same way. The demo replaces some seeded
   files, such as the API router and several registers, and adds its own.
3. Each chosen module adds its own files.
4. Every file is rendered on the way out. Placeholders are filled from the answers, from the
   closed registry in [installer/lib/placeholders.mjs](../installer/lib/placeholders.mjs);
   stored names become install names (below); binary files are copied byte for byte.
5. Each file's mode and sha256 go into the project's `.harness/manifest.json`.

In an existing repository (a retrofit), `init` skips the stack apart from a few shared package
manifests, and it never overwrites a file: it merges it, or parks the harness's copy. `update`
walks `base/`, the project's modules, the stack and, where the project has it, the demo again;
what it may do to each file depends on the file's mode. The code is
[installer/lib/copy.mjs](../installer/lib/copy.mjs) and
[installer/commands/init.mjs](../installer/commands/init.mjs).

## Owned, seeded and config files

- **owned**: the harness's machinery, which is most of `base/`: hooks, gate scripts,
  workflows, docs. `update` replaces an untouched copy, and parks the incoming one under
  `.harness/pending/` when the project has edited its copy.
- **seeded**: the project's own files: everything under `apps/`, `packages/`, `supabase/` and
  `tests/unit/`, and listed files such as `AGENTS.md`, `package.json` and the reviewed
  registers in `tools/`. `init` writes them, and `update` never overwrites them.
- **config**: `tools/harness.config.mjs`, the chain definition, which `update` changes only
  through recorded steps.

`fileMode` in [installer/lib/manifest.mjs](../installer/lib/manifest.mjs) decides, from
`SEEDED_PREFIXES`, `SEEDED_FILES` and `CONFIG_FILES` in
[installer/lib/layout.mjs](../installer/lib/layout.mjs), where a comment says why each listed
file is seeded. [docs/architecture.md](../docs/architecture.md), "The installer", says what
`update` does with each mode.

## Stored names are not installed names

- A file that installs to a dot-path is stored without the dot at the top of its layer, such
  as `gitignore`, `env.example` and the `github/` folder; `RENAMES` in
  [installer/lib/layout.mjs](../installer/lib/layout.mjs) has the full list. npm's packer drops
  `.gitignore` files and reads a nested one as a list of files to leave out of the package,
  and storing `github/` without its dot keeps the template's workflows out of this
  repository's own Actions. `.claude/` keeps its dot: it survives packing.
- `package.json.tmpl` installs as `package.json`: the `.tmpl` suffix is dropped.
- `storageToInstall` in [installer/lib/copy.mjs](../installer/lib/copy.mjs) is the one function
  that maps a stored path to its install path.

## Installer data, never installed

| Path | What it is | Read by | Written by |
|---|---|---|---|
| [`shas/`](shas/) | One released-sha table per version: for each owned install path, the sha256 of every variant a release, or a `main` commit at that version, shipped; also the escape lists it planted and the demo's files | `update`, `doctor` and `eject`, through [provenance.mjs](../installer/lib/provenance.mjs) | `node scripts/generate-released-shas.mjs --current`, which also writes `base/tools/lib/planted-shas.json`. Tables only grow; never edit one by hand |
| [`migrations.json`](migrations.json) | Per-release records that `update` applies to an older install: removed and renamed paths, injected chain steps, seeded paths withheld from existing installs, catalog pin floors, ramps | `update`, through [migrations.mjs](../installer/lib/migrations.mjs) | the maintainer, at the version bump. Protected: an edit needs `HARNESS_ALLOW_SELF_EDIT=1` |
| [`demo-index.json`](demo-index.json) | The rows the worked example adds to or changes in seeded registers | `eject`, through [demo-rows.mjs](../installer/lib/demo-rows.mjs) | `node scripts/check-demo-index.mjs --write` |

[check-released-shas.mjs](../scripts/check-released-shas.mjs),
[check-seeded-migrations.mjs](../scripts/check-seeded-migrations.mjs) and
[check-demo-index.mjs](../scripts/check-demo-index.mjs) hold the three to the tree.

## Before you edit here

- Nearly every file in a layer ships into projects and is hash-tracked. After an edit, run
  `node scripts/generate-released-shas.mjs --current` and commit what it writes.
- [scripts/hygiene.mjs](../scripts/hygiene.mjs) reads every file in this folder, this one
  included. It fails on the names of the publishing organization and its people, a link to
  this repository or its site, the other harnesses' stack vocabulary, a developer home path,
  anything shaped like a credential, and a double-brace placeholder the registry does not
  list. Shipped docs link relatively.
- A new file in a layer reaches existing projects through `update`. A new seeded one also
  needs a `migrations.json` record (`seedOnInitOnly`) or an entry in
  [check-seeded-migrations.mjs](../scripts/check-seeded-migrations.mjs). Both are protected,
  so adding a file is the maintainer's call.
- Put no README inside a layer, `modules/` or `presets/`. Inside a layer it would be installed
  into projects, and several tools treat every entry of `modules/` and `presets/` as a module
  or a preset.
- The root [AGENTS.md](../AGENTS.md) lists the checks for each kind of change.
