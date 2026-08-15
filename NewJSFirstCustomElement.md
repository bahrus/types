

## Reference Implementations

- **[time-ticker](https://github.com/bahrus/time-ticker)** — A non-visual custom element that fires events periodically. Demonstrates extending `ElementMaker`, a custom feature (`TimeTicker`), roundabout wiring via `defRef.json`, and the `def.js` / `wireFeatures.js` pattern.


## Step 5: Create the Element Class, if the complexity is too much for a "code-free" solution, which is probably the reason the custom element is js-first.


Create `[element-name].js` (e.g., `my-element.js`):

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

## Optional Step 6: Create the Element-Specific Feature (if any)

If your element has unique behavior beyond what the inherited features provide, but the functionality is more than trivial in implementing, consider creating a custom element feature for that functionality, following [NewCustomElementFeature.md](./NewCustomElementFeature.md).

For example, `time-ticker` has a `TimeTicker.js` feature that provides precise drift-correcting ticking.

If the feature proves useful beyond that one component, it is probably a good idea to move that feature into the el-maker package.

## Step 7: Create defRef.mjs (Roundabout Configuration)

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

## Step 8:  build script

Add the following to package.json:

```JSON
  "scripts": {
    "build": "node defRef.mjs > defRef.json",
   ...
  },
```

## Step 9: Create wireFeatures.js

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

## Step 10: Create def.js

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


<details>
    <summary>Kiro only</summary>


## Step 10.5: Set Up Auto-Build Hook

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

</details>

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

## Tips

- **Call `wireFeatures` before `customElements.define()`** — features must be on the prototype before instances exist
- **Use `@ts-check`** in `.mjs` files — catches type errors in the build configuration
- **Run `npm run build` after editing `defRef.mjs`** — the JSON must be regenerated
- **Don't eagerly import inherited features** — let `fallbackSpawn` lazy-load them
- **Keep `def.js` minimal** — it's the canonical handshake; consumers can deviate as needed
