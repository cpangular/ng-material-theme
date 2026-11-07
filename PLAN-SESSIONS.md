# Session prompts and settings for PLAN.md

One session per row. Open a new chat, set the three controls at the bottom of the prompt box, paste the prompt. Each session ends with a commit at the phase's "Done when", so a bad session reverts as a unit.

**Standing rule for every session: when the Done-when holds, commit and push to `feature/ng21` without asking.** Pushing only refreshes the draft release PR; nothing publishes until that PR is merged by hand. A session that ends with uncommitted or unpushed work is not done. The only things a session never does on its own are merging into `main`, merging the release PR, and running `gitflow version`.

How to set things in the VS Code extension (Claude Code chat panel):

- **New session**: Command Palette → "Claude Code: Open in New Tab" (or Ctrl+Shift+Esc).
- **Model and effort**: click the model name at the bottom of the prompt box. Pick Fable 5.1, then set the Effort row in the same picker. (Typing `/model` opens the same picker.)
- **Permission mode**: click the mode indicator at the bottom of the prompt box and pick **Auto** for every session. The prompts themselves say where to stop and wait (the delete list in session 1, the release steps in session 9), which is enough; Manual mode only adds a prompt per command.
- **Ultracode**: nothing to toggle. The word `ultracode` is already in the prompts that need it, and that starts a workflow for that task. If you want it for a whole session instead, there is an Ultracode switch under the Effort row in the model picker.
- Fast mode does not apply: it is an Opus-only feature and these sessions use Fable.

| # | Session | Model | Effort | Permission mode |
|---|---------|-------|--------|-----------------|
| 1 | Phase 0 housekeeping | Fable 5.1 | medium | Auto |
| 2 | Phase 1 colour system | Fable 5.1 | high | Auto |
| 3 | Phase 1 verification (ultracode) | Fable 5.1 | high | Auto |
| 4 | Phase 2 register inputs only | Fable 5.1 | high | Auto |
| 5 | Docs mechanics + chapters 1–11 | Fable 5.1 | high | Auto |
| 6 | Docs order review (ultracode) | Fable 5.1 | high | Auto |
| 7 | Phase 4 runtime + chapters 12–14 | Fable 5.1 | high | Auto |
| 8 | Phase 3 adapter + chapter 15 | Fable 5.1 | high | Auto |
| 9 | Phase 6 release | Fable 5.1 | medium | Auto |

Subagent models are chosen inside the workflow prompts: Opus at high effort for critique and synthesis, Sonnet at medium for reading and sweeps. You do not set these.

---

## Session 1 — Phase 0 housekeeping (done, verified 2026-11-07)

```
Read PLAN.md, including the "Release management: cpdevtools/git-flow" section, and execute Phase 0 exactly as written. Before deleting or renaming anything, list what you will delete (old Angular workspace files, old library, old .github actions and workflows) and the branch rename ng21 -> feature/ng21, and wait for my ok. Then set up the git-flow workspace from https://github.com/cpdevtools/git-flow-template (read its README and copy its root package.json, .publish/*, .syncpackrc.yml and the five workflows, replacing the placeholders with @cpangular / cpangular / ng-material-theme), add the library package.json with the github.actions.* scripts and release-artifacts.yml, untrack dist folders, wire every consumer with workspace:*, fix the browser baseline text. Finish by running `pnpm install && pnpm build` from a clean state and showing me `git status`. When the Done-when holds, commit with a message that lists what was removed, and push without asking. Then push and tell me whether git-flow opened the draft release PR and whether the Test workflow is green; fix anything red.
```

## Session 2 — Phase 1 colour system

```
Read PLAN.md. Execute Phase 1 in this order: cascade and inheritance rules for core(), single default, surface roles via tone(), contrast from WCAG luminance, remove library-level Material aliases, delete dead code. Work one bullet at a time and compile with sass after each. Write the Verification scripts 1 to 4 as you go (pnpm test in the library package) so the Done-when is executable, not eyeballed. When all bullets are done, build the demo and tell me which surfaces to look at in light and dark. When pnpm test passes, commit and push without asking.
```

## Session 3 — Phase 1 verification (ultracode)

