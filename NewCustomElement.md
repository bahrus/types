# New Custom Element Instructions

## Introduction

This document provides step-by-step instructions for creating a **brand new** custom element project that extends `ElementMaker`. Custom elements built this way inherit a catalog of composable features (form association, attribute sourcing, roundabout reactive wiring, CSS reflection) out of the box, and only need to declare what's unique to them.

**Note:** This guide is for **custom elements** — concrete components registered with `customElements.define()`. It does NOT apply to:
- Custom element features (composable behavior classes injected into elements) — see [NewCustomElementFeature.md](./NewCustomElementFeature.md)
- Enhancements (declarative behaviors attached to existing elements via attributes) — see [NewEnhancementInstructions.md](./NewEnhancementInstructions.md)

## Reference Implementation

- **[time-ticker](https://github.com/bahrus/time-ticker)** — A non-visual custom element that fires events periodically. Demonstrates extending `ElementMaker`, a custom feature (`TimeTicker`), roundabout wiring via `defRef.json`, and the `def.js` / `wireFeatures.js` pattern.

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

## Elements With HTML (Coming Soon)

For elements that render static or dynamic HTML, the `templateMaker` feature handles template instantiation and shadow DOM attachment. Documentation for this pattern — including how to declare templates, bind data, and integrate with roundabout — will be added in a future update.

## Tips

- **Call `wireFeatures` before `customElements.define()`** — features must be on the prototype before instances exist
- **Use `@ts-check`** in `.mjs` files — catches type errors in the build configuration
- **Run `npm run build` after editing `defRef.mjs`** — the JSON must be regenerated
- **Don't eagerly import inherited features** — let `fallbackSpawn` lazy-load them
- **Keep `def.js` minimal** — it's the canonical handshake; consumers can deviate as needed
