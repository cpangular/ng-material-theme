# ng-material-theme Rewrite Plan

## Overview

Complete rewrite of ng-material-theme library to leverage Angular Material 21's native M3 CSS variable system while maintaining a custom design token layer. The existing codebase serves as reference only.

**Core Concept**: User defines base colors (`--color--primary`, etc.) → Library generates practical variants at runtime using CSS `color-mix()` → Material M3 theme variables reference these via `var()` → Full runtime theme generation with database persistence capability.

**Target**: Modern browsers only (Chrome 111+, Firefox 113+, Safari 16.4+ from March 2023)

---

## Architecture

### Three-Part System

1. **Theme System & Build Time**: SCSS infrastructure for theme definition, CSS variable generation, and build tooling
2. **Runtime Capabilities**: JavaScript APIs for dynamic theme creation, mode switching, persistence
3. **Material Adapter**: Bridge layer mapping custom tokens to Angular Material M3 system tokens

### Light/Dark Mode Strategy

**CSS `light-dark()` with `color-scheme`**: Instead of separate light/dark themes, we use CSS's native `light-dark(light-value, dark-value)` function which automatically picks the right value based on the `color-scheme` property.

**Benefits**:

- Single theme definition supports both modes
- Mode switching is instant (just change `color-scheme`)
- No theme name suffixes needed
- Simpler configuration

**Color values can be**:

- **Single value**: Used in both light and dark modes
  - `primary: '#6200ee'` → `--color--primary: #6200ee;`
- **Array [light, dark]**: Different values per mode
  - `primary: ['#6200ee', '#bb86fc']` → `--color--primary: light-dark(#6200ee, #bb86fc);`

**Mode switching**: Just set `color-scheme: light` or `color-scheme: dark` on the document element, and all `light-dark()` values automatically update.

### Color Variable Structure (OOP-like naming)

**Convention**: Single dash `-` separates words, double dash `--` separates namespaces (like `.` in OOP)

**Base colors** (user-provided):

```scss
--color--primary
--color--secondary
--color--tertiary
--color--neutral
--color--error
// ... plus any custom palettes (not mapped to Material components)
```

**Note**: While Angular Material uses the standard palettes (primary, secondary, tertiary, neutral, error), you can define additional custom palettes. These will have all CSS variables generated but won't be automatically mapped to Material component themes.

### Hierarchical Configuration System

**Theme-level defaults** (set once, apply to all palettes):

```scss
// Theme-wide blend percentages
--theme--blend--darker-2: 80%;
--theme--blend--darker-1: 90%;
--theme--blend--lighter-1: 90%;
--theme--blend--lighter-2: 80%;

// Theme-wide opacity levels (indices 1-7, values are 10/20/30/40/50/70/90%)
--theme--opacity--1: 10%;
--theme--opacity--2: 20%;
--theme--opacity--3: 30%;
--theme--opacity--4: 40%;
--theme--opacity--5: 50%;
--theme--opacity--6: 70%;
--theme--opacity--7: 90%;

// Theme-wide contrast blends
--theme--contrast-blend--emphasized: 100%;
--theme--contrast-blend: 90%;
--theme--contrast-blend--deemphasized: 80%;
--theme--contrast-blend--disabled: 50%;
```

**Per-palette overrides** (optional, for specific palettes):

```scss
// Override variables (when set, take precedence over theme defaults)
--color--primary--blend--darker-1-override: 85%;
--color--primary--opacity--2-override: 25%; // opacity-2 normally 20%, overridden to 25%
--color--primary--contrast-blend-override: 95%;
```

**Computed configuration variables** (with fallback chain):

```scss
// Computed values that fall back to theme defaults
--color--primary--blend--darker-1: var(
  --color--primary--blend--darker-1-override,
  var(--theme--blend--darker-1)
);
--color--primary--opacity--2: var(
  --color--primary--opacity--2-override,
  var(--theme--opacity--2)
);
--color--primary--contrast-blend: var(
  --color--primary--contrast-blend-override,
  var(--theme--contrast-blend)
);
```

**Fallback chain**: `palette-override → theme-default → built-in-default`

This enables DRY configuration: set common values once at theme level, override only where needed per palette.

**Per-palette configuration** (computed with fallback chain):

```scss
// Blend percentages for lighter/darker variants (fallback to theme defaults)
--color--primary--blend--darker-2: var(
  --color--primary--blend--darker-2-override,
  var(--theme--blend--darker-2)
);
--color--primary--blend--darker-1: var(
  --color--primary--blend--darker-1-override,
  var(--theme--blend--darker-1)
);
--color--primary--blend--lighter-1: var(
  --color--primary--blend--lighter-1-override,
  var(--theme--blend--lighter-1)
);
--color--primary--blend--lighter-2: var(
  --color--primary--blend--lighter-2-override,
  var(--theme--blend--lighter-2)
);

// Opacity levels for tints (indices 1-7, fallback to theme defaults)
--color--primary--opacity--1: var(
  --color--primary--opacity--1-override,
  var(--theme--opacity--1)
);
--color--primary--opacity--2: var(
  --color--primary--opacity--2-override,
  var(--theme--opacity--2)
);
--color--primary--opacity--3: var(
  --color--primary--opacity--3-override,
  var(--theme--opacity--3)
);
--color--primary--opacity--4: var(
  --color--primary--opacity--4-override,
  var(--theme--opacity--4)
);
--color--primary--opacity--5: var(
  --color--primary--opacity--5-override,
  var(--theme--opacity--5)
);
--color--primary--opacity--6: var(
  --color--primary--opacity--6-override,
  var(--theme--opacity--6)
);
--color--primary--opacity--7: var(
  --color--primary--opacity--7-override,
  var(--theme--opacity--7)
);

// Contrast blend percentages (fallback to theme defaults)
--color--primary--contrast-blend--emphasized: var(
  --color--primary--contrast-blend--emphasized-override,
  var(--theme--contrast-blend--emphasized)
);
--color--primary--contrast-blend: var(
  --color--primary--contrast-blend-override,
  var(--theme--contrast-blend)
); // default, no suffix
--color--primary--contrast-blend--deemphasized: var(
  --color--primary--contrast-blend--deemphasized-override,
  var(--theme--contrast-blend--deemphasized)
);
--color--primary--contrast-blend--disabled: var(
  --color--primary--contrast-blend--disabled-override,
  var(--theme--contrast-blend--disabled)
);
```

**Generated color variants**:

```scss
// Lighter/Darker (5 levels)
--color--primary-darker-2: color-mix(
    in oklab,
    var(--color--primary) var(--color--primary--blend--darker-2),
    black calc(100% - var(--color--primary--blend--darker-2))
  ) --color--primary-darker-1 --color--primary // base
  --color--primary-lighter-1 --color--primary-lighter-2
  // Mode-relative (inverts in dark mode)
  --color--primary-lower-2 // darker in light mode, lighter in dark mode
  --color--primary-lower-1 --color--primary-higher-1 --color--primary-higher-2
  // Tints (transparent, 7 levels at 10/20/30/40/50/70/90%)
  --color--primary-tint-1: color-mix(
    in oklab,
    var(--color--primary) var(--color--primary--opacity--1),
    transparent calc(100% - var(--color--primary--opacity--1))
  )
  --color--primary-tint-2 // ... through tint-7
  // Contrast colors (auto-calculated base + 4 blended variants)
  --color--primary--contrast--base: black | white // calculated or user override
  --color--primary--contrast--emphasized: color-mix(
    in oklab,
    var(--color--primary--contrast--base) var(
        --color--primary--contrast-blend--emphasized
      ),
    var(--color--primary) calc(
        100% - var(--color--primary--contrast-blend--emphasized)
      )
  )
  --color--primary--contrast // default, no suffix
  --color--primary--contrast--deemphasized --color--primary--contrast--disabled // Each variant gets its own contrast colors too
  --color--primary-darker-1--contrast--base
  --color--primary-darker-1--contrast--emphasized
  --color--primary-darker-1--contrast // default
  --color--primary-darker-1--contrast--deemphasized --color--primary-darker-1--contrast--disabled;
```

**OOP mapping examples**:

- `color.primary` → `--color--primary`
- `color.primary.darker1` → `--color--primary-darker-1`
- `color.primary.opacity2` → `--color--primary--opacity-2` // opacity-2 = 20%
- `color.primary.contrastBlend` → `--color--primary--contrast-blend`
- `color.primary.contrast.base` → `--color--primary--contrast--base`
- `color.primary.darker1.contrast.deemphasized` → `--color--primary-darker-1--contrast--deemphasized`

---

## Part 1: Theme System & Build Time

### Step 1: Create Color Variant Generation System

**File**: `projects/ng-material-theme/theming/_color-variants.scss`

Generate all color variants from base colors using CSS `color-mix()` in OKLab color space.

**Theme-level defaults generation**:

```scss
@mixin generate-theme-defaults($theme-config) {
  // Theme-wide blend percentages
  --theme--blend--darker-2: #{map-get($theme-config, "darker-2", 80%)};
  --theme--blend--darker-1: #{map-get($theme-config, "darker-1", 90%)};
  --theme--blend--lighter-1: #{map-get($theme-config, "lighter-1", 90%)};
  --theme--blend--lighter-2: #{map-get($theme-config, "lighter-2", 80%)};
}

@mixin generate-theme-opacity-defaults($opacity-config) {
  // Theme-wide opacity levels (indices 1-7, values 10/20/30/40/50/70/90%)
  --theme--opacity--1: #{map-get($opacity-config, "opacity1", 10%)};
  --theme--opacity--2: #{map-get($opacity-config, "opacity2", 20%)};
  --theme--opacity--3: #{map-get($opacity-config, "opacity3", 30%)};
  --theme--opacity--4: #{map-get($opacity-config, "opacity4", 40%)};
  --theme--opacity--5: #{map-get($opacity-config, "opacity5", 50%)};
  --theme--opacity--6: #{map-get($opacity-config, "opacity6", 70%)};
  --theme--opacity--7: #{map-get($opacity-config, "opacity7", 90%)};
}

@mixin generate-theme-contrast-blend-defaults($contrast-config) {
  // Theme-wide contrast blend percentages
  --theme--contrast-blend--emphasized: #{map-get(
      $contrast-config,
      "emphasized",
      100%
    )};
  --theme--contrast-blend: #{map-get($contrast-config, "default", 90%)};
  --theme--contrast-blend--deemphasized: #{map-get(
      $contrast-config,
      "deemphasized",
      80%
    )};
  --theme--contrast-blend--disabled: #{map-get(
      $contrast-config,
      "disabled",
      50%
    )};
}
```

