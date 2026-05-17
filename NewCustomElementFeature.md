# New Custom Element Feature Instructions

## Introduction

This document provides step-by-step instructions for creating a **brand new** custom element feature project. Custom Element Features provide dependency injection of composable feature classes onto custom element prototypes via lazy getters. They allow decomposing large components into smaller, testable units without mixins or subclassing.

**Note:** This guide is specifically for **custom element features** (composable behavior injected into custom elements via `assignFeatures`). It does NOT apply to enhancements (which use `be-hive` and `mount-observer` to attach behavior to existing elements via attributes). For enhancements, see [NewEnhancementInstructions.md](./NewEnhancementInstructions.md).

## What is a Custom Element Feature?

A custom element feature is a class that:

1. Gets lazily instantiated as a getter-only property on a custom element's prototype.
2. Receives the host element, a spawn context, and optional initial values in its constructor.
3. Can be swapped out for mocks in tests without subclassing.
4. Integrates with `assignGingerly` automatically — because the property is getter-only, `assignGingerly` merges into the spawned instance.
5. Supports async lazy-loading of the implementation.
6. Can parse element attributes into initial values via `withAttrs`.

## Reference Implementation

- **[truth-sourcer](https://github.com/bahrus/truth-sourcer)** — The world's first custom element feature
- **[be-reflective](https://github.com/bahrus/be-reflective)** — Demonstrates `callbackForwarding` and `getSharedContext` for features that need DOM context (computed styles)

## Prerequisites

- Node.js installed
- npm installed
- `ncu` (npm-check-updates) installed globally: `npm install -g npm-check-updates`
- Chrome 146+ for testing (scoped custom element registry support required)

## Step 1: Initialize the Project

1. Create a new repository (e.g., `truth-sourcer` or `my-feature`)
2. Run `npm init` or create a `package.json` manually
3. Add the `types` submodule:
   ```bash
   git submodule add https://github.com/bahrus/types.git types
   ```

## Step 2: Configure package.json

```json
{
  "name": "my-feature",
  "version": "0.0.0",
  "description": "Description of what the feature does",
  "type": "module",
  "main": "MyFeature.js",
  "scripts": {
    "serve": "node ./node_modules/spa-ssi/serve.js",
    "test": "playwright test",
    "update": "ncu -u && npm install",
    "safari": "npx playwright wk http://localhost:8000",
    "chrome": "npx playwright cr http://localhost:8000"
  },
  "devDependencies": {
    "assign-gingerly": "0.0.39",
    "@playwright/test": "1.60.0",
    "spa-ssi": "0.0.27"
  },
  "dependencies": {
  }
}
```

**Notes:**
- Use exact versions, not ranges (no `^` or `~`)
- `assign-gingerly` is a devDependency — the consuming custom element project brings it in
- Run `npm run update` after creating package.json to install dependencies

## Step 3: Create Type Definitions

Create `types/[project-name]/types.d.ts` with the feature structure:

```typescript
import { SpawnContext } from "../assign-gingerly/types";

/**
 * Configuration/properties that the feature exposes
 */
export interface FeatureProps {
    // Properties the feature manages
    myProp: string;
    anotherProp: number;
}

/**
 * Internal state (not exposed to consumers)
 */
export interface AllProps extends FeatureProps {
    host: WeakRef<Element>;
}

export type AP = AllProps;
export type PAP = Partial<AP>;

/**
 * Context passed to the feature constructor
 */
export interface FeatureSpawnContext extends SpawnContext {
    key: string;
    optIn: any;
    injection: any;
    featuresRegistry: any;
    shared?: any;
}
```

**Key points:**
- `FeatureProps` — the public API of the feature
- `AllProps` — includes internal state like a WeakRef to the host element
- The feature class does NOT need to extend any base class

## Step 4: Create the Feature Class

Create `[FeatureName].js` (e.g., `AttrMgr.js`):

```javascript
// @ts-check
/** @import {FeatureProps, AllProps, FeatureSpawnContext} from './types/[project-name]/types' */

/**
 * @implements {FeatureProps}
 */
class MyFeature {
    /** @type {WeakRef<Element> | undefined} */
    #host;

    /**
     * @param {Element} hostElement
     * @param {FeatureSpawnContext} ctx
     * @param {Partial<FeatureProps>} [initVals]
     */
    constructor(hostElement, ctx, initVals) {
        this.#host = new WeakRef(hostElement);
        if (initVals) {
            Object.assign(this, initVals);
        }
    }

    // Feature methods and properties here
}

export { MyFeature };
```

**Key patterns:**
- No base class — plain JavaScript class
- Constructor signature: `(hostElement, ctx, initVals)`
- Store host as a `WeakRef` to avoid preventing garbage collection
- Apply `initVals` via `Object.assign` in the constructor
- Use `@ts-check` with JSDoc type imports from the `types/` folder
- No compiled TypeScript — ship raw `.js` files

## Step 5: Create imports.html

```html
<script type=importmap>
    {
        "imports": {
            "assign-gingerly/": "/node_modules/assign-gingerly/",
            "[project-name]/": "/"
        }
    }
</script>
```

**Notes:**
- Import maps use trailing slashes for package-style resolution
- The feature project maps to `/` (root) for local development
- Only include packages actually needed

## Step 6: Create Test HTML

Create a test file (e.g., `tests/test1.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test - My Feature</title>
    <!-- #include virtual="/imports.html" -->
    <script type=module>
        import 'assign-gingerly/assignFeatures.js';
        import {MyFeature} from '[project-name]/MyFeature.js';

        // Define a test custom element that uses the feature
        class TestElement extends HTMLElement {
            static supportedFeatures = {
                myFeature: {
                    fallbackSpawn: MyFeature
                }
            };

            constructor() {
                super();
            }
        }

        // Inject the feature
        customElements.assignFeatures(TestElement, {
            myFeature: { spawn: MyFeature }
        });

        customElements.define('test-element', TestElement);
    </script>
</head>
<body>
    <test-element></test-element>
</body>
</html>
```

## Step 7: Configure VS Code

Create `.vscode/settings.json`:

```json
{
    "explorer.fileNesting.enabled": true
}
```

## Step 8: Set Up .kiro Directory

Create `.kiro/steering/project-context.md` to reference the shared types documentation:

```markdown
---
inclusion: auto
---

# Project Context

This project uses shared type definitions and documentation from the `types` submodule.

## Key References

#[[file:types/NewCustomElementFeature.md]]

## Coding Standards

#[[file:types/.kiro/steering/coding-standards.md]]
```

## Architecture Overview

```
[project-name]/
├── .kiro/
│   └── steering/
│       └── project-context.md
├── .vscode/
│   └── settings.json
├── types/                          (git submodule)
│   └── [project-name]/
│       └── types.d.ts
├── [FeatureName].js                (feature class - browser code)
├── imports.html                    (import map for browser)
├── package.json
├── tests/
│   └── test1.html
└── README.md
```

## How Custom Element Features Work

### The Consumer Side (Custom Element Author)

A custom element declares which feature "slots" it supports:

```javascript
// @ts-check
import 'assign-gingerly/assignFeatures.js';
import {MyFeature} from 'my-feature/MyFeature.js';

class MyElement extends HTMLElement {
    static supportedFeatures = {
        myFeature: {
            fallbackSpawn: MyFeature,
            // Optional: validate the spawned instance
            validateShape(instance) {
                return typeof instance.myMethod === 'function';
            }
        }
    };

    constructor() {
        super();
    }
}

// Inject feature implementations
customElements.assignFeatures(MyElement, {
    myFeature: { spawn: MyFeature }
});

customElements.define('my-element', MyElement);
```

### Lazy Instantiation

The feature is NOT instantiated until first property access:

```javascript
const el = document.createElement('my-element');
// Feature not yet instantiated

console.log(el.myFeature.myProp);
// NOW the feature is instantiated (lazy getter fires)
```

### Integration with assignGingerly

Because `assignFeatures` installs getter-only properties (no setter), `assignGingerly` automatically merges into the feature instance:

```javascript
import 'assign-gingerly/object-extension.js';

el.assignGingerly({
    myFeature: { myProp: 'updated value' }
});
// Merges into the existing feature instance
```

### Attribute Parsing with withAttrs

Features can declare attribute patterns to parse element attributes into `initVals`:

```javascript
customElements.assignFeatures(MyElement, {
    myFeature: {
        spawn: MyFeature,
        withAttrs: {
            base: 'my-feature',
            myProp: '${base}-my-prop',
            count: '${base}-count',
            _count: { instanceOf: 'Number' }
        }
    }
});
```

```html
<my-element my-feature-my-prop="hello" my-feature-count="42"></my-element>
```

The parsed attributes (`{ myProp: 'hello', count: 42 }`) are passed as `initVals` to the constructor.

### Async Spawn (Lazy Loading)

Feature implementations can be loaded asynchronously:

```javascript
customElements.assignFeatures(MyElement, {
    myFeature: {
        spawn: () => import('my-feature/MyFeature.js').then(m => m.MyFeature)
    }
});
```

During the loading window, a placeholder `{}` is returned. Once the async import resolves, the real instance replaces it (with any accumulated properties passed as `initVals`).

### Shared Context (Access to Private Fields)

Features can receive private data from the host element via `getSharedContext`:

```javascript
class MyElement extends HTMLElement {
    #internals;

    static supportedFeatures = {
        myFeature: {
            fallbackSpawn: MyFeature,
            getSharedContext(instance) {
                return { internals: instance.#internals };
            }
        }
    };

    constructor() {
        super();
        this.#internals = this.attachInternals();
    }
}
```

The feature receives this via `ctx.shared`:

```javascript
class MyFeature {
    constructor(hostElement, ctx, initVals) {
        this.internals = ctx.shared?.internals;
    }
}
```

### Lifecycle Callback Forwarding with `callbackForwarding`

Features that need DOM context (computed styles, layout info) or cleanup on disconnect can declare `callbackForwarding` in `static supportedFeatures` to receive the host element's lifecycle callbacks automatically:

```javascript
class MyElement extends HTMLElement {
    static supportedFeatures = {
        myFeature: {
            fallbackSpawn: MyFeature,
            callbackForwarding: ['connectedCallback', 'disconnectedCallback']
        }
    };
}

customElements.assignFeatures(MyElement, {
    myFeature: { spawn: MyFeature }
});
```

`callbackForwarding` can also be specified in the injection config passed to `assignFeatures`. A union is taken between both — so the feature author can guarantee the callbacks they need in `supportedFeatures`, and the injector can add additional ones if needed.

**How it works:**

1. `assignFeatures` patches the custom element's lifecycle callbacks on the prototype (once per callback type).
2. The original callback runs first, then all registered features are forwarded.
3. On first `connectedCallback`, the lazy getter is triggered — spawning the feature at the correct lifecycle moment (when the element is in the DOM and computed styles are available).
4. For async features, forwarding is skipped until the real instance is available.

**Supported callbacks:** `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`, `adoptedCallback`

**When to use it:**

- The feature needs `attributeChangedCallback` forwarded (e.g., truth-sourcer)
- The feature needs `getComputedStyle` (which requires the element to be in the DOM)
- The feature sets up event listeners that should be cleaned up on disconnect
- The feature needs to handle elements created via cloned templates (where the constructor fires before DOM insertion)

**Avoiding double-connect on initial spawn:**

Since the feature is *spawned* during the first `connectedCallback` (the getter fires), the constructor already has the opportunity to self-connect. When `callbackForwarding` then immediately forwards `connectedCallback` to the freshly-spawned instance, you need to guard against double-initialization. The standard pattern is a `#hasDisconnected` flag:

```javascript
class MyFeature {
    #hasDisconnected = false;

    constructor(hostElement, ctx, initVals) {
        // Self-connect on construction (we know we're in the DOM
        // because connectedCallback triggered our spawn)
        this.#connect();
    }

    connectedCallback() {
        // Only re-connect after a prior disconnection
        if (this.#hasDisconnected) {
            this.#hasDisconnected = false;
            this.#connect();
        }
    }

    disconnectedCallback() {
        this.#hasDisconnected = true;
        this.#cleanup();
    }

    #connect() {
        // Safe to call getComputedStyle here — element is in the DOM
        const styles = getComputedStyle(this.#hostRef.deref());
        // ... wire up listeners, parse CSS, etc.
    }

    #cleanup() {
        // Abort listeners, clear state
    }
}
```

**Complete example with `getSharedContext` + `callbackForwarding`:**

This pattern eliminates all manual wiring in the consumer's constructor — the feature self-activates at the correct lifecycle moment with all dependencies provided declaratively:

```javascript
class MyElement extends HTMLElement {
    propagator = new EventTarget();
    #internals;

    static supportedFeatures = {
        myFeature: {
            fallbackSpawn: MyFeature,
            callbackForwarding: ['connectedCallback', 'disconnectedCallback'],
            getSharedContext(instance) {
                return {
                    internals: instance.#internals,
                    hostPropagator: instance.propagator
                };
            }
        }
    };

    constructor() {
        super();
        this.#internals = this.attachInternals();
        // No manual feature activation needed!
    }
}

customElements.assignFeatures(MyElement, {
    myFeature: { spawn: MyFeature }
});

customElements.define('my-element', MyElement);
```

**Async features and `callbackForwarding`:**

For async features (where `spawn` is an async function), the feature is instantiated when the async import resolves. Since the constructor already handles initial connection, `callbackForwarding` only needs to forward *subsequent* lifecycle events. If you wrap an async feature around a sync one (lazy-loading pattern), delegate lifecycle calls to the inner feature once it's loaded:

```javascript
class MyFeatureLazy {
    #delegate = null;
    #hasDisconnected = false;

    constructor(hostElement, ctx, initVals) {
        this.#maybeActivate(hostElement, ctx);
    }

    connectedCallback() {
        if (this.#hasDisconnected) {
            this.#hasDisconnected = false;
            this.#delegate?.connectedCallback();
        }
    }

    disconnectedCallback() {
        this.#hasDisconnected = true;
        this.#delegate?.disconnectedCallback();
    }

    async #maybeActivate(hostElement, ctx) {
        // Guard: only load if actually needed
        const computed = getComputedStyle(hostElement);
        if (!computed.getPropertyValue('--my-config').trim()) return;

        const { MyFeature } = await import('./MyFeature.js');
        this.#delegate = new MyFeature(hostElement, ctx);
    }
}
```

### Class-Level Setup with `static onAssigned`

Features that need one-time class-level setup before any instances are created can define a `static onAssigned` method. This is called by `assignFeatures` immediately after registration, receiving the host constructor and the feature config:

```javascript
class MyFeature {
    /**
     * Called once when assignFeatures processes this feature.
     * Use for one-time class-level setup: installing prototype properties,
     * setting static flags, or pre-loading modules.
     */
    static onAssigned(ctr, featureConfig) {
        // Set static properties on the host constructor
        ctr.formAssociated = true;
        // Or install prototype getter/setters, pre-load modules, etc.
    }

    constructor(hostElement, ctx, initVals) {
        // Instance-level setup (runs on first getter access)
    }
}
```

**Usage:**

```javascript
// await is safe — returns undefined if no async onAssigned hooks exist
await customElements.assignFeatures(MyElement, {
    myFeature: { spawn: MyFeature }
});

// Now define — class is fully set up
customElements.define('my-element', MyElement);
```

**How it works:**

- `assignFeatures` checks if the spawn class defines `static onAssigned` (via `Object.hasOwn`).
- If found, calls `SpawnClass.onAssigned(ctr, featureConfig)` after installing the getter.
- If `onAssigned` returns a Promise, `assignFeatures` returns a `Promise<void>` that resolves when all async hooks complete.
- If no `onAssigned` hooks are async (or none exist), `assignFeatures` returns `undefined` (backward compatible).
- Only applies to synchronous spawners (the class must be available at registration time).

**When to use it:**

- Setting `static formAssociated = true` on the host (for form-associated custom elements)
- Installing prototype getter/setters that the feature depends on
- Pre-loading modules or resources needed at spawn time
- Any setup that must happen once per class, not once per instance

**`await` is always safe:**

```javascript
// These are equivalent for features without onAssigned:
customElements.assignFeatures(MyElement, { feature: { spawn: SyncFeature } });
await customElements.assignFeatures(MyElement, { feature: { spawn: SyncFeature } });
// Both work — await on undefined is a no-op
```

### Pre-upgrade Property Capture

If properties are set on an element before it upgrades, use `captureFeatureInitVals`:

```javascript
import { captureFeatureInitVals } from 'assign-gingerly/assignFeatures.js';

class MyElement extends HTMLElement {
    static supportedFeatures = {
        myFeature: { fallbackSpawn: MyFeature }
    };

    constructor() {
        super();
        captureFeatureInitVals(this);
    }
}
```

### Property Forwarding with installForwarding

To expose nested feature properties at the top level of the custom element:

```javascript
import { installForwarding } from 'assign-gingerly/installForwarding.js';

class MyElement extends HTMLElement {
    static supportedFeatures = {
        myFeature: { fallbackSpawn: MyFeature }
    };

    static propLinks = {
        'myProp': '?.myFeature?.myProp'
    };
}

customElements.assignFeatures(MyElement, {
    myFeature: { spawn: MyFeature }
});
installForwarding(MyElement);
customElements.define('my-element', MyElement);

// Now el.myProp delegates to el.myFeature.myProp
```

## Key Differences from Enhancements

| Aspect | Enhancement | Custom Element Feature |
|--------|-------------|----------------------|
| Target | Any existing HTML element | Custom element prototypes |
| Attachment | Via attributes + mount-observer | Via `assignFeatures` + lazy getters |
| Registration | `enhancementRegistry` | `featuresRegistry` |
| Discovery | DOM observation (be-hive) | Explicit injection before `define()` |
| Dependencies | mount-observer, be-hive, roundabout | assign-gingerly only |
| Build step | emc.mjs → emc.json | None required |
| Attribute prefix | `enh-` for isolation | Unprefixed (features own their element) |

## Tips

- **Call `assignFeatures` before `customElements.define()`** — getters must be on the prototype before instances exist
- **Use `@ts-check`** — catches type errors early in `.js` files
- **Store host as WeakRef** — prevents memory leaks
- **Keep features focused** — one responsibility per feature class
- **Use `validateShape`** — catches injection errors early in development
- **Test with mocks** — swap real implementations for test doubles without subclassing
