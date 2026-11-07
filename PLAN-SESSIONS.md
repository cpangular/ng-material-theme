# Session prompts and settings for PLAN.md

One session per row. Open a new chat, set the three controls at the bottom of the prompt box, paste the prompt. Each session ends with a commit at the phase's "Done when", so a bad session reverts as a unit.

How to set things in the VS Code extension (Claude Code chat panel):

- **New session**: Command Palette → "Claude Code: Open in New Tab" (or Ctrl+Shift+Esc).
- **Model and effort**: click the model name at the bottom of the prompt box. Pick Fable 5.1, then set the Effort row in the same picker. (Typing `/model` opens the same picker.)
- **Permission mode**: click the mode indicator at the bottom of the prompt box. "Manual" asks before edits and commands, "Edit automatically" applies file edits without asking.
- **Ultracode**: nothing to toggle. The word `ultracode` is already in the prompts that need it, and that starts a workflow for that task. If you want it for a whole session instead, there is an Ultracode switch under the Effort row in the model picker.
- Fast mode does not apply: it is an Opus-only feature and these sessions use Fable.

| # | Session | Model | Effort | Permission mode |
|---|---------|-------|--------|-----------------|
| 1 | Phase 0 housekeeping | Fable 5.1 | medium | Manual |
| 2 | Phase 1 colour system | Fable 5.1 | high | Edit automatically |
| 3 | Phase 1 verification (ultracode) | Fable 5.1 | high | Manual |
| 4 | Phase 2 register inputs only | Fable 5.1 | high | Edit automatically |
| 5 | Docs mechanics + chapters 1–11 | Fable 5.1 | high | Edit automatically |
| 6 | Docs order review (ultracode) | Fable 5.1 | high | Manual |
| 7 | Phase 4 runtime + chapters 12–14 | Fable 5.1 | high | Edit automatically |
| 8 | Phase 3 adapter + chapter 15 | Fable 5.1 | high | Edit automatically |
| 9 | Phase 6 release | Fable 5.1 | medium | Manual |

Subagent models are chosen inside the workflow prompts: Opus at high effort for critique and synthesis, Sonnet at medium for reading and sweeps. You do not set these.

---

## Session 1 — Phase 0 housekeeping

```
Read PLAN.md and execute Phase 0 exactly as written. Before deleting anything, list what you will delete and wait for my ok. Then: add the library package.json with build/watch/test/exports, untrack dist folders, wire every consumer to the library with workspace:*, fix the browser baseline text. Finish by running `pnpm install && pnpm build` from a clean state and showing me `git status`. Commit when the Done-when holds, with a message that lists what was removed.
```

## Session 2 — Phase 1 colour system

```
Read PLAN.md. Execute Phase 1 in this order: cascade and inheritance rules for core(), single default, surface roles via tone(), contrast from WCAG luminance, remove library-level Material aliases, delete dead code. Work one bullet at a time and compile with sass after each. Write the Verification scripts 1 to 4 as you go (pnpm test in the library package) so the Done-when is executable, not eyeballed. When all bullets are done, build the demo and tell me which surfaces to look at in light and dark. Commit when pnpm test passes.
```

## Session 3 — Phase 1 verification (ultracode)

```
ultracode. Read PLAN.md Phase 1 and the diff of the last commit. Run a workflow with Opus critics at high effort to try to refute each of these claims against the actual compiled core.css: (1) a nested [theme] that sets only primary inherits error and tuning from its parent and re-derives secondary/tertiary/neutral; (2) a user :root rule placed before core.css still wins; (3) every surface role is defined by core.css alone and on-surface vs surface passes 4.5:1 for the contrast sweep; (4) no joined light-dark-valued token is a relative-colour origin. Report only confirmed defects with a reproduction, fix them, and commit.
```

## Session 4 — Phase 2 register inputs only

```
Read PLAN.md Phase 2. Reduce @property registration to the twelve colour inputs plus the theme-level tuning variables, all inherits: true with the defaults as initial values. Emit --theme--animatable. Print before and after @property count and gzipped size and put both in the commit message. Build the demo and give me a one-file crossfade test page (two themes, a gradient, a shadow, a nested [theme]) that I can open in Chrome, Firefox and Safari; tell me exactly what should animate and what should snap. When I confirm it works, say so and I will send a second message reading: "ultracode: run one Opus refute pass over the claim that color-scheme on an element without a theme attribute now flips its subtree, then commit."
```

## Session 5 — Docs mechanics + chapters 1–11

```
Read PLAN.md Phase 5. Build projects/docs: build.mjs with include expansion, iframe examples, Sass for example .scss files, the generated Reference page, and the chapter-order pattern check that fails the build. Then write chapters 1 to 11 in order. For each chapter: the example page first, then the prose, then confirm the example uses only what earlier chapters introduced. Keep prose short and example-led. Follow the writing rules in PLAN.md. Stop after chapter 11, run the build, and show me the site locally. Commit.
```

## Session 6 — Docs order review (ultracode)

```
ultracode. Read PLAN.md Phase 5 and projects/docs/src. Run a workflow: one Opus reader (high effort) per chapter 1 to 11, each given only its chapter and the Introduces column of the chapters before it, asked to list every concept, variable, mixin or attribute the chapter uses that was not yet taught, and anything it explains that is not simple. Then one Opus synthesizer merges that into a fix list. Apply the fixes, rebuild, commit.
```

## Session 7 — Phase 4 runtime + chapters 12–14

```
Read PLAN.md Phase 4 and chapters 12 to 14 of Phase 5. Make the four ThemeSwitcher changes, add defineTheme/removeTheme through the CSSOM with CSS.escape and CSS.supports validation, and the three-line head script. Then write chapters 12, 13 and 14 with their examples, including the JSON fixture with one invalid colour. Verify the Phase 4 Done-when in the browser (nested data-driven theme survives reload). Commit.
```

## Session 8 — Phase 3 adapter + chapter 15

```
Read PLAN.md Phase 3 and chapter 15. Replace material-adapter.scss with the Sass-computed version using Material's md-sys-color-values-light/dark functions and the tone() function, emitted under :where(:root, [theme]), with only level0..5 as non-colour tokens. Create projects/material-demo (minimal Angular Material app, workspace:* dependency, styles order core.css, material-adapter.css, mat.theme for typography and density, a nested theme region, themeSwitcher from afterNextRender). Wire docs/build.mjs to copy its build into dist/material and write chapter 15. Then bump Material to 21 and rebuild. Stop before committing and tell me. I will then send: "ultracode: run one Opus pass that checks every --mat-sys-* colour token Material 21 components read is emitted by the adapter, fix gaps, then commit."
```

## Session 9 — Phase 6 release

```
Read PLAN.md Phase 6. Write the short README, the breaking-changes note with the old→new variable table (derive the old names from git history of projects/ng-material-theme/old), and the CI workflow: build, test, publish on tag, deploy docs to GitHub Pages on tag. Show me the workflow file before committing. Do not tag or publish; I will do that.
```
