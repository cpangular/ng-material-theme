// Site chrome: the theme select and the colour-scheme buttons in the header,
// plus iframe housekeeping. This is site code, not an example; the chapters'
// rules (no JavaScript before chapter 12) apply to example sources only.
import { themeSwitcher } from "@cpangular/ng-material-theme/theme-switcher";

const select = document.querySelector<HTMLSelectElement>("#site-theme")!;
const buttons = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-scheme]"),
];
const iframes = () => [
  ...document.querySelectorAll<HTMLIFrameElement>(".example iframe"),
];

// Themes come from chrome.css; the switcher discovers every [theme="x"] rule.
// localStorage is per origin, so the examples (same origin, own documents)
// share the stored choice with the site. A stored name this page has no rule
// for still gets an option, so the select never shows a blank.
themeSwitcher.onChange((themes, current) => {
  select.replaceChildren(
    new Option("(library default)", ""),
    ...themes.map((t) => new Option(t, t)),
  );
  if (current && !themes.includes(current))
    select.add(new Option(`${current} (no rule on this page)`, current));
  select.value = current ?? "";
});
select.addEventListener("change", () =>
  themeSwitcher.setTheme(select.value || null),
);

for (const b of buttons)
  b.addEventListener("click", () =>
    themeSwitcher.setColorScheme(b.dataset.scheme as "light" | "dark" | "auto"),
  );

// Examples are separate documents, so the site's mode is mirrored onto each
// example's root; an example that sets color-scheme on its own elements
// keeps them (chapter 2).
const mirror = (frame: HTMLIFrameElement, mode: string) => {
  const doc = frame.contentDocument;
  if (doc?.documentElement)
    doc.documentElement.style.colorScheme = mode === "auto" ? "" : mode;
};
themeSwitcher.onColorSchemeChange((mode) => {
  for (const b of buttons)
    b.setAttribute("aria-pressed", String(b.dataset.scheme === mode));
  for (const f of iframes()) mirror(f, mode);
});

// Size each iframe to its content once it has loaded.
const fit = (frame: HTMLIFrameElement) => {
  const doc = frame.contentDocument;
  if (!doc?.documentElement) return;
  frame.style.height = `${doc.documentElement.scrollHeight + 2}px`;
};
for (const f of iframes()) {
  f.addEventListener("load", () => {
    mirror(f, themeSwitcher.getCurrentColorScheme());
    fit(f);
    f.contentWindow?.addEventListener("resize", () => fit(f));
  });
}
window.addEventListener("resize", () => iframes().forEach(fit));