**Per-palette override and computed variable generation**:
For each palette (primary, secondary, tertiary, neutral, error, plus any custom palettes), output:

```scss
@mixin generate-palette-config-vars($name, $config) {
  // Generate override variables (only if specified in config)
  @if map-has-key($config, "blend-darker-2") {
    --color--#{$name}--blend--darker-2-override: #{map-get(
        $config,
        "blend-darker-2"
      )};
  }
  @if map-has-key($config, "blend-darker-1") {
    --color--#{$name}--blend--darker-1-override: #{map-get(
        $config,
        "blend-darker-1"
      )};
  }
  @if map-has-key($config, "blend-lighter-1") {
    --color--#{$name}--blend--lighter-1-override: #{map-get(
        $config,
        "blend-lighter-1"
      )};
  }
  @if map-has-key($config, "blend-lighter-2") {
    --color--#{$name}--blend--lighter-2-override: #{map-get(
        $config,
        "blend-lighter-2"
      )};
  }

  // Generate computed variables with fallback chain
  --color--#{$name}--blend--darker-2: var(
    --color--#{$name}--blend--darker-2-override,
    var(--theme--blend--darker-2)
  );
  --color--#{$name}--blend--darker-1: var(
    --color--#{$name}--blend--darker-1-override,
    var(--theme--blend--darker-1)
  );
  --color--#{$name}--blend--lighter-1: var(
    --color--#{$name}--blend--lighter-1-override,
    var(--theme--blend--lighter-1)
  );
  --color--#{$name}--blend--lighter-2: var(
    --color--#{$name}--blend--lighter-2-override,
    var(--theme--blend--lighter-2)
  );

  // Opacity overrides (index-based 1-7, not value-based)
  @each $opacity in (1, 2, 3, 4, 5, 6, 7) {
    @if map-has-key($config, "opacity#{$opacity}") {
      --color--#{$name}--opacity--#{$opacity}-override: #{map-get(
          $config,
          "opacity#{$opacity}"
        )};
    }
    --color--#{$name}--opacity--#{$opacity}: var(
      --color--#{$name}--opacity--#{$opacity}-override,
      var(--theme--opacity--#{$opacity})
    );
  }

  // Contrast blend overrides
  @if map-has-key($config, "contrast-blend-emphasized") {
    --color--#{$name}--contrast-blend--emphasized-override: #{map-get(
        $config,
        "contrast-blend-emphasized"
      )};
  }
  @if map-has-key($config, "contrast-blend") {
    --color--#{$name}--contrast-blend-override: #{map-get(
        $config,
        "contrast-blend"
      )};
  }
  @if map-has-key($config, "contrast-blend-deemphasized") {
    --color--#{$name}--contrast-blend--deemphasized-override: #{map-get(
        $config,
        "contrast-blend-deemphasized"
      )};
  }
  @if map-has-key($config, "contrast-blend-disabled") {
    --color--#{$name}--contrast-blend--disabled-override: #{map-get(
        $config,
        "contrast-blend-disabled"
      )};
  }

  // Computed contrast blend variables with fallback chain
  --color--#{$name}--contrast-blend--emphasized: var(
    --color--#{$name}--contrast-blend--emphasized-override,
    var(--theme--contrast-blend--emphasized)
  );
  --color--#{$name}--contrast-blend: var(
    --color--#{$name}--contrast-blend-override,
    var(--theme--contrast-blend)
  );
  --color--#{$name}--contrast-blend--deemphasized: var(
    --color--#{$name}--contrast-blend--deemphasized-override,
    var(--theme--contrast-blend--deemphasized)
  );
  --color--#{$name}--contrast-blend--disabled: var(
    --color--#{$name}--contrast-blend--disabled-override,
    var(--theme--contrast-blend--disabled)
  );
}
```

**Lighter/Darker variant generation** (references per-palette blend vars):

```scss
@mixin generate-lighter-darker($name) {
  --color--#{$name}-darker-2: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--blend--darker-2),
    black calc(100% - var(--color--#{$name}--blend--darker-2))
  );
  --color--#{$name}-darker-1: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--blend--darker-1),
    black calc(100% - var(--color--#{$name}--blend--darker-1))
  );
  // --color--#{$name} is the base (user sets this)
  --color--#{$name}-lighter-1: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--blend--lighter-1),
    white calc(100% - var(--color--#{$name}--blend--lighter-1))
  );
  --color--#{$name}-lighter-2: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--blend--lighter-2),
    white calc(100% - var(--color--#{$name}--blend--lighter-2))
  );
}
```

**Mode-relative variants** (invert in dark mode):

```scss
@mixin generate-mode-relative($name) {
  // In light mode: lower = darker, higher = lighter
  --color--#{$name}-lower-2: color-mix(
    in oklab,
    var(--color--#{$name}) 80%,
    black 20%
  );
  --color--#{$name}-lower-1: color-mix(
    in oklab,
    var(--color--#{$name}) 90%,
    black 10%
  );
  --color--#{$name}-higher-1: color-mix(
    in oklab,
    var(--color--#{$name}) 90%,
    white 10%
  );
  --color--#{$name}-higher-2: color-mix(
    in oklab,
    var(--color--#{$name}) 80%,
    white 20%
  );
}

@mixin generate-mode-relative-dark($name) {
  // In dark mode: lower = lighter, higher = darker (inverted)
  --color--#{$name}-lower-2: color-mix(
    in oklab,
    var(--color--#{$name}) 80%,
    white 20%
  );
  --color--#{$name}-lower-1: color-mix(
    in oklab,
    var(--color--#{$name}) 90%,
    white 10%
  );
  --color--#{$name}-higher-1: color-mix(
    in oklab,
    var(--color--#{$name}) 90%,
    black 10%
  );
  --color--#{$name}-higher-2: color-mix(
    in oklab,
    var(--color--#{$name}) 80%,
    black 20%
  );
}
```

**Tint generation** (references per-palette opacity vars):

```scss
@mixin generate-tints($name) {
  --color--#{$name}-tint-1: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--opacity--1),
    transparent calc(100% - var(--color--#{$name}--opacity--1))
  );
  --color--#{$name}-tint-2: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--opacity--2),
    transparent calc(100% - var(--color--#{$name}--opacity--2))
  );
  --color--#{$name}-tint-3: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--opacity--3),
    transparent calc(100% - var(--color--#{$name}--opacity--3))
  );
  --color--#{$name}-tint-4: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--opacity--4),
    transparent calc(100% - var(--color--#{$name}--opacity--4))
  );
  --color--#{$name}-tint-5: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--opacity--5),
    transparent calc(100% - var(--color--#{$name}--opacity--5))
  );
  --color--#{$name}-tint-6: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--opacity--6),
    transparent calc(100% - var(--color--#{$name}--opacity--6))
  );
  --color--#{$name}-tint-7: color-mix(
    in oklab,
    var(--color--#{$name}) var(--color--#{$name}--opacity--7),
    transparent calc(100% - var(--color--#{$name}--opacity--7))
  );
}
```

**Contrast color generation** (for main and all variants):

```scss
@mixin generate-contrast-colors($name, $variant: null) {
  $var-name: if($variant, --color--#{$name}-#{$variant}, --color--#{$name});
  $var-prefix: if(
    $variant,
    --color--#{$name}-#{$variant}--contrast,
    --color--#{$name}--contrast
  );

  // Base contrast (black or white, calculated at build/runtime or user override)
  #{$var-prefix}--base: var(
    #{$var-prefix}--base-override,
    #{calculate-optimal-contrast(var(#{$var-name}))}
  );

  // Blended contrast variants (use palette-specific blend vars)
  #{$var-prefix}--emphasized: color-mix(
    in oklab,
    var(#{$var-prefix}--base) var(--color--#{$name}--contrast-blend--emphasized),
    var(#{$var-name}) calc(
        100% - var(--color--#{$name}--contrast-blend--emphasized)
      )
  );
  #{$var-prefix}: color-mix(
    in oklab,
    var(#{$var-prefix}--base) var(--color--#{$name}--contrast-blend),
    var(#{$var-name}) calc(100% - var(--color--#{$name}--contrast-blend))
  ); // default
  #{$var-prefix}--deemphasized: color-mix(
    in oklab,
    var(#{$var-prefix}--base) var(
        --color--#{$name}--contrast-blend--deemphasized
      ),
    var(#{$var-name}) calc(
        100% - var(--color--#{$name}--contrast-blend--deemphasized)
      )
  );
  #{$var-prefix}--disabled: color-mix(
    in oklab,
    var(#{$var-prefix}--base) var(--color--#{$name}--contrast-blend--disabled),
    var(#{$var-name}) calc(
        100% - var(--color--#{$name}--contrast-blend--disabled)
      )
  );
}
```

**Main generation mixin**:

