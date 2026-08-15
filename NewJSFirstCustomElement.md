

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

## Step 8: Create wireFeatures.js

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

## Step 9: Create def.js

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
