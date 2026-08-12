# New Custom Element Instructions

## Introduction

This document provides step-by-step instructions for creating a **brand new** custom element project that extends `ElementMaker`. Custom elements built this way inherit a catalog of composable features (form association, attribute sourcing, roundabout reactive wiring, CSS reflection) out of the box, and only need to declare what's unique to them.

**Note:** This guide is for **custom elements** — concrete components registered with `customElements.define()`. It does NOT apply to:
- Custom element features (composable behavior classes injected into elements) — see [NewCustomElementFeature.md](./NewCustomElementFeature.md)
- Enhancements (declarative behaviors attached to existing elements via attributes) — see [NewEnhancementInstructions.md](./NewEnhancementInstructions.md)

## Reference Implementations

- **[time-ticker](https://github.com/bahrus/time-ticker)** — A non-visual custom element that fires events periodically. Demonstrates extending `ElementMaker`, a custom feature (`TimeTicker`), roundabout wiring via `defRef.json`, and the `def.js` / `wireFeatures.js` pattern.
- **[scratch-box](https://github.com/bahrus/scratch-box)** — A visual, form-associated custom element with a declarative shadow DOM template and zero custom element JavaScript. Demonstrates `cede` script definition from a static `root.html` and JSON feature configuration.

## Prerequisites

- Node.js installed
- npm installed
- `ncu` (npm-check-updates) installed globally: `npm install -g npm-check-updates`
- Chrome 146+ for testing (scoped custom element registry support required)

## Step 1: Initialize the Project

1. Create a new repository (e.g., `my-element`)
2. Run `npm init` or create a `package.json` manually
3. Add the `types` submodule:
   ```bash
   git submodule add https://github.com/bahrus/types.git types
   ```

## Step 2: Configure package.json

```json
{
  "name": "my-element",
  "version": "0.0.0",
  "description": "Description of what the element does",
  "type": "module",
  "main": "def.js",
  "scripts": {
    "build": "node defRef.mjs > defRef.json",
    "serve": "node ./node_modules/spa-ssi/serve.js",
    "test": "playwright test",
    "update": "ncu -u && npm install",
    "safari": "npx playwright wk http://localhost:8000",
    "chrome": "npx playwright cr http://localhost:8000"
  },
  "devDependencies": {
    "@playwright/test": "1.60.0",
    "spa-ssi": "0.0.27"
  },
  "dependencies": {
    "assign-gingerly": "0.0.48",
    "el-maker": "0.0.0"
  }
}
```

**Notes:**
- Use exact versions, not ranges (no `^` or `~`)
- `el-maker` brings in `roundabout-lib`, `truth-sourcer`, `face-up`, and `be-reflective` transitively
- Only add direct dependencies for features unique to your element
- Run `npm run update` after creating package.json to install dependencies

## Step 3: Create Type Definitions

Create `types/[project-name]/types.d.ts` with the element's property interface:

```typescript
/**
 * Properties specific to this custom element
 */
export interface ElementProps {
    // Properties unique to this element
    myProp: string;
    disabled: boolean;
}

/**
 * Full property set including internal state
 */
export interface AllProps extends ElementProps {
    idx: number;
    item: any;
}

export type T = AllProps;
```

**Key points:**
- `ElementProps` — the public API specific to this element
- `AllProps` — includes internal/computed state managed by roundabout
- Export `T` as a convenience alias for use in `defRef.mjs` type annotations

## Step 4: Create the Element Class

Create `[element-name]-element.js` (e.g., `my-element-element.js`):

```javascript
import { ElementMaker } from 'el-maker/ElementMaker.js';

export class MyElementElement extends ElementMaker {
    static supportedFeatures = {
        ...ElementMaker.supportedFeatures,
        myFeature: {},
    };
}
```

**Key patterns:**
- Extends `ElementMaker` — inherits `propagator`, `#internals`, `attachInternals()`, and all shared features (`roundabout`, `truthSourcer`, `faceUp`, `reflector`, `templateMaker`)
- Spreads `ElementMaker.supportedFeatures` to inherit the base feature slots
- Only declares additional feature slots unique to this element
- No need for `static formAssociated = true` — `FaceUp.onAssigned` sets it automatically
- No constructor needed unless you have element-specific initialization

## Step 5: Create the Element-Specific Feature (if any)

If your element has unique behavior beyond what the inherited features provide, create a custom element feature following [NewCustomElementFeature.md](./NewCustomElementFeature.md).

For example, `time-ticker` has a `TimeTicker.js` feature that provides precise drift-correcting ticking.

## Step 6: Create defRef.mjs (Roundabout Configuration)

Create `defRef.mjs` — this generates the JSON configuration that drives the roundabout reactive wiring:

```javascript
//@ts-check

/** @import {RAConfig} from './types/roundabout/types' */
/** @import {T} from './types/[project-name]/types' */
/** @import {AttrPatterns} from './types/assign-gingerly/types' */

/**
 * @type {{ [K in keyof T]: K }}
 */
const props = {
    myProp: 'myProp',
    disabled: 'disabled',
    // ... all properties that roundabout manages
};

/**
 * @type {RAConfig<T,T,T>}
 */
export const raConfig = {
    propagate: /** @type {Array<keyof T>} */ (Object.keys(props)),
    compacts: {
        // Reactive shorthand rules
    },
    merges: [
        // Reactive assignment rules
    ],
    yields: {
        // Derived property rules
    }
};

/**
 * @type {AttrPatterns<T>}
 */
const withAttrs = {
    // Attribute-to-property mappings for truthSourcer
};

export const cef = {
    features: {
        roundabout: {
            customData: {
                raConfig
            },
            withAttrs
        }
    }
};

export function render() {
    return JSON.stringify(cef, null, 4);
}

console.log(render());
```

**Key patterns:**
- The `props` object provides type-safe property name references (keys must be in `T`, values must equal the key)
- `raConfig` defines the reactive wiring: compacts (shorthand rules), merges (assignment rules), yields (derived values)
- `withAttrs` maps HTML attributes to properties (used by `truthSourcer`)
- The `render()` function outputs JSON for the build step

Run `npm run build` to generate `defRef.json`.

## Step 7: Create wireFeatures.js

This module resolves async fallback spawns and calls `assignFeatures` with the element-specific configuration:

```javascript
import { MyFeature } from './MyFeature.js';
import { resolveAndAssignFeatures } from 'assign-gingerly/resolveAndAssignFeatures.js';

export async function wireFeatures(ElementClass, cfg) {
    const { roundabout } = cfg.features;
    const { customData, withAttrs } = roundabout;

    await resolveAndAssignFeatures(ElementClass, {
        myFeature: { spawn: MyFeature },
        truthSourcer: {
            callbackForwarding: ['connectedCallback', 'attributeChangedCallback'],
        },
        faceUp: {
            customData: { integrateWithRoundabout: true },
            callbackForwarding: [
                'connectedCallback', 'disconnectedCallback',
                'formDisabledCallback', 'formResetCallback', 'formStateRestoreCallback',
            ],
        },
        roundabout: {
            customData,
            withAttrs,
            callbackForwarding: ['connectedCallback'],
        },
    });
}
```

**Key patterns:**
- Only eagerly imports the feature(s) unique to this element
- Inherited features (`truthSourcer`, `faceUp`, `roundabout`, `reflector`) use their async `fallbackSpawn` from `ElementMaker` — no explicit `spawn` needed
- `resolveAndAssignFeatures` resolves async fallback spawns before calling `assignFeatures`, ensuring `onAssigned` hooks (like `FaceUp.onAssigned` setting `static formAssociated = true`) run before `define()`
- `callbackForwarding` and `customData` are per-element configuration that gets unioned with the author defaults from `supportedFeatures`

## Step 8: Create def.js

The side-effect module that registers the custom element with its canonical tag name and default feature wiring:

```javascript
import { MyElementElement } from './my-element-element.js';
import { wireFeatures } from './wireFeatures.js';
import defRef from './defRef.json' with { type: 'json' };

await wireFeatures(MyElementElement, defRef);
customElements.define('my-element', MyElementElement);
```

**Key patterns:**
- `def.js` = "default define" — centralizes all side effects
- Imports the JSON config and passes it to `wireFeatures`
- Consumers who want a different tag name, scoped registry, or DI overrides write their own version of this file

## Step 9: Create imports.html

```html
<script type=importmap>
    {
        "imports": {
            "assign-gingerly/": "/node_modules/assign-gingerly/",
            "el-maker/": "/node_modules/el-maker/",
            "face-up/": "/node_modules/face-up/",
            "on-to-me/": "/node_modules/on-to-me/",
            "roundabout-lib/": "/node_modules/roundabout-lib/",
            "[project-name]/": "/",
            "truth-sourcer/": "/node_modules/truth-sourcer/"
        }
    }
</script>
```

**Notes:**
- Include all transitive dependencies that are loaded in the browser
- The project itself maps to `/` for local development

## Step 10: Set Up Auto-Build Hook

Create `.kiro/hooks/auto-build-config.kiro.hook`:

```json
{
    "name": "Auto-build Configuration",
    "version": "1.0.0",
    "description": "Automatically runs npm run build when defRef.mjs is saved",
    "when": {
        "type": "fileEdited",
        "patterns": ["**/*.mjs"]
    },
    "then": {
        "type": "askAgent",
        "prompt": "A .mjs file was changed. Run npm run build to regenerate the output."
    }
}
```

## Step 11: Create Test HTML

Create `tests/test1.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test - my-element</title>
    <!-- #include virtual="/imports.html" -->
    <script type=module>
        import '[project-name]/def.js';
    </script>
</head>
<body>
    <my-element></my-element>
</body>
</html>
```

## Architecture Overview

```
[project-name]/
├── .kiro/
│   ├── hooks/
│   │   └── auto-build-config.kiro.hook
│   └── steering/
│       └── project-context.md
├── .vscode/
│   └── settings.json
├── types/                              (git submodule)
│   └── [project-name]/
│       └── types.d.ts
├── [element-name]-element.js           (element class — extends ElementMaker)
├── [FeatureName].js                    (element-specific feature, if any)
├── wireFeatures.js                     (resolves + assigns features)
├── def.js                              (side-effect: wire + define)
├── defRef.mjs                          (build script → defRef.json)
├── defRef.json                         (generated — roundabout config)
├── imports.html                        (import map for browser)
├── package.json
├── tests/
│   └── test1.html
└── README.md
```

## The Three-File Pattern

Every custom element package exports three key modules:

| File | Role | Side effects? |
|------|------|---------------|
| `[element-name]-element.js` | Class definition + `supportedFeatures` declaration | No |
| `wireFeatures.js` | Resolves spawns + calls `assignFeatures` with config | No |
| `def.js` | Imports config, wires features, calls `define()` | Yes |

This separation enables:
- **Different tag names** — write your own `def.js` with a different `define()` call
- **Scoped registries** — call `scopedRegistry.define()` instead of `customElements.define()`
- **DI / testing** — call `resolveAndAssignFeatures` directly with mock spawns
- **Declarative definition** — use `defineWithFeatures` from a cede script without any JS class code

## What ElementMaker Provides

By extending `ElementMaker`, your element inherits:

| Feature | What it does |
|---------|-------------|
| `roundabout` | Reactive property wiring (compacts, merges, yields, actions) |
| `truthSourcer` | Attribute → property synchronization via `withAttrs` |
| `faceUp` | Form association (value, validation, reset, state restoration) |
| `reflector` | CSS custom state reflection via `ElementInternals` |
| `templateMaker` | HTML template instantiation and shadow DOM management |

Plus infrastructure:
- `propagator` (EventTarget) for inter-feature communication
- `#internals` (ElementInternals) shared via `getSharedContext`
- `attachInternals()` called in the constructor
- Async `fallbackSpawn` for lazy-loading all feature implementations

## Elements Without HTML (Non-Visual)

For elements like `time-ticker` that have no HTML template or shadow DOM, simply don't activate the `templateMaker` feature in `wireFeatures.js`. The feature remains declared in `supportedFeatures` (inherited from `ElementMaker`) but is never instantiated because no `assignFeatures` call references it.

## Elements With HTML: Declarative Shadow DOM Without a JS Class

For visual elements you can skip the `def.js` / `wireFeatures.js` / custom element class entirely and register the element with a `cede` script that extends `el-maker`. The scratch-box checkbox is the reference implementation of this pattern: it is built from a single static HTML file (`root.html`) and a JSON feature configuration (`el-maker.json`).

### How scratch-box is structured

| File | Role |
|------|------|
| `root.html` | Declarative shadow DOM template, styles, inner form, and enhancement metadata. |
| `el-maker.mjs` | Type-checked configuration generator for the ElementMaker features. |
| `el-maker.json` | Generated JSON consumed by the `cede` script. |

### The template file (`root.html`)

The host element declares its shadow root declaratively, then contains everything needed inside the shadow DOM, including styles, a form element, and a `<be-hive>` block that wires up declarative enhancements:

```html
<scratch-box>
    <template shadowrootmode=open>
        <style adopt>
            :host[hidden] { display:none; }
            :host { display:block; background-color: HSL(250, 22%, 41%); padding: 1vw; }
            /* ... remaining styles ... */
        </style>
        <form class="checkbox-wrapper">
            <input 🪢 name=value type="checkbox" id="option"/>
            <link itemprop=value>
            <label for="option">
                <slot name="labelTxt">scratch-box</slot>
                <svg viewBox="0 0 60 40" aria-hidden="true" focusable="false">
                    <path d="M21,2 ..." stroke-width="4" fill="none" stroke-dasharray="270" stroke-dashoffset="270"></path>
                </svg>
            </label>
        </form>

        <be-hive>
            <script type=emc-parser
                    src="be-hive/parsers/parse-grouped-capture-statements.js"
                    parser-name=parse-grouped-capture-statements></script>
            <script type=emc
                    src="be-bound/🪢.json"
                    wait-for-parsers=parse-grouped-capture-statements></script>
        </be-hive>
    </template>
</scratch-box>
```

Key details:

- `shadowrootmode=open` gives the element a declarative shadow DOM that the browser attaches before any script runs.
- The internal checkbox is named `value` and carries the `🪢` emoji attribute. That marks it for the `be-bound` enhancement so the host `value` property and the inner checkbox `checked` state stay in sync.
- `<link itemprop=value>` lets the `faceUp` feature expose the element as a form-associated value without any JS wiring.
- The `<slot name="labelTxt">` lets users provide the label from light DOM via `<span slot="labelTxt">...</span>`.
- `<style adopt>` with `adopt` ensures the styles are adopted into the shadow root instead of a separate `<style>` element.

### The feature configuration (`el-maker.mjs` → `el-maker.json`)

Instead of `wireFeatures.js`, the features are declared in JSON and consumed by the `cede` script. The source file is type-checked TypeScript via JSDoc comments and outputs `el-maker.json`:

```javascript
//@ts-check

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import {akaMethods as m, aka, builtInEmoji} from 'assign-gingerly/DX/emojis.js';

/** @import {FontFaceFeatureConfig} from './types/font-face-feature/types'; */
/** @import {EndUserProps} from './types'; */
/** @import {RoundaboutOptions} from './types/roundabout/types' */
/** @import {ElMakerConfig} from './types/el-maker/types' */

const props = {
    value: 'value',
    name: 'name',
    disabled: 'disabled',
};

const fontFaceFeatureConfig = {
    fontFamilies: [
        {
            name: 'Indie Flower',
            url: 'https://fonts.gstatic.com/s/indieflower/v24/m8JVjfNVeKWVnh3QMuKkFcZVZ0uH5dI.woff2',
            descriptors: {
                style: 'normal',
                weight: '400',
                unicodeRange: '...',
            },
        },
        // additional font-face descriptors...
    ],
};

const raConfig = {
    assignOptions: {
        akaMethods: {
            '🔍': m['🔍']
        }
    },
    merges: [
        {
            ifKeyIn: ['disabled'],
            assign: {
                '?.shadowRoot?.🔍?.input?.disabled': '?.disabled',
            }
        },
    ],
};

/** @type {ElMakerConfig<EndUserProps>} */
const features = {
    assignFeatures: {
        faceUp: { customData: { integrateWithRoundabout: true } },
        truthSourcer: {},
        roundabout: { customData: { raConfig } },
        fontMgr: { customData: { fontFaceFeatureConfig } },
        templateMaker: {},
    },
};

export function render() {
    return JSON.stringify(features, null, 4);
}

const __filename = fileURLToPath(import.meta.url);
const outputFile = __filename.replace(/\.mjs$/, '.json');
writeFileSync(outputFile, render(), 'utf8');
```

Run `node el-maker.mjs` (or `npm run build-el-maker` if your `package.json` includes a watch script) to regenerate `el-maker.json`.

### Registering the element in a page

The element is defined by a `cede` script. Include `imp-h` (or another template importer) to fetch `root.html`, and `el-maker/def.js` to provide the base class machinery:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>scratch-box demo</title>
    <script type=module>
        import 'be-hive/be-hive.js';
        import 'imp-h/imp-h.js';
        import 'el-maker/def.js';
    </script>
</head>
<body>
    <scratch-box imp-h="scratch-box/root.html">
        <span slot=labelTxt>Create demo</span>
        <script type=cede data-extends=el-maker src="scratch-box/el-maker.json"></script>
    </scratch-box>
</body>
</html>
```

Notes:

- `imp-h` observes the `imp-h` attribute and imports the declarative shadow DOM template from `root.html`.
- The `<script type=cede data-extends=el-maker>` tells the mount observer to register the host element by extending `ElementMaker` and applying the feature JSON.
- No JS class file is required because all behavior is provided by the configured ElementMaker features and the declarative shadow DOM.

### When to use this pattern

Use the declarative shadow DOM + `cede` pattern when:

- The element is primarily visual and static.
- You want server-side rendering and progressive enhancement with no client-side custom element class.
- Feature configuration (form association, attribute reflection, reactive wiring, fonts) is sufficient for all behavior.

When you need custom runtime behavior beyond the shared features, fall back to the class-based pattern in the earlier sections and add your own feature.

## Tips

- **Call `wireFeatures` before `customElements.define()`** — features must be on the prototype before instances exist
- **Use `@ts-check`** in `.mjs` files — catches type errors in the build configuration
- **Run `npm run build` after editing `defRef.mjs`** — the JSON must be regenerated
- **Don't eagerly import inherited features** — let `fallbackSpawn` lazy-load them
- **Keep `def.js` minimal** — it's the canonical handshake; consumers can deviate as needed