```scss
@mixin generate-all-variants($name, $config) {
  @include generate-palette-config-vars($name, $config);
  @include generate-lighter-darker($name);
  @include generate-mode-relative($name);
  @include generate-tints($name);
  @include generate-contrast-colors($name);

  // Generate contrast for each variant
  @include generate-contrast-colors($name, "darker-2");
  @include generate-contrast-colors($name, "darker-1");
  @include generate-contrast-colors($name, "lighter-1");
  @include generate-contrast-colors($name, "lighter-2");
  @include generate-contrast-colors($name, "lower-2");
  @include generate-contrast-colors($name, "lower-1");
  @include generate-contrast-colors($name, "higher-1");
  @include generate-contrast-colors($name, "higher-2");
  // Tints don't need contrast (transparent)
}
```

---

### Step 2: Create Color Derivation System

**File**: `projects/ng-material-theme/theming/_color-derivation.scss`

Auto-derive missing colors from primary using CSS formulas.

```scss
@mixin derive-colors($mode) {
  // Secondary: shift primary hue by 30deg, reduce saturation slightly
  --color--secondary: var(
    --color--secondary-override,
    color-mix(in oklab, var(--color--primary) 50%, #808080 50%)
  );

  // Tertiary: shift primary hue by 60deg
  --color--tertiary: var(
    --color--tertiary-override,
    color-mix(in oklab, var(--color--primary) 40%, #00bcd4 60%)
  );

  // Neutral: desaturated primary (used for surface/background)
  --color--neutral: var(
    --color--neutral-override,
    color-mix(in oklab, var(--color--primary) 20%, #9e9e9e 80%)
  );

  // Error: default red if not provided
  --color--error: var(--color--error-override, #f44336);
}

@mixin generate-neutral-surfaces($mode) {
  // Surface and background colors derived from neutral palette
  // Light mode: near-white surfaces
  @if $mode == "light" {
    --color--surface: var(
      --color--surface-override,
      color-mix(in oklab, var(--color--neutral) 5%, white 95%)
    );
    --color--background: var(--color--background-override, #ffffff);
    --color--on-surface: var(--color--on-surface-override, #1c1b1f);
    --color--on-background: var(--color--on-background-override, #1c1b1f);
  }
  // Dark mode: near-black surfaces
  @else {
    --color--surface: var(
      --color--surface-override,
      color-mix(in oklab, var(--color--neutral) 8%, #1c1b1f 92%)
    );
    --color--background: var(--color--background-override, #1c1b1f);
    --color--on-surface: var(--color--on-surface-override, #e6e1e5);
    --color--on-background: var(--color--on-background-override, #e6e1e5);
  }

  // Surface variants (container colors for Material components)
  --color--surface-dim: color-mix(
    in oklab,
    var(--color--surface) 85%,
    black 15%
  );
  --color--surface-bright: color-mix(
    in oklab,
    var(--color--surface) 85%,
    white 15%
  );
  --color--surface-container-lowest: color-mix(
    in oklab,
    var(--color--surface) 96%,
    @if ($mode == "light", white, black) 4%
  );
  --color--surface-container-low: color-mix(
    in oklab,
    var(--color--surface) 94%,
    @if ($mode == "light", white, black) 6%
  );
  --color--surface-container: color-mix(
    in oklab,
    var(--color--surface) 92%,
    @if ($mode == "light", black, white) 8%
  );
  --color--surface-container-high: color-mix(
    in oklab,
    var(--color--surface) 88%,
    @if ($mode == "light", black, white) 12%
  );
  --color--surface-container-highest: color-mix(
    in oklab,
    var(--color--surface) 84%,
    @if ($mode == "light", black, white) 16%
  );
}
```

User can override by setting `--color--secondary-override`, `--color--surface-override` etc., or by providing colors directly in config.

---

### Step 3: Create Contrast Calculation Utilities

**File**: `projects/ng-material-theme/theming/_contrast-utils.scss`

SCSS functions to calculate optimal contrast color (black or white) based on relative luminance in OKLab.

```scss
// Calculate relative luminance from OKLab L value
// Returns 'black' or 'white' for optimal contrast
@function calculate-optimal-contrast($color) {
  // This is a simplified version - real implementation would:
  // 1. Convert $color to OKLab
  // 2. Extract L (lightness) value
  // 3. Return black if L > 0.5, white if L <= 0.5

  // For SCSS build-time, use Material's contrast utilities
  @return mat.get-theme-color($color, text, 0.87); // placeholder
}

// Alternative: user can override contrast colors
@mixin allow-contrast-override($name, $variant: null) {
  $var-prefix: if(
    $variant,
    --color--#{$name}-#{$variant}--contrast,
    --color--#{$name}--contrast
  );

  // If user sets --override, use it; otherwise calculate
  #{$var-prefix}--base: var(
    #{$var-prefix}--base-override,
    #{calculate-optimal-contrast(var($var-prefix))}
  );
}
```

**Note**: At build-time, SCSS calculates contrast. At runtime, JavaScript can recalculate when colors change. User can always override via `--color--primary--contrast--base-override`.

---

### Step 4: Create CSS @property Declarations

**File**: `projects/ng-material-theme/theming/_property-declarations.scss`

Register all color and percentage variables for animation support.

```scss
@mixin register-color-properties() {
  // Base colors
  @property --color--primary {
    syntax: "<color>";
    inherits: true;
    initial-value: #3f51b5;
  }
  @property --color--secondary {
    syntax: "<color>";
    inherits: true;
    initial-value: #ff4081;
  }
  @property --color--tertiary {
    syntax: "<color>";
    inherits: true;
    initial-value: #00bcd4;
  }
  @property --color--neutral {
    syntax: "<color>";
    inherits: true;
    initial-value: #9e9e9e;
  }
  @property --color--error {
    syntax: "<color>";
    inherits: true;
    initial-value: #f44336;
  }
}

@mixin register-theme-level-properties() {
  // Theme-level blend percentages
  @property --theme--blend--darker-2 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 80%;
  }
  @property --theme--blend--darker-1 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 90%;
  }
  @property --theme--blend--lighter-1 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 90%;
  }
  @property --theme--blend--lighter-2 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 80%;
  }

  // Theme-level opacity levels
  @property --theme--opacity--1 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 10%;
  }
  @property --theme--opacity--2 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 20%;
  }
  @property --theme--opacity--3 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 30%;
  }
  @property --theme--opacity--4 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 40%;
  }
  @property --theme--opacity--5 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 50%;
  }
  @property --theme--opacity--6 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 70%;
  }
  @property --theme--opacity--7 {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 90%;
  }

  // Theme-level contrast blends
  @property --theme--contrast-blend--emphasized {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 100%;
  }
  @property --theme--contrast-blend {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 90%;
  }
  @property --theme--contrast-blend--deemphasized {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 80%;
  }
  @property --theme--contrast-blend--disabled {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 50%;
  }
}

@mixin register-palette-property-declarations($name) {
  // Override variables (blend percentages)
  @property --color--#{$name}--blend--darker-2-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 80%;
  }
  @property --color--#{$name}--blend--darker-1-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 90%;
  }
  @property --color--#{$name}--blend--lighter-1-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 90%;
  }
  @property --color--#{$name}--blend--lighter-2-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 80%;
  }

  // Override variables (opacity levels)
  @property --color--#{$name}--opacity--1-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 10%;
  }
  @property --color--#{$name}--opacity--2-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 20%;
  }
  @property --color--#{$name}--opacity--3-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 30%;
  }
  @property --color--#{$name}--opacity--4-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 40%;
  }
  @property --color--#{$name}--opacity--5-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 50%;
  }
  @property --color--#{$name}--opacity--6-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 70%;
  }
  @property --color--#{$name}--opacity--7-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 90%;
  }

  // Override variables (contrast blends)
  @property --color--#{$name}--contrast-blend--emphasized-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 100%;
  }
  @property --color--#{$name}--contrast-blend-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 90%;
  }
  @property --color--#{$name}--contrast-blend--deemphasized-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 80%;
  }
  @property --color--#{$name}--contrast-blend--disabled-override {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 50%;
  }

  // Note: Computed variables (with fallbacks) don't need @property declarations
  // as they resolve to the override or theme-level variables which are already declared

  // All generated color variants would also get @property declarations
  // (omitted for brevity - include all variants from step 1)
}

@mixin register-all-properties() {
  @include register-color-properties();
  @include register-theme-level-properties();
  @include register-palette-property-declarations("primary");
  @include register-palette-property-declarations("secondary");
  @include register-palette-property-declarations("tertiary");
  @include register-palette-property-declarations("neutral");
  @include register-palette-property-declarations("error");
}
```

---

### Step 5: Create Typography System

**File**: `projects/ng-material-theme/theming/_typography.scss`

Simplified typography variable generation matching Material's M3 typography tokens.

```scss
@mixin generate-typography($config: null) {
  // Use Material's typography system or custom
  // Output CSS variables for all type scales
  --mat-sys-typescale-display-large-font: Roboto, sans-serif;
  --mat-sys-typescale-display-large-size: 57px;
  --mat-sys-typescale-display-large-line-height: 64px;
  // ... all M3 typography tokens

  // Allow user overrides via $config
}
```

---

### Step 6: Create Density System

**File**: `projects/ng-material-theme/theming/_density.scss`

Density CSS variable and attribute selector classes.

```scss
@mixin generate-density($level: 0) {
  --mat-density: #{$level};

  // Component-specific density overrides if needed
  @if $level < 0 {
    // Tighter spacing
  }
}

@mixin density-selectors() {
  [theme-density="0"] {
    @include generate-density(0);
  }
  [theme-density="-1"] {
    @include generate-density(-1);
  }
  [theme-density="-2"] {
    @include generate-density(-2);
  }
  [theme-density="-3"] {
    @include generate-density(-3);
  }
  [theme-density="-4"] {
    @include generate-density(-4);
  }
  [theme-density="-5"] {
    @include generate-density(-5);
  }
}
```

---

### Step 7: Create Material M3 Bridge

**File**: `projects/ng-material-theme/theming/_mat-theme-bridge.scss`

Map custom color variants to Material M3 system tokens.