```
ultracode. Read PLAN.md Phase 1 and the Phase 1 diff (`git diff 140fb11..HEAD -- projects/`). Run a workflow with Opus critics at high effort to try to refute each of these claims against the actual compiled core.css: (1) a nested [theme] that sets only primary inherits error and tuning from its parent and re-derives secondary/tertiary/neutral; (2) a user :root rule placed before core.css still wins; (3) every surface role is defined by core.css alone and on-surface vs surface passes 4.5:1 for the contrast sweep; (4) no joined light-dark-valued token is a relative-colour origin. Report only confirmed defects with a reproduction, fix them, then commit and push without asking.
```

## Session 4 — Phase 2 register inputs only

```
Read PLAN.md Phase 2. Reduce @property registration to the twelve colour inputs plus the theme-level tuning variables, all inherits: true with the defaults as initial values. Emit --theme--animatable. Print before and after @property count and gzipped size and put both in the commit message. Build the demo and give me a one-file crossfade test page (two themes, a gradient, a shadow, a nested [theme]) that I can open in Chrome, Firefox and Safari; tell me exactly what should animate and what should snap. When I confirm it works, say so and I will send a second message reading: "ultracode: run one Opus refute pass over the claim that color-scheme on an element without a theme attribute now flips its subtree, then commit and push."
```

## Session 5 — Docs mechanics + chapters 1–11

```
Read PLAN.md Phase 5. Build projects/docs: build.ts with include expansion, iframe examples, Sass for example .scss files, the generated Reference page, and the chapter-order pattern check that fails the build. Then write chapters 1 to 11 in order. For each chapter: the example page first, then the prose, then confirm the example uses only what earlier chapters introduced. Keep prose short and example-led. Follow the writing rules in PLAN.md. Stop after chapter 11, run the build, commit and push without asking, then tell me how to view the site locally.
```

## Session 6 — Docs order review (ultracode)

```
ultracode. Read PLAN.md Phase 5 and projects/docs/src. First run `pnpm --filter @cpangular/docs run check:browser` and fix every label below 4.5:1 that is not a disabled or tint swatch by using `--contrast--high` for body text on coloured boxes (tint and disabled swatches may stay as they are; say so in the chapter). Then run a workflow: one Opus reader (high effort) per chapter 1 to 11, each given only its chapter and the Introduces column of the chapters before it, asked to list every concept, variable, mixin or attribute the chapter uses that was not yet taught, and anything it explains that is not simple. Then one Opus synthesizer merges that into a fix list. Apply the fixes, rebuild, then commit and push without asking.
```

## Session 7 — Phase 4 runtime + chapters 12–14

```
Read PLAN.md Phase 4 and chapters 12 to 14 of Phase 5. Make the four ThemeSwitcher changes, add defineTheme/removeTheme through the CSSOM with CSS.escape and CSS.supports validation, and the three-line head script. Then write chapters 12, 13 and 14 with their examples, including the JSON fixture with one invalid colour. Chapter 13's example is the crossfade page from commit 9a4f6e7 (projects/simple-theming-demo/src/crossfade.html in history), rebuilt as a docs example; when it is in, tell me what to open in Chrome, Firefox and Safari and what should animate versus snap, because that three-browser check is Phase 2's outstanding Done-when item. Verify the Phase 4 Done-when in the browser (nested data-driven theme survives reload), then commit and push without asking.
```

## Session 8 — Phase 3 adapter + chapter 15

```
Read PLAN.md Phase 3 and chapter 15. Replace material-adapter.scss with the Sass-computed version using Material's md-sys-color-values-light/dark functions and the tone() function, emitted under :where(:root, [theme]), with only level0..5 as non-colour tokens. Create projects/material-demo (minimal Angular Material app, workspace:* dependency, styles order core.css, material-adapter.css, mat.theme for typography and density, a nested theme region, themeSwitcher from afterNextRender). Wire docs/build.ts to copy its build into dist/material and write chapter 15. Then bump Material to 21 and rebuild. Stop before committing and tell me. I will then send: "ultracode: run one Opus pass that checks every --mat-sys-* colour token Material 21 components read is emitted by the adapter, fix gaps, then commit and push."
```

## Session 9 — Phase 6 release

```
Read PLAN.md Phase 6 and the "Release management" section. Write the short README, the breaking-changes note with the old->new variable table (derive the old names from git history of projects/ng-material-theme/old), and docs-pages.yml (build projects/docs and deploy to GitHub Pages on push to release/main). Commit and push the README, the note and the workflow without asking. Then give me the exact graduation commands from the plan to run by hand; do not merge into main, do not run gitflow version, and do not merge the release PR yourself.
```