```scss
@mixin mat-theme-bridge($mode: light) {
  // Map custom variants to Material's system tokens
  $theme: mat.define-theme(
    (
      color: (
        theme-type: $mode,

        // Primary palette
        primary: var(--color--primary),
        on-primary: var(--color--primary--contrast),
        primary-container: var(--color--primary-lighter-1),
        on-primary-container: var(--color--primary-lighter-1--contrast),
        primary-fixed: var(--color--primary-lighter-2),
        on-primary-fixed: var(--color--primary-lighter-2--contrast),
        // Secondary palette
        secondary: var(--color--secondary),
        on-secondary: var(--color--secondary--contrast),
        secondary-container: var(--color--secondary-lighter-1),
        on-secondary-container: var(--color--secondary-lighter-1--contrast),
        // Tertiary palette
        tertiary: var(--color--tertiary),
        on-tertiary: var(--color--tertiary--contrast),
        tertiary-container: var(--color--tertiary-lighter-1),
        on-tertiary-container: var(--color--tertiary-lighter-1--contrast),
        // Error palette
        error: var(--color--error),
        on-error: var(--color--error--contrast),
        error-container: var(--color--error-lighter-1),
        on-error-container: var(--color--error-lighter-1--contrast),
        // Surface colors (use neutral with mode-relative variants)
        surface: var(--color--neutral-lower-2),
        on-surface: var(--color--neutral--contrast),
        surface-dim: var(--color--neutral-lower-1),
        surface-bright: var(--color--neutral-higher-1),
        surface-container-lowest: var(--color--neutral-lower-2),
        surface-container-low: var(--color--neutral-lower-1),
        surface-container: var(--color--neutral),
        surface-container-high: var(--color--neutral-higher-1),
        surface-container-highest: var(--color--neutral-higher-2),
        surface-variant: var(--color--neutral-lighter-1),
        on-surface-variant: var(--color--neutral--contrast--deemphasized),
        // Outlines
        outline: var(--color--neutral),
        outline-variant: var(--color--neutral-lighter-1),
        // Other
        shadow: #000000,
        scrim: #000000,
        inverse-surface: var(--color--neutral-darker-2),
        inverse-on-surface: var(--color--neutral-darker-2--contrast),
        inverse-primary: var(--color--primary-lighter-2),
      ),
    )
  );

  @include mat.all-component-themes($theme);
}
```

**Note**: Only the standard Material palettes (primary, secondary, tertiary, neutral, error) are mapped to Angular Material system tokens. Any custom palettes defined in your theme will generate full CSS variable sets but won't be automatically used by Material components. Use custom palettes for your own component styling.

---

### Step 8: Create Main Theme Mixin

**File**: `projects/ng-material-theme/theming/_theme.scss`

Main theme generation that ties everything together.

```scss
@use "./color-variants" as variants;
@use "./color-derivation" as derivation;
@use "./property-declarations" as props;
@use "./typography" as typo;
@use "./density" as dens;
@use "./mat-theme-bridge" as bridge;

@mixin createTheme($name, $config, $is-default: false) {
  // Parse config (no mode property!)
  $colors: map-get($config, "colors");
  $typography: map-get($config, "typography");
  $density: map-get($config, "density", 0);
  $blends: map-get($config, "blends");
  $opacities: map-get($config, "opacities");
  $contrast-blends: map-get($config, "contrast-blends");

  // No mode suffix - themes are universal with light-dark()
  $theme-name: $name;

  // Generate theme selector
  $selector: if(
    $is-default,
    ':root, [theme="#{$theme-name}"]',
    '[theme="#{$theme-name}"]'
  );

  #{$selector} {
    // Generate theme-level defaults (if provided)
    @if $blends {
      @include variants.generate-theme-defaults($blends);
    }
    @if $opacities {
      @include variants.generate-theme-opacity-defaults($opacities);
    }
    @if $contrast-blends {
      @include variants.generate-theme-contrast-blend-defaults(
        $contrast-blends
      );
    }

    // Set base colors (user-provided)
    @each $palette-name, $palette-config in $colors {
      @if type-of($palette-config) == "string" {
        // Simple form: colors: (primary: '#3f51b5')
        --color--#{$palette-name}: #{$palette-config};
      } @else if type-of($palette-config) == "list" {
        // Array form: colors: (primary: ('#6200ee', '#bb86fc'))
        // Generates: --color--primary: light-dark(#6200ee, #bb86fc);
        $light: nth($palette-config, 1);
        $dark: nth($palette-config, 2);
        --color--#{$palette-name}: light-dark(#{$light}, #{$dark});
      } @else {
        // Object form: colors: (primary: (value: '#3f51b5', contrast: white))
        // or: colors: (primary: (value: ('#6200ee', '#bb86fc'), contrast: (black, white)))
        $value: map-get($palette-config, "value");

        @if type-of($value) == "list" {
          $light: nth($value, 1);
          $dark: nth($value, 2);
          --color--#{$palette-name}: light-dark(#{$light}, #{$dark});
        } @else {
          --color--#{$palette-name}: #{$value};
        }

        // User contrast override
        @if map-has-key($palette-config, "contrast") {
          $contrast: map-get($palette-config, "contrast");
          @if type-of($contrast) == "list" {
            $light-contrast: nth($contrast, 1);
            $dark-contrast: nth($contrast, 2);
            --color--#{$palette-name}--contrast--base-override: light-dark(
              #{$light-contrast},
              #{$dark-contrast}
            );
          } @else {
            --color--#{$palette-name}--contrast--base-override: #{$contrast};
          }
        }
      }

      // Generate all variants for this palette (includes overrides and computed values)
      @include variants.generate-all-variants($palette-name, $palette-config);
    }

    // Auto-derive missing colors and generate neutral palette surface/background
    @include derivation.derive-colors();
    @include derivation.generate-neutral-surfaces();

    // Typography
    @include typo.generate-typography($typography);

    // Density
    @include dens.generate-density($density);
  }

  // Light mode
  #{$selector}[theme-mode="light"],
  #{$selector}.light-mode {
    @each $palette-name, $_ in $colors {
      @include variants.generate-mode-relative($palette-name);
    }
    @include bridge.mat-theme-bridge(light);
  }

  // Dark mode
  #{$selector}[theme-mode="dark"],
  #{$selector}.dark-mode {
    @each $palette-name, $_ in $colors {
      @include variants.generate-mode-relative-dark($palette-name);
    }
    @include bridge.mat-theme-bridge(dark);
  }
}
```

---

### Step 9: Create Public API

**File**: `projects/ng-material-theme/theming/_index.scss`

Public exports for consumers.

```scss
@use "./theme" as internal-theme;
@use "./property-declarations" as props;
@use "./density" as dens;
@use "@angular/material" as mat;

// Main API
@mixin core() {
  // Material core styles
  @include mat.core();

  // Register all @property declarations
  @include props.register-all-properties();

  // Density selectors
  @include dens.density-selectors();
}

// Re-export theme mixin
@mixin createTheme($name, $config, $is-default: false) {
  @include internal-theme.createTheme($name, $config, $is-default);
}

// Advanced utilities
@forward "./color-variants" show generate-all-variants;
@forward "./contrast-utils" show calculate-optimal-contrast;
```

---

### Step 10: Create Build System

**File**: `projects/ng-material-theme/src/build-css.mts`

Build pipeline: compile SCSS → filter density → output CSS.

```typescript
import * as sass from "sass";
import { parse } from "css-tree";
import fs from "fs";
import path from "path";

export async function buildCSS() {
  // Compile base SCSS
  const baseResult = sass.compile("src/scss/base.scss", {
    loadPaths: ["node_modules"],
    style: "compressed",
  });

  // Output core.css
  fs.writeFileSync("css/core.css", baseResult.css);

  // Generate density-specific builds
  for (let density = 0; density >= -5; density--) {
    const result = sass.compile("src/scss/base.scss", {
      loadPaths: ["node_modules"],
      style: "compressed",
      // Filter density in post-processing
    });

    const filtered = filterDensityLevel(result.css, density);
    fs.writeFileSync(`css/density-${Math.abs(density)}.css`, filtered);
  }
}

function filterDensityLevel(css: string, targetDensity: number): string {
  // Parse CSS AST and filter rules not matching target density
  const ast = parse(css);
  // ... filtering logic (keep from existing implementation)
  return generate(ast);
}
```

**Base SCSS** (`src/scss/base.scss`):

```scss
@use "../theming" as theming;

@include theming.core();

@include theming.createTheme(
  "default",
  (
    colors: (
      primary: "#3f51b5",
      secondary: "#ff4081",
      tertiary: "#00bcd4",
      neutral: "#9e9e9e",
      error: "#f44336",
    ),
    typography: null,
    // use Material defaults
    density: 0,
  ),
  $is-default: true
);
```

---

## Part 2: Runtime Capabilities

### Step 11: Create Runtime Theme Generator

**File**: `projects/ng-material-theme/src/lib/runtime-theme-generator.ts`

JavaScript API to generate theme CSS at runtime (identical to build-time output).

```typescript
export interface ThemeConfig {
  // No mode property - use light-dark() with color-scheme instead!

  // Theme-level defaults (optional)
  blends?: {
    "darker-2"?: string | [string, string]; // single value or [light, dark]
    "darker-1"?: string | [string, string];
    "lighter-1"?: string | [string, string];
    "lighter-2"?: string | [string, string];
  };
  opacities?: {
    opacity1?: string | [string, string]; // 10% or ['10%', '15%']
    opacity2?: string | [string, string]; // 20%
    opacity3?: string | [string, string]; // 30%
    opacity4?: string | [string, string]; // 40%
    opacity5?: string | [string, string]; // 50%
    opacity6?: string | [string, string]; // 70%
    opacity7?: string | [string, string]; // 90%
  };
  contrastBlends?: {
    emphasized?: string | [string, string];
    default?: string | [string, string];
    deemphasized?: string | [string, string];
    disabled?: string | [string, string];
  };

  colors: {
    // Standard Material palettes
    // Can be: string (same for light/dark), [light, dark], or PaletteConfig
    primary?: string | [string, string] | PaletteConfig;
    secondary?: string | [string, string] | PaletteConfig;
    tertiary?: string | [string, string] | PaletteConfig;
    neutral?: string | [string, string] | PaletteConfig;
    error?: string | [string, string] | PaletteConfig;
    // Custom palettes (not mapped to Material components)
    [key: string]: string | [string, string] | PaletteConfig | undefined;
  };
  typography?: TypographyConfig;
  density?: number;
}

export interface PaletteConfig {
  value: string | [string, string]; // Color value(s)
  contrast?: string | [string, string]; // User override for base contrast

  // Per-palette blend overrides
  "blend-darker-2"?: string | [string, string];
  "blend-darker-1"?: string | [string, string];
  "blend-lighter-1"?: string | [string, string];
  "blend-lighter-2"?: string | [string, string];

  // Per-palette opacity overrides
  opacity1?: string | [string, string];
  opacity2?: string | [string, string];
  opacity3?: string | [string, string];
  opacity4?: string | [string, string];
  opacity5?: string | [string, string];
  opacity6?: string | [string, string];
  opacity7?: string | [string, string];

  // Per-palette contrast blend overrides
  "contrast-blend-emphasized"?: string | [string, string];
  "contrast-blend"?: string | [string, string];
  "contrast-blend-deemphasized"?: string | [string, string];
  "contrast-blend-disabled"?: string | [string, string];
}

export function generateThemeCSS(
  name: string,
  config: ThemeConfig,
  isDefault = false,
): string {
  let css = "";

  // No mode suffix - themes are universal with light-dark()
  const themeName = name;

  const selector = isDefault
    ? `:root, [theme="${themeName}"]`
    : `[theme="${themeName}"]`;

  css += `${selector} {\n`;

  // Generate theme-level defaults
  if (config.blends) {
    if (config.blends["darker-2"])
      css += `  --theme--blend--darker-2: ${config.blends["darker-2"]};\n`;
    if (config.blends["darker-1"])
      css += `  --theme--blend--darker-1: ${config.blends["darker-1"]};\n`;
    if (config.blends["lighter-1"])
      css += `  --theme--blend--lighter-1: ${config.blends["lighter-1"]};\n`;
    if (config.blends["lighter-2"])
      css += `  --theme--blend--lighter-2: ${config.blends["lighter-2"]};\n`;
  }

  if (config.opacities) {
    const opacities = [
      "opacity1",
      "opacity2",
      "opacity3",
      "opacity4",
      "opacity5",
      "opacity6",
      "opacity7",
    ];
    const indices = [1, 2, 3, 4, 5, 6, 7];
    opacities.forEach((key, idx) => {
      if (config.opacities![key])
        css += `  --theme--opacity--${indices[idx]}: ${config.opacities![key]};\n`;
    });
  }

  if (config.contrastBlends) {
    if (config.contrastBlends["emphasized"])
      css += `  --theme--contrast-blend--emphasized: ${config.contrastBlends["emphasized"]};\n`;
    if (config.contrastBlends["default"])
      css += `  --theme--contrast-blend: ${config.contrastBlends["default"]};\n`;
    if (config.contrastBlends["deemphasized"])
      css += `  --theme--contrast-blend--deemphasized: ${config.contrastBlends["deemphasized"]};\n`;
    if (config.contrastBlends["disabled"])
      css += `  --theme--contrast-blend--disabled: ${config.contrastBlends["disabled"]};\n`;
  }

  // Base colors and per-palette configuration
  for (const [paletteName, paletteConfig] of Object.entries(config.colors)) {
    if (!paletteConfig) continue;

    const colorValue =
      typeof paletteConfig === "string" ? paletteConfig : paletteConfig.value;
    css += `  --color--${paletteName}: ${colorValue};\n`;

    // User contrast override
    if (typeof paletteConfig !== "string" && paletteConfig.contrast) {
      css += `  --color--${paletteName}--contrast--base-override: ${paletteConfig.contrast};\n`;
    }

    // Generate per-palette override variables (only if specified)
    if (typeof paletteConfig !== "string") {
      // Blend overrides
      if (paletteConfig["blend-darker-2"])
        css += `  --color--${paletteName}--blend--darker-2-override: ${paletteConfig["blend-darker-2"]};\n`;
      if (paletteConfig["blend-darker-1"])
        css += `  --color--${paletteName}--blend--darker-1-override: ${paletteConfig["blend-darker-1"]};\n`;
      if (paletteConfig["blend-lighter-1"])
        css += `  --color--${paletteName}--blend--lighter-1-override: ${paletteConfig["blend-lighter-1"]};\n`;
      if (paletteConfig["blend-lighter-2"])
        css += `  --color--${paletteName}--blend--lighter-2-override: ${paletteConfig["blend-lighter-2"]};\n`;

      // Opacity overrides
      const opacities = [
        "opacity1",
        "opacity2",
        "opacity3",
        "opacity4",
        "opacity5",
        "opacity6",
        "opacity7",
      ];
      opacities.forEach((key, idx) => {
        if (paletteConfig[key])
          css += `  --color--${paletteName}--opacity--${idx + 1}-override: ${paletteConfig[key]};\n`;
      });

      // Contrast blend overrides
      if (paletteConfig["contrast-blend-emphasized"])
        css += `  --color--${paletteName}--contrast-blend--emphasized-override: ${paletteConfig["contrast-blend-emphasized"]};\n`;
      if (paletteConfig["contrast-blend"])
        css += `  --color--${paletteName}--contrast-blend-override: ${paletteConfig["contrast-blend"]};\n`;
      if (paletteConfig["contrast-blend-deemphasized"])
        css += `  --color--${paletteName}--contrast-blend--deemphasized-override: ${paletteConfig["contrast-blend-deemphasized"]};\n`;
      if (paletteConfig["contrast-blend-disabled"])
        css += `  --color--${paletteName}--contrast-blend--disabled-override: ${paletteConfig["contrast-blend-disabled"]};\n`;
    }

    // Generate computed variables with fallback chain
    css += `  --color--${paletteName}--blend--darker-2: var(--color--${paletteName}--blend--darker-2-override, var(--theme--blend--darker-2));\n`;
    css += `  --color--${paletteName}--blend--darker-1: var(--color--${paletteName}--blend--darker-1-override, var(--theme--blend--darker-1));\n`;
    css += `  --color--${paletteName}--blend--lighter-1: var(--color--${paletteName}--blend--lighter-1-override, var(--theme--blend--lighter-1));\n`;
    css += `  --color--${paletteName}--blend--lighter-2: var(--color--${paletteName}--blend--lighter-2-override, var(--theme--blend--lighter-2));\n`;

    // Computed opacity variables
    for (let i = 1; i <= 7; i++) {
      css += `  --color--${paletteName}--opacity--${i}: var(--color--${paletteName}--opacity--${i}-override, var(--theme--opacity--${i}));\n`;
    }

    // Computed contrast blend variables
    css += `  --color--${paletteName}--contrast-blend--emphasized: var(--color--${paletteName}--contrast-blend--emphasized-override, var(--theme--contrast-blend--emphasized));\n`;
    css += `  --color--${paletteName}--contrast-blend: var(--color--${paletteName}--contrast-blend-override, var(--theme--contrast-blend));\n`;
    css += `  --color--${paletteName}--contrast-blend--deemphasized: var(--color--${paletteName}--contrast-blend--deemphasized-override, var(--theme--contrast-blend--deemphasized));\n`;
    css += `  --color--${paletteName}--contrast-blend--disabled: var(--color--${paletteName}--contrast-blend--disabled-override, var(--theme--contrast-blend--disabled));\n`;

    // Generate lighter/darker variants
    css += generateLighterDarkerVariants(paletteName);

    // Generate mode-relative variants
    css += generateModeRelativeVariants(paletteName);

    // Generate tints
    css += generateTints(paletteName);

    // Generate contrast colors
    css += generateContrastColors(paletteName, colorValue);

    // Generate contrast for each variant
    // (for brevity, showing just one example)
    css += generateContrastColors(
      paletteName,
      `var(--color--${paletteName}-darker-1)`,
      "darker-1",
    );
  }

  // Color derivation
  css += generateColorDerivation();

  // Generate surface/background colors from neutral palette based on mode
  css += generateNeutralSurfaces(config.mode);

  css += `}\n`;

  // Light mode
  css += `${selector}[theme-mode="light"], ${selector}.light-mode {\n`;
  for (const paletteName of Object.keys(config.colors)) {
    css += generateModeRelativeVariants(paletteName, "light");
  }
  css += `}\n`;

  // Dark mode
  css += `${selector}[theme-mode="dark"], ${selector}.dark-mode {\n`;
  for (const paletteName of Object.keys(config.colors)) {
    css += generateModeRelativeVariants(paletteName, "dark");
  }
  css += `}\n`;

  return css;
}

function getConfigValue(
  config: string | PaletteConfig,
  key: keyof PaletteConfig,
  defaultValue: string,
): string {
  if (typeof config === "string") return defaultValue;
  return config[key] || defaultValue;
}

function generateLighterDarkerVariants(name: string): string {
  return `  --color--${name}-darker-2: color-mix(in oklab, var(--color--${name}) var(--color--${name}--blend--darker-2), black calc(100% - var(--color--${name}--blend--darker-2)));
  --color--${name}-darker-1: color-mix(in oklab, var(--color--${name}) var(--color--${name}--blend--darker-1), black calc(100% - var(--color--${name}--blend--darker-1)));
  --color--${name}-lighter-1: color-mix(in oklab, var(--color--${name}) var(--color--${name}--blend--lighter-1), white calc(100% - var(--color--${name}--blend--lighter-1)));
  --color--${name}-lighter-2: color-mix(in oklab, var(--color--${name}) var(--color--${name}--blend--lighter-2), white calc(100% - var(--color--${name}--blend--lighter-2)));
`;
}

function generateModeRelativeVariants(
  name: string,
  mode: "light" | "dark" = "light",
): string {
  if (mode === "light") {
    return `  --color--${name}-lower-2: color-mix(in oklab, var(--color--${name}) 80%, black 20%);
  --color--${name}-lower-1: color-mix(in oklab, var(--color--${name}) 90%, black 10%);
  --color--${name}-higher-1: color-mix(in oklab, var(--color--${name}) 90%, white 10%);
  --color--${name}-higher-2: color-mix(in oklab, var(--color--${name}) 80%, white 20%);
`;
  } else {
    return `  --color--${name}-lower-2: color-mix(in oklab, var(--color--${name}) 80%, white 20%);
  --color--${name}-lower-1: color-mix(in oklab, var(--color--${name}) 90%, white 10%);
  --color--${name}-higher-1: color-mix(in oklab, var(--color--${name}) 90%, black 10%);
  --color--${name}-higher-2: color-mix(in oklab, var(--color--${name}) 80%, black 20%);
`;
  }
}

function generateTints(name: string): string {
  let css = "";
  for (let i = 1; i <= 7; i++) {
    css += `  --color--${name}-tint-${i}: color-mix(in oklab, var(--color--${name}) var(--color--${name}--opacity--${i}), transparent calc(100% - var(--color--${name}--opacity--${i})));\n`;
  }
  return css;
}

function generateContrastColors(
  name: string,
  baseColor: string,
  variant?: string,
): string {
  const varPrefix = variant
    ? `--color--${name}-${variant}--contrast`
    : `--color--${name}--contrast`;
  const baseVar = variant ? `--color--${name}-${variant}` : `--color--${name}`;

  // Calculate optimal contrast (black or white)
  const contrastBase = calculateOptimalContrast(baseColor);

  return `  ${varPrefix}--base: var(${varPrefix}--base-override, ${contrastBase});
  ${varPrefix}--emphasized: color-mix(in oklab, var(${varPrefix}--base) var(--color--${name}--contrast-blend--emphasized), var(${baseVar}) calc(100% - var(--color--${name}--contrast-blend--emphasized)));
  ${varPrefix}: color-mix(in oklab, var(${varPrefix}--base) var(--color--${name}--contrast-blend), var(${baseVar}) calc(100% - var(--color--${name}--contrast-blend)));
  ${varPrefix}--deemphasized: color-mix(in oklab, var(${varPrefix}--base) var(--color--${name}--contrast-blend--deemphasized), var(${baseVar}) calc(100% - var(--color--${name}--contrast-blend--deemphasized)));
  ${varPrefix}--disabled: color-mix(in oklab, var(${varPrefix}--base) var(--color--${name}--contrast-blend--disabled), var(${baseVar}) calc(100% - var(--color--${name}--contrast-blend--disabled)));
`;
}

function calculateOptimalContrast(color: string): string {
  // Calculate relative luminance in OKLab
  // For simplicity, parse and compute manually or use a library
  // Return 'black' or 'white' based on luminance

  // Placeholder implementation
  const rgb = parseColor(color);
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.5 ? "black" : "white";
}

function parseColor(color: string): { r: number; g: number; b: number } {
  // Parse hex/rgb/hsl to RGB
  // Placeholder - implement full parser
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  return { r: 0, g: 0, b: 0 };
}

function generateColorDerivation(): string {
  return `  --color--secondary: var(--color--secondary-override, color-mix(in oklab, var(--color--primary) 50%, #808080 50%));
  --color--tertiary: var(--color--tertiary-override, color-mix(in oklab, var(--color--primary) 40%, #00bcd4 60%));
  --color--neutral: var(--color--neutral-override, color-mix(in oklab, var(--color--primary) 20%, #9e9e9e 80%));
  --color--error: var(--color--error-override, #f44336);
`;
}

function generateNeutralSurfaces(mode: "light" | "dark"): string {
  if (mode === "light") {
    return `  --color--surface: var(--color--surface-override, color-mix(in oklab, var(--color--neutral) 5%, white 95%));
  --color--background: var(--color--background-override, #ffffff);
  --color--on-surface: var(--color--on-surface-override, #1c1b1f);
  --color--on-background: var(--color--on-background-override, #1c1b1f);
  --color--surface-dim: color-mix(in oklab, var(--color--surface) 85%, black 15%);
  --color--surface-bright: color-mix(in oklab, var(--color--surface) 85%, white 15%);
  --color--surface-container-lowest: color-mix(in oklab, var(--color--surface) 96%, white 4%);
  --color--surface-container-low: color-mix(in oklab, var(--color--surface) 94%, white 6%);
  --color--surface-container: color-mix(in oklab, var(--color--surface) 92%, black 8%);
  --color--surface-container-high: color-mix(in oklab, var(--color--surface) 88%, black 12%);
  --color--surface-container-highest: color-mix(in oklab, var(--color--surface) 84%, black 16%);
`;
  } else {
    return `  --color--surface: var(--color--surface-override, color-mix(in oklab, var(--color--neutral) 8%, #1c1b1f 92%));
  --color--background: var(--color--background-override, #1c1b1f);
  --color--on-surface: var(--color--on-surface-override, #e6e1e5);
  --color--on-background: var(--color--on-background-override, #e6e1e5);
  --color--surface-dim: color-mix(in oklab, var(--color--surface) 85%, black 15%);
  --color--surface-bright: color-mix(in oklab, var(--color--surface) 85%, white 15%);
  --color--surface-container-lowest: color-mix(in oklab, var(--color--surface) 96%, black 4%);
  --color--surface-container-low: color-mix(in oklab, var(--color--surface) 94%, black 6%);
  --color--surface-container: color-mix(in oklab, var(--color--surface) 92%, white 8%);
  --color--surface-container-high: color-mix(in oklab, var(--color--surface) 88%, white 12%);
  --color--surface-container-highest: color-mix(in oklab, var(--color--surface) 84%, white 16%);
`;
  }
}

export function applyTheme(
  name: string,
  config: ThemeConfig,
  isDefault = false,
): void {
  const css = generateThemeCSS(name, config, isDefault);

  // Use constructable stylesheets if supported
  if ("CSSStyleSheet" in window && "adoptedStyleSheets" in document) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  } else {
    // Fallback: inject <style> tag
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }
}
```

---

### Step 12: Update Theme Service

**File**: `projects/ng-material-theme/src/lib/ng-material-theme.service.ts`

Angular service with runtime theme methods.

```typescript
import { Injectable, signal } from "@angular/core";
import {
  generateThemeCSS,
  applyTheme,
  ThemeConfig,
} from "./runtime-theme-generator";

@Injectable({ providedIn: "root" })
export class NgMaterialThemeService {
  // Current theme name (no mode suffix)
  readonly currentTheme = signal<string>("default");
  readonly currentMode = signal<"light" | "dark">("light");

  // New methods
  createRuntimeTheme(
    name: string,
    config: ThemeConfig,
    isDefault = false,
  ): string {
    applyTheme(name, config, isDefault);
    return generateThemeCSS(name, config, isDefault);
  }

  saveTheme(name: string): string {
    // Export current theme CSS for database storage
    // Read computed styles and reconstruct CSS
    const root =
      document.querySelector(`[theme="${name}"]`) || document.documentElement;
    const styles = getComputedStyle(root);

    let css = `[theme="${name}"] {\n`;
    // Extract all --color--* variables
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith("--color--")) {
        css += `  ${prop}: ${styles.getPropertyValue(prop)};\n`;
      }
    }
    css += `}\n`;

    return css;
  }

  preloadTheme(name: string, config: ThemeConfig): void {
    // Pre-generate theme CSS without applying
    generateThemeCSS(name, config);
  }

  // Theme and mode management
  setTheme(name: string): void {
    // Set theme (no mode suffix needed with light-dark())
    this.currentTheme.set(name);
    document.documentElement.setAttribute("theme", name);
  }

  setMode(mode: "light" | "dark"): void {
    // Just set color-scheme, light-dark() automatically updates
    this.currentMode.set(mode);
    document.documentElement.style.colorScheme = mode;
  }
}
```

---

### Step 13: Theme Utilities

**File**: `projects/ng-material-theme/src/lib/theme.ts`

Utility functions (keep existing).

```typescript
export function setTheme(name: string): void {
  // Set theme attribute (no mode suffix)
  document.documentElement.setAttribute("theme", name);
  localStorage.setItem("theme", name);
}

export function setMode(mode: "light" | "dark"): void {
  // Just set color-scheme property - light-dark() automatically responds
  document.documentElement.style.colorScheme = mode;
  localStorage.setItem("color-scheme", mode);
}

export function getActiveTheme(): string {
  return document.documentElement.getAttribute("theme") || "default";
}

export function getActiveMode(): "light" | "dark" {
  const stored = localStorage.getItem("color-scheme") as "light" | "dark";
  return stored || "light";
}
```

---

## Part 3: Documentation & Examples

### Step 14: Example Implementation

**File**: `projects/test-theme/src/styles.scss`

Complete examples showing all configuration patterns.

#### Example 1: Minimal configuration (all defaults)

```scss
@use "@cpangular/ng-material-theme" as theming;

@include theming.core();

// Simplest form - single color values (same in light/dark mode)
@include theming.createTheme(
  "simple",
  (
    colors: (
      primary: "#6200ee",
      secondary: "#03dac6",
      tertiary: "#bb86fc",
      neutral: "#1c1b1f",
      error: "#b00020",
    ),
  ),
  $is-default: true
);
```

**Result**: All palettes use built-in defaults:

- Blends: 80%/90%/90%/80%
- Opacities: 10%/20%/30%/40%/50%/70%/90%
- Contrast blends: 100%/90%/80%/50%
- Same colors in light and dark modes (use `color-scheme` to control surfaces)

---

#### Example 1b: Light/dark color variations

```scss
// Use array [light, dark] for different colors per mode
@include theming.createTheme(
  "adaptive",
  (
    colors: (
      // Light mode: deep purple, Dark mode: light purple
      primary: ("#6200ee", "#bb86fc"),
      // Light mode: teal, Dark mode: cyan
      secondary: ("#03dac6", "#00e5ff"),
      tertiary: ("#bb86fc", "#6200ee"),
      neutral: ("#1c1b1f", "#e6e1e5"),
      error: ("#b00020", "#f44336"),
    ),
  ),
  $is-default: true
);
```

**Generated CSS**:

```css
:root,
[theme="adaptive"] {
  --color--primary: light-dark(#6200ee, #bb86fc);
  --color--secondary: light-dark(#03dac6, #00e5ff);
  /* ... */
}
```

**Usage**: Just set `color-scheme: light` or `color-scheme: dark` and all `light-dark()` values update automatically!

---

#### Example 2: Theme-level configuration (DRY principle)

```scss
@use "@cpangular/ng-material-theme" as theming;

@include theming.core();

// Set custom defaults at theme level for ALL palettes
@include theming.createTheme(
  "branded",
  (
    // Theme-wide defaults (apply to all color palettes)
    blends:
      (
        darker-2: 75%,
        // Custom: make darker variants more intense
        darker-1: 85%,
        lighter-1: 92%,
        // Custom: make lighter variants more subtle
        lighter-2: 85%
      ),
    opacities: (
      opacity1: 8%,
      // Custom: more subtle tints
      opacity2: 15%,
      opacity3: 25%,
      opacity4: 35%,
      opacity5: 50%,
      opacity6: 65%,
      opacity7: 85%
    ),
    contrast-blends: (
      emphasized: 100%,
      default: 95%,
      // Custom: higher contrast default
      deemphasized: 85%,
      disabled: 60% // Custom: slightly more visible disabled,
    ),

    // All palettes inherit the theme-level defaults above
    colors:
      (
        primary: (
          "#6200ee",
          "#bb86fc",
        ),
        // Light/dark variations
        secondary: "#03dac6",
        // Or single value
        tertiary: "#bb86fc",
        neutral: (
          "#1c1b1f",
          "#e6e1e5",
        ),
        error: "#b00020"
      ),
    typography: null,
    density: 0
  ),
  $is-default: true
);
```

**Result**: All palettes use the custom theme-level defaults.  
**Best for**: Consistent styling across all colors.

---

#### Example 3: Per-palette overrides (fine-tuned control)

```scss
@use "@cpangular/ng-material-theme" as theming;

@include theming.core();

// Theme-level defaults + selective per-palette overrides
@include theming.createTheme(
  "custom",
  (
    mode: "light",
    // Theme-wide defaults
    blends:
      (
        darker-2: 80%,
        darker-1: 90%,
        lighter-1: 90%,
        lighter-2: 80%,
      ),
    opacities: (
      opacity1: 10%,
      opacity2: 20%,
      opacity3: 30%,
      opacity4: 40%,
      opacity5: 50%,
      opacity6: 70%,
      opacity7: 90%,
    ),
    contrast-blends: (
      emphasized: 100%,
      default: 90%,
      deemphasized: 80%,
      disabled: 50%,
    ),

    colors: (
      primary: (
        value: "#6200ee",
        contrast: white,

        // Optional: override calculated contrast
        // Override specific values only for primary palette
        blend-darker-1: 85%,
        // Primary needs stronger darks
        opacity2: 25%,
        // Primary needs different tint (opacity-2 normally 20%)
        contrast-blend: 95% // Primary needs higher contrast,,
      ),

      secondary: "#03dac6",

      // Uses all theme-level defaults
      tertiary:
        (
          value: "#bb86fc",
          opacity5: 55%,
          // Only override one opacity for tertiary
          contrast-blend-disabled: 60% // Different disabled contrast,,
        ),

      neutral: (
        value: "#1c1b1f",
        blend-lighter-1: 95%,
        // Neutral needs more subtle lights
        blend-lighter-2: 92%,
      ),

      error: "#b00020",

      // Uses all theme-level defaults
      // Custom palettes (not used by Material, but useful for custom components)
      accent: "#ff4081",
      success: "#4caf50",
      warning: "#ff9800",
    ),
    typography: null,
    density: 0,
  ),
  $is-default: true
);
```

**Result**: Each palette uses theme defaults except where explicitly overridden. Custom palettes (accent, success, warning) get full CSS variable generation but aren't mapped to Material components.  
**Best for**: Most colors follow a pattern, but specific colors need tweaks. Great for apps with custom components that need additional color palettes.

---

#### Example 4: Multiple themes with different defaults

```scss
@use "@cpangular/ng-material-theme" as theming;

@include theming.core();

// Light theme - subtle, high contrast
@include theming.createTheme(
  "light",
  (
    mode: "light",
    blends: (
      darker-1: 90%,
      lighter-1: 90%,
    ),
    contrast-blends: (
      default: 95% // Higher contrast for light theme,,
    ),
    colors: (
      primary: "#6200ee",
      secondary: "#03dac6",
    ),
  ),
  $is-default: true
);

// Dark theme - intense, lower contrast
@include theming.createTheme(
  "dark",
  (
    mode: "dark",
    blends: (
      darker-1: 80%,
      // More intense darks for dark theme
      lighter-1: 85%,
    ),
    contrast-blends: (
      default: 85% // Lower contrast for dark theme,,
    ),
    colors: (
      primary: (
        value: "#bb86fc",
        blend-darker-1: 75% // Even more intense for dark primary,,
      ),
      secondary: "#03dac6",
    ),
  )
);
```

**Best for**: Different visual strategies for different themes.

---

**TypeScript runtime usage**:

#### Runtime Example 1: Minimal configuration

```typescript
import { Component } from "@angular/core";
import { NgMaterialThemeService } from "@cpangular/ng-material-theme";

@Component({
  selector: "app-root",
  template: `
    <button (click)="createSimpleTheme()">Simple Theme</button>
    <button (click)="toggleMode()">Toggle Mode</button>
  `,
})
export class AppComponent {
  constructor(private themeService: NgMaterialThemeService) {}

  createSimpleTheme() {
    // Simplest form - just colors (same in light/dark)
    const themeCSS = this.themeService.createRuntimeTheme("simple", {
      colors: {
        primary: "#ff5722",
        secondary: "#4caf50",
      },
    });

    // Uses all built-in defaults for blends/opacities/contrast-blends
    this.themeService.setTheme("simple");
  }

  toggleMode() {
    const current = this.themeService.currentMode();
    this.themeService.setMode(current === "light" ? "dark" : "light");
  }
}
```

---

#### Runtime Example 1b: Light/Dark variations

```typescript
createAdaptiveTheme() {
  // Use array [light, dark] for different colors per mode
  const themeCSS = this.themeService.createRuntimeTheme("adaptive", {
    colors: {
      primary: ["#6200ee", "#bb86fc"], // Deep purple in light, light purple in dark
      secondary: ["#03dac6", "#00e5ff"], // Teal in light, cyan in dark
      tertiary: "#ff4081", // Same in both modes
    },
  });

  this.themeService.setTheme("adaptive");
}
```

---

#### Runtime Example 2: Theme-level configuration

```typescript
createBrandedTheme() {
  // Set custom defaults that apply to ALL palettes
  const themeCSS = this.themeService.createRuntimeTheme('branded', {
    // Theme-wide defaults
    blends: {
      'darker-1': '85%',
      'lighter-1': '92%'
    },
    opacities: {
      opacity1: '8%',
      opacity2: '15%',
      opacity5: '50%'
    },
    contrastBlends: {
      'default': '95%'
    },

    // All palettes inherit these defaults
    // Can use single values or [light, dark] arrays
    colors: {
      primary: ['#6200ee', '#bb86fc'],
      secondary: '#03dac6', // Same in both modes
      tertiary: ['#ff4081', '#f48fb1']
    },
    density: 0
  });

  // Save to database for persistence
  localStorage.setItem('branded-theme-css', themeCSS);
  this.themeService.setTheme('branded');
}
```

---

#### Runtime Example 3: Per-palette overrides

```typescript
createCustomTheme() {
  // Theme defaults + selective per-palette overrides
  const themeCSS = this.themeService.createRuntimeTheme('custom', {
    // Theme-wide defaults
    blends: {
      'darker-1': '88%',
      'lighter-1': '90%'
    },
    opacities: {
      opacity1: '10%',
      opacity2: '20%'
    },
    contrastBlends: {
      default: '90%'
    },

    colors: {
      primary: {
        value: '#ff5722',
        // Override only specific values for primary
        'blend-darker-1': '85%',  // Different from theme default
        opacity1: '12%'           // Different from theme default
      },
      secondary: '#4caf50',  // Uses all theme defaults
      tertiary: {
        value: '#2196f3',
        opacity5: '60%'  // Override just this one
      }
    },
    density: -1
  });

  this.themeService.setTheme('custom');
}
```

---

#### Runtime Example 4: Dynamic user customization with light/dark

```typescript
createUserTheme(userPreferences: any) {
  // Allow user to customize at both levels with light/dark support
  const themeCSS = this.themeService.createRuntimeTheme('user-custom', {
    // User sets theme-wide preferences
    blends: {
      'darker-1': userPreferences.globalDarkerBlend || '90%'
    },
    opacities: {
      opacity1: userPreferences.globalOpacity1 || '10%'
    },

    colors: {
      primary: {
        // Support light/dark arrays in object notation too!
        value: [userPreferences.primaryColorLight, userPreferences.primaryColorDark],
        // User can fine-tune primary specifically
        'blend-darker-1': userPreferences.primaryDarkerBlend
      },
      secondary: userPreferences.secondaryColor, // Single value (same in both modes)

      // Custom palettes (not used by Material, but available for custom components)
      brand: userPreferences.brandColor,
      accent: [userPreferences.accentLight, userPreferences.accentDark],
      status: {
        value: userPreferences.statusColor,
        opacity5: '60%'  // Custom palette can have overrides too
      }
    }
  });

  // Persist to database
  await this.saveThemeToServer({
    name: 'user-custom',
    css: themeCSS,
    userId: this.currentUserId
  });

  this.themeService.setTheme('user-custom');
}
```

---

### Step 15: Migration Guide

**File**: `projects/ng-material-theme/MIGRATION.md`

Guide for upgrading from old version.

````markdown
# Migration Guide

## Breaking Changes

### SCSS API Changes

- Old: `@include ng-material-theme.default-theme($config)`
- New: `@include theming.createTheme('name', $config, $is-default: true)`

### Color Structure Changes

- M3's 27-tone palette replaced with practical variants
- New variants: lighter/darker (5 levels), mode-relative, tints (7 levels), contrast colors

### Hierarchical Configuration (NEW)

Theme-level defaults with optional per-palette overrides:

- **Theme-level defaults**: Set `blends`, `opacities`, `contrast-blends` once at theme level
- **Per-palette overrides**: Override specific values only where needed
- **Fallback chain**: Palette override → theme default → built-in default

```scss
// OLD: Repeat values for every palette
colors: (
  primary: (value: '#6200ee', blend-darker-1: 90%, opacity1: 10%),
  secondary: (value: '#03dac6', blend-darker-1: 90%, opacity1: 10%),
  tertiary: (value: '#bb86fc', blend-darker-1: 90%, opacity1: 10%)
)

// NEW: Set once at theme level, override only where different
blends: (darker-1: 90%),
opacities: (opacity1: 10%),
colors: (
  primary: '#6200ee',     // inherits theme defaults
  secondary: '#03dac6',   // inherits theme defaults
  tertiary: (
    value: '#bb86fc',
    opacity1: 15%         // override just this one
  )
)
```
````

### Per-Palette Configuration

NEW: Each color palette now supports independent blend/opacity/contrast-blend configuration:

```scss
colors: (
  primary: (
    value: "#6200ee",
    blend-darker-1: 85%,
    // per-palette blend
    opacity2: 25%,
    // per-palette opacity (opacity-2)
    contrast-blend: 90% // per-palette contrast blend,,
  )
);
```

### CSS Variable Naming Changes

- OOP-like structure: `--` separates namespaces, `-` separates words
- Old: `--theme-primary-color`
- New: `--color--primary`
- Blend vars: `--color--primary--blend--darker-1` (namespace structure)
- Opacity vars: `--color--primary--opacity--1` (1-indexed)
- Contrast blend: `--color--primary--contrast-blend`

### Runtime API Changes

- New methods: `createRuntimeTheme()`, `saveTheme()`, `preloadTheme()`
- Hierarchical configuration: theme-level defaults + per-palette overrides
- Both SCSS and runtime API support same configuration structure

## Migration Steps

1. Update SCSS imports
2. Convert theme definitions to new format with hierarchical configuration
3. Extract common blend/opacity/contrast-blend values to theme level
4. Keep per-palette overrides only where colors differ from defaults
5. Update any custom CSS referencing old variable names
6. Test runtime theme generation if used

## Configuration Examples

### Before (old approach):

```scss
@include ng-material-theme.default-theme(
  (
    primary: "indigo",
    accent: "pink",
  )
);
```

### After (new approach with theme-level defaults):

```scss
@use "@cpangular/ng-material-theme" as theming;

@include theming.core();

@include theming.createTheme(
  "default",
  (
    // Set defaults once for all palettes
    blends: (darker-1: 90%, lighter-1: 90%),
    opacities: (1: 10%, 2: 20%),
    colors: (primary: "#3f51b5", secondary: "#e91e63")
  ),
  $is-default: true
);
```

````

---

### Step 16: README Update

**File**: `projects/ng-material-theme/README.md`

Complete documentation of new system.

```markdown
# @cpangular/ng-material-theme

Complete theming system for Angular Material 21+ with runtime theme generation and per-palette customization.

## Features

- ✅ Practical color variants (lighter/darker, mode-relative, tints, contrast)
- ✅ Hierarchical configuration (theme-level defaults + per-palette overrides)
- ✅ Runtime theme generation (build-time identical output)
- ✅ CSS `color-mix()` for all color operations (modern browsers only)
- ✅ CSS `@property` for smooth color animations
- ✅ OOP-like CSS variable naming convention
- ✅ Angular Material M3 integration
- ✅ Database-persistable themes

## Installation

```bash
npm install @cpangular/ng-material-theme
````

## Quick Start

[... complete documentation with examples of per-palette customization ...]

## CSS Variable Reference

### Base Colors

- `--color--primary` - Primary brand color (user sets)
- `--color--secondary` - Secondary color
- `--color--tertiary` - Tertiary color
- `--color--neutral` - Neutral/surface colors
- `--color--error` - Error color

### Per-Palette Configuration Variables

Each palette has independent blend, opacity, and contrast-blend variables:

```css
/* Primary palette blend percentages */
--color--primary--blend--darker-2: 80%;
--color--primary--blend--darker-1: 90%;
--color--primary--blend--lighter-1: 90%;
--color--primary--blend--lighter-2: 80%;

/* Primary palette opacities (1-indexed) */
--color--primary--opacity--1: 10%;
--color--primary--opacity--2: 20%;
/* ... through opacity--7 */

/* Primary contrast blends */
--color--primary--contrast-blend--emphasized: 100%;
--color--primary--contrast-blend: 90%;
--color--primary--contrast-blend--deemphasized: 80%;
--color--primary--contrast-blend--disabled: 50%;
```

### Color Variants

[... document all generated variants ...]

## API Reference

[... complete API documentation ...]

```

---

## Verification Tests

### Build-Time Tests
1. ✅ SCSS compiles without errors
2. ✅ All palettes generate complete variant sets
3. ✅ Per-palette blend/opacity/contrast-blend variables output correctly
4. ✅ @property declarations present for all variables
5. ✅ Material M3 bridge maps correctly to custom tokens
6. ✅ Light/dark mode selectors work
7. ✅ Density system generates correctly

### Runtime Tests
8. ✅ `createRuntimeTheme()` generates valid CSS
9. ✅ Runtime CSS matches build-time output
10. ✅ Per-palette customization works at runtime
11. ✅ `saveTheme()` exports theme CSS
12. ✅ Theme switching updates DOM correctly
13. ✅ Mode switching (light/dark) updates correctly

### Color System Tests
14. ✅ Color-mix() formulas work in target browsers
15. ✅ Lighter/darker variants reference correct per-palette blend vars
16. ✅ Tints reference correct per-palette opacity vars
17. ✅ Contrast colors calculate correctly (black/white)
18. ✅ Contrast variants reference correct per-palette contrast-blend vars
19. ✅ User contrast override works (`--color--primary--contrast--base-override`)
20. ✅ Mode-relative variants invert in dark mode

### Naming Convention Tests
21. ✅ OOP structure maintained: `--color--primary--blend--darker-1`
22. ✅ Namespace consistency: all blend/opacity/contrast-blend use `--` separator
23. ✅ Default values omit suffix: `--color--primary--contrast-blend` not `--color--primary--contrast-blend--default`

### Hierarchical Configuration Tests
24. ✅ Theme-level defaults generate correctly (`--theme--blend--*`, `--theme--opacity--*`, `--theme--contrast-blend--*`)
25. ✅ Per-palette override variables generate when specified (`--color--primary--blend--darker-1-override`)
26. ✅ Computed variables use correct fallback chain: `var(--override, var(--theme-default))`
27. ✅ Palettes without overrides inherit theme defaults correctly
28. ✅ Palettes with overrides use override values, fallback to theme defaults for unset properties
29. ✅ Theme-level @property declarations present for animations
30. ✅ Override @property declarations present for each palette
31. ✅ Runtime generator outputs theme defaults correctly
32. ✅ Runtime generator outputs override variables only when specified

---

## Implementation Order

1. **Core color system** (Steps 1-4): Color variants, derivation, contrast, @property
2. **Theme infrastructure** (Steps 5-9): Typography, density, Material bridge, theme mixin, public API
3. **Build system** (Step 10): SCSS compilation pipeline
4. **Runtime system** (Steps 11-13): Runtime generator, service, utilities
5. **Documentation** (Steps 14-16): Examples, migration guide, README

Each step is independent within its section, but cross-section dependencies exist (e.g., Step 11 depends on Steps 1-4 for color system logic).

---

## Key Design Decisions

1. **Modern browsers only**: Chrome 111+, Firefox 113+, Safari 16.4+ (March 2023+)
2. **Hierarchical configuration**: Theme-level defaults + per-palette overrides with fallback chain for DRY configuration
3. **OOP-like naming**: `--` as namespace separator (like `.`), `-` for word separation
4. **Runtime = build-time**: JavaScript generator produces identical CSS to SCSS
5. **Practical variants**: Replaced M3's 27 tones with useful everyday variants
6. **CSS-only color operations**: `color-mix()` in OKLab, no JavaScript parsing needed at runtime
7. **User contrast override**: Always allow `--color--{name}--contrast--base-override`
8. **Breaking changes acceptable**: Clean slate for modern architecture
9. **Database persistence**: Generated CSS can be serialized and stored
10. **Default without suffix**: Middle/default values omit suffix (e.g., `--color--primary--contrast` not `--main`)
11. **Fallback chain**: `palette-override → theme-default → built-in-default` enables flexible configuration
12. **Custom palettes supported**: Define any number of additional palettes beyond Material's standard five
```
