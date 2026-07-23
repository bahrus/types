# New Enhancement Instructions

## Introduction

This document provides step-by-step instructions for creating a **brand new** "be-*" or "do-*" enhancement project using the modern architecture. Unlike the [Enhancement Conversion Instructions](./EnhancementConversionInstructions.md) (which covers migrating legacy projects), this guide starts from scratch.

**Note:** This guide is specifically for **enhancements** (declarative behaviors added to existing HTML elements via attributes). It does NOT apply to custom elements. Enhancements use `be-hive` and `mount-observer` to attach behavior to elements without requiring custom element registration.

## Reference Implementations

- **[do-invoke](https://github.com/bahrus/do-invoke)** — Custom parser with nested paths and default values
- **[do-toggle](https://github.com/bahrus/do-toggle)** — Parser with infer pattern
- **[do-inc](https://github.com/bahrus/do-inc)** — Increment enhancement with parser
- **[be-clonable](https://github.com/bahrus/be-clonable)** — Most up-to-date conversion example (useful for architecture patterns)

## Prerequisites

- Node.js installed
- npm installed
- `ncu` (npm-check-updates) installed globally: `npm install -g npm-check-updates`

## Step 1: Initialize the Project

1. Create a new repository (e.g., `do-merge` or `be-fancy`)
2. Run `npm init` or create a `package.json` manually
3. Add the `types` submodule:
   ```bash
   git submodule add https://github.com/bahrus/types.git types
   ```

## Step 2: Configure package.json

Set up the standard scripts and dependencies:

```json
{
  "name": "do-my-enhancement",
  "version": "0.0.0",
  "description": "Description of what the enhancement does",
  "type": "module",
  "main": "do-my-enhancement.js",
  "scripts": {
    "build": "node emc.mjs > emc.json && node [emoji].mjs > [emoji].json",
    "serve": "node ./node_modules/spa-ssi/serve.js",
    "test": "playwright test",
    "safari": "npx playwright wk http://localhost:8000",
    "update": "ncu -u && npm install"
  },
  "dependencies": {
    "assign-gingerly": "0.0.5",
    "be-hive": "0.1.9",
    "inferencer": "0.0.1",
    "mount-observer": "0.0.16",
    "roundabout-lib": "0.0.2"
  },
  "devDependencies": {
    "spa-ssi": "0.0.27",
    "@playwright/test": "1.59.1"
  }
}
```

**Notes:**
- Replace `[emoji]` with your emoji shorthand (or remove that part of the build script if no emoji)
- Use exact versions, not ranges (no `^` or `~`)
- Add `nested-regex-groups` if you need custom attribute parsing
- Run `npm run update` after creating package.json to install dependencies

## Step 3: Create Type Definitions

Create `types/[project-name]/types.d.ts` with the standard structure:

```typescript
import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps {
    // Properties that end users configure via attributes
    myProp: string;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element & ElementEnhancementGateway;
    resolved: boolean;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
}
```

**Key points:**
- `EndUserProps` — what the user configures via HTML attributes
- `AllProps` — includes `enhancedElement` and any internal state like `resolved`
- `Actions` — methods the enhancement exposes; `init` always has the 4-parameter signature
- If using a custom parser, import `StatementsResult` from `../nested-regex-groups/types`

## Step 4: Create emc.mjs (Build Configuration)

Create `emc.mjs` in the project root:

```javascript
//@ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/[project-name]/types' */
/** @import {RAConfig} from './types/roundabout/types' */

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'DoMyEnhancement',
        spawn: '[project-name]/[project-name].js',
        withAttrs: {
            base: '[project-name]',
            // For simple string/number properties:
            // myProp: '${base}-my-prop',
            // For the base attribute itself (JSON object):
            // _base: { mapsTo: 'myProp', instanceOf: 'Object' }
            // For boolean properties:
            // _nudge: { instanceOf: 'Boolean' }
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            hydrate: {
                ifAllOf: ['myProp', 'enhancedElement']
            }
        }
    }
};

export function render(){
    return JSON.stringify(emc, null, 4);
}

console.log(render());
```

### Attribute Parsing Options

**JSON attribute (parsed by browser):**
```javascript
_base: { mapsTo: 'mergeParamSets', instanceOf: 'Object' }
```
Use when the attribute value is valid JSON. The browser's JSON parser handles it.

**Custom parser (for string DSL syntax):**
```javascript
_base: {
    mapsTo: 'invokeParamSet',
    parser: 'parse-pattern-statements',
    instanceOf: 'Array',
    parserConfig: parsePatterns
}
```
Use when you need to parse a custom string syntax. See [Enhancement Conversion Instructions](./EnhancementConversionInstructions.md) Step 7a for details.

## Step 5: Create Emoji Shorthand (Optional)

If your enhancement has an emoji shorthand, create `[emoji].mjs`:

```javascript
import myJSON from './emc.json' with {type: 'json'};

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps} from './types/[project-name]/types' */

/**
 * @type {EMC<any, AllProps> }
 */
const emc = {
    ...myJSON,
    enhConfig: {
        ...myJSON.enhConfig,
        enhKey: '[emoji]',
        withAttrs: {
            ...myJSON.enhConfig.withAttrs,
            base: '[emoji]'
        }
    }
};

export function render(){
    return JSON.stringify(emc, null, 4);
}

console.log(render());
```

**Critical:** The `...myJSON` spread at the top level ensures `customData` is carried over.

## Step 6: Create the Enhancement Class

Create `[project-name].js`:

```javascript
// @ts-check
/** @import {Actions, PAP, AllProps, AP} from './types/[project-name]/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;

/**
 * @implements {Actions}
 */
class DoMyEnhancement {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {SpawnContext} ctx 
     * @param {PAP} initVals 
     */
    constructor(enhancedElement, ctx, initVals){
        this.init(this, enhancedElement, ctx, initVals);
    }

    /**
     * @param {AllProps} self 
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {SpawnContext} ctx 
     * @param {PAP} initVals 
     */
    async init(self, enhancedElement, ctx, initVals){
        const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc);
        /**
         * @type {RoundaboutOptions}
         */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                ...customData?.defaultPropVals,
                ...initVals
            }
        };
        (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
    }

    /**
     * @param {AP} self 
     */
    async hydrate(self){
        // Your enhancement logic here
        return /** @type {PAP} */ ({resolved: true});
    }
}

export {DoMyEnhancement};
```

**Key patterns:**
- No base class — plain JavaScript class
- Constructor delegates to `init` with 4 parameters
- `init` extracts `customData` from `ctx.emc` (no JSON import needed)
- Action methods receive `self` (the reactive proxy) as first parameter
- Return partial props from actions to trigger reactive updates

## Step 7: Create imports.html

```html
<script type=importmap >
    {
        "imports": {
            "assign-gingerly/": "/node_modules/assign-gingerly/",
            "[project-name]/": "/",
            "be-hive/":  "/node_modules/be-hive/",
            "inferencer/": "/node_modules/inferencer/",
            "mount-observer/": "/node_modules/mount-observer/",
            "roundabout-lib/": "/node_modules/roundabout-lib/",
            "id-generation/": "/node_modules/id-generation/"
        }
    }
</script>
```

## Step 8: Configure VS Code

Create `.vscode/settings.json`:

```json
{
    "explorer.fileNesting.patterns": {
        "*.mjs": "${capture}.json"
    },
    "explorer.fileNesting.enabled": true
}
```

## Step 9: Set Up Auto-Build Hook

Create `.kiro/hooks/auto-build-config.kiro.hook`:

```json
{
    "name": "Auto-build Configuration",
    "version": "1.0.0",
    "description": "Automatically runs npm run build when emc.mjs or emoji .mjs files are saved",
    "when": {
        "type": "fileEdited",
        "patterns": ["emc.mjs", "[emoji].mjs"]
    },
    "then": {
        "type": "runCommand",
        "command": "npm run build",
        "timeout": 10000
    }
}
```

## Step 10: Build and Verify

```bash
npm run update    # Install/update dependencies
npm run build     # Generate emc.json and emoji.json
```

Verify that `emc.json` (and `[emoji].json`) are generated with the expected structure.

## Step 11: Create Test HTML

Create a test file (e.g., `tests/test1.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test</title>
    <!-- #include virtual="/imports.html" -->
    <be-hive>
        <script type=emc src="[project-name]/emc.json"></script>
    </be-hive>
    <script type=module>
        import 'be-hive/be-hive.js';
    </script>
</head>
<body>
    <!-- Your test markup here -->
</body>
</html>
```

## Architecture Overview

```
[project-name]/
├── .kiro/
│   └── hooks/
│       └── auto-build-config.kiro.hook
├── .vscode/
│   └── settings.json
├── types/                          (git submodule)
│   └── [project-name]/
│       └── types.d.ts
├── [project-name].js               (enhancement class - browser code)
├── emc.mjs                         (build script → emc.json)
├── emc.json                        (generated - runtime config)
├── [emoji].mjs                     (build script → [emoji].json)
├── [emoji].json                    (generated - emoji variant config)
├── imports.html                    (import map for browser)
├── package.json
└── README.md
```

## Key Differences from Conversion

| Aspect | Conversion | New Enhancement |
|--------|-----------|-----------------|
| Legacy code | Move to `legacy/` folder | N/A — no legacy code |
| ts-refs | Remove and migrate to `types/` | Start directly in `types/` |
| Type cleanup | Remove IEnhancement extends, BAP | Write clean types from scratch |
| Static config | Migrate to emc.mjs customData | Write customData directly |
| Class refactor | Remove BE extends, bootUp | Write plain class from start |

## Tips

- **Start simple**: Get the basic case working before adding complexity
- **Test incrementally**: Build one example at a time
- **Check generated JSON**: Run `node emc.mjs` to see the output
- **Use `@ts-check`**: Catches type errors early in `.js` files
- **Don't import emc.json in the class**: The config comes through `ctx.emc`

## Parser Registration in HTML

When your enhancement uses a custom parser (see Step 4's custom parser section), you must also register the parser in your test/demo HTML files. The EMC script needs to wait for the parser to be available before processing attributes.

```html
<be-hive>
    <script type=emc-parser 
            src="be-hive/parsers/parse-pattern-statements.js" 
            parser-name=parse-pattern-statements></script>
    <script type=emc 
            src="[project-name]/emc.json" 
            wait-for-parsers=parse-pattern-statements></script>
</be-hive>
<script type=module>
    import 'be-hive/be-hive.js';
</script>
```

**Key attributes:**
- `type=emc-parser` — Identifies this as a parser registration script
- `src` — Path to the parser module (e.g., `be-hive/parsers/parse-pattern-statements.js`)
- `parser-name` — Must match the `parser` string value in your `emc.mjs` `withAttrs` config
- `wait-for-parsers` — Comma-separated list of parser names to wait for before processing the EMC

If you omit the parser registration, you'll get "Parser not found" errors in the browser console.

## Playwright Configuration

The modern architecture uses JSON imports with `with {type: 'json'}` syntax, which requires Chrome 146+. Update `playwright.config.ts` to only run Chromium tests:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  // Commented out - requires Chrome 146+ features (JSON imports with type assertion)
  // {
  //   name: 'firefox',
  //   use: { ...devices['Desktop Firefox'] },
  // },
  // {
  //   name: 'webkit',
  //   use: { ...devices['Desktop Safari'] },
  // },
],
```

## Using the Infer Pattern for Element Conventions

### Overview

The modern architecture provides a standardized way to infer element properties and event types through the **`infer` pattern** from `inferencer`. This eliminates the need for hardcoded element type checks and provides a consistent, extensible approach to element conventions.

### The Infer Function

Add this helper function at the bottom of your enhancement class file:

```javascript
/** @import {Infer} from './types/inferencer/types' */

/**
 * @param {Element & ElementEnhancementGateway} from 
 */
async function infer(from){
    return /** @type {Infer} */ (
        /** @type {any} */ (
            from.enh.get((await import('inferencer/inferencer.js')).registryItem)
        )
    );
}
```

### What It Provides

The `infer` function returns an object with:
- **`eventType`**: The most appropriate event type for the element (e.g., 'click', 'input', 'change')
- **`propName`**: The most appropriate property name for the element (e.g., 'checked', 'value', 'textContent')
- **`value`**: The current value of the inferred property (getter/setter)
- **`getPropagator()`**: Returns a propagator EventTarget for observing property changes

### Usage Examples

#### Inferring Event Type

```javascript
// ❌ Hardcoded logic
if (localEventType === undefined) {
    const tagName = enhancedElement.tagName.toLowerCase();
    if(tagName === 'input' || tagName === 'textarea' || tagName === 'select'){
        localEventType = 'input';
    } else {
        localEventType = 'click';
    }
}

// ✅ Use infer
if (localEventType === undefined) {
    localEventType = (await infer(enhancedElement)).eventType;
}
```

#### Inferring Property Name

```javascript
// ❌ Hardcoded logic
if(!propertyName){
    const tagName = target.tagName.toLowerCase();
    if(tagName === 'input'){
        const inputType = target.getAttribute('type');
        propertyName = (inputType === 'checkbox' || inputType === 'radio') ? 'checked' : 'value';
    } else {
        propertyName = 'textContent';
    }
}

// ✅ Use infer
if(!propertyName){
    propertyName = (await infer(target)).propName;
}
```

#### Getting/Setting Inferred Property Value

```javascript
const inference = await infer(target);
const currentValue = inference.value;
inference.value = !inference.value;  // Toggle
```

#### Inferring from Name Attribute (Empty Attribute Value)

When the attribute value is empty, infer both event type and property name:

```javascript
if(statements.length === 0){
    const name = enhancedElement.getAttribute('name');
    if(name){
        statements.push({
            value: {
                prop: name,
                localEventType: (await infer(enhancedElement)).eventType,
            }
        });
    }
}
```

### Benefits

1. **Consistency**: All enhancements use the same inference logic
2. **Extensibility**: New element types can be supported by updating inferencer, not each enhancement
3. **Maintainability**: No duplicated element type checking code
4. **Type Safety**: TypeScript definitions ensure correct usage
5. **Future-proof**: Custom elements can provide their own inference hints

## Binding Enhancement Patterns

If your enhancement needs to synchronize property values between elements (two-way data binding), the following patterns from be-bound apply.

### The InferencedPropagator Pattern

Binding enhancements need to detect property changes on arbitrary elements — both custom elements (which may have roundabout propagators) and native elements (which don't). The `inferencer` package provides `InferencedPropagator` which handles this transparently:

```javascript
const localInference = await infer(enhancedElement);
const localPropagator = await localInference.getPropagator();

// Works for both custom elements and built-in elements
localPropagator.addEventListener('value', () => {
    // property changed
});
```

**How `getPropagator()` works:**
- For **custom elements** with roundabout: returns the element's native `propagator` EventTarget
- For **built-in elements**: creates an `InferencedPropagator` that uses best-effort detection (native events, setter interception, attribute observation, polling fallback)

The propagator's `addEventListener` uses the **property name** as the event type (not a DOM event name).

### contentEditable Elements

The `InferencedPropagator` supports contentEditable elements by detecting `element.isContentEditable` and listening for the native `input` event. The browser does NOT fire property setters when users type in a contentEditable element — it mutates the DOM directly. The `input` event is the only reliable signal.

### upSearch: Resolving Remote Targets

The `inferencer/upSearch.js` function resolves remote binding targets:

```javascript
const target = await upSearch(enhancedElement, remoteId);
```

- If `remoteId` is truthy: calls `getRootNode().getElementById(remoteId)`
- If `remoteId` is falsy: traverses up to the nearest `[itemscope]` ancestor, or the shadow root's host

### Path-Based Property Access

When binding to nested properties, use the `?.` path syntax to avoid conflicts with period-based statement separation:

```html
<form 🪢="between ?.rating?.value@change and #alternativeRating.">
```

### Explicit Event Listening with `@` Syntax

When the inferred event isn't appropriate, allow users to specify the event by appending `@eventName`:

```html
<form 🪢="between ?.rating?.value@change and #alternativeRating.">
```

In `hydrate`, check for `localEvent` and use it instead of the inferred propagator when present.

### Tie-Breaking for Initial Reconciliation

When two-way binding is first established, a `breakTie` function determines which value wins based on type specificity:

```
object > function > symbol > bigint > number > boolean > string > null > undefined
```

Within the same type, longer string representations win. Equal values result in no action.

## Lessons Learned / Common Pitfalls

### Compact/Action Conflicts

Do NOT define the same method in both `actions` and `compacts` in your `emc.mjs` `customData`:

- **Compacts** automatically call methods when properties change (e.g., `when_triggerInsertPosition_changes_call_addDeleteBtn`)
- **Actions** define when methods should be called based on property availability (e.g., `ifAllOf: ['prop1', 'prop2']`)

If a method is already invoked by a compact, adding it to `actions` will cause a "Conflict detected" error from roundabout.

### Emoji Shorthand: Always Spread `...myJSON`

When creating emoji `.mjs` files, always spread `...myJSON` at the top level:

```javascript
const emc = {
    ...myJSON,           // ← CRITICAL: carries over customData
    enhConfig: {
        ...myJSON.enhConfig,
        enhKey: '⿻',
        withAttrs: {
            ...myJSON.enhConfig.withAttrs,
            base: '⿻'
        }
    }
}
```

Without `...myJSON`, the emoji JSON will be missing `customData` (actions, weakRef, defaultPropVals), and the enhancement will appear to load but won't respond to events.

### Chained Accessor `?.` vs Period `.`

The parsers (`parse-pattern-statements`, `parse-grouped-capture-statements`) split statements on periods. If you need to reference properties using dot notation in attribute values, use `?.` instead:

```html
<!-- ❌ Period conflicts with statement splitting -->
<button ⏻="[#myLight].isOn">Toggle</button>

<!-- ✅ Chained accessor avoids conflict -->
<button ⏻="[#myLight]?.isOn">Toggle</button>
```

### Parser Selection

| Use case | Parser |
|----------|--------|
| Flat target objects, no nesting | `parse-grouped-capture-statements` |
| Nested object structures via dot notation in capture groups | `parse-pattern-statements` |

Choose based on your data structure needs, not syntax complexity. The parser choice directly affects your type definitions.

### Utility Import Paths

Common utilities live in `be-hive`, not `trans-render`:

```javascript
// ✅ Correct
import { findAdjacentElement } from 'be-hive/findAdjacentElement.js';

// ❌ Wrong (legacy path)
import { findAdjacentElement } from 'trans-render/lib/findAdjacentElement.js';
```

### Debugging Tips

1. **Check the generated JSON** — Run `node emc.mjs` and verify all sections (especially `customData`) are present
2. **Console log parsedStatements** — Add `console.log({parsedStatements})` in `hydrate` to see parser output
3. **Verify parser loading** — Check browser console for "Parser not found" errors
4. **Test incrementally** — Get one example working before moving to the next
5. **Compare with working examples** — Use be-clonable (architecture), do-invoke (custom parser), do-toggle (infer pattern) as references

### Testing Strategy

Build incrementally:

1. **Get the basic case working first** (simple property/action trigger)
2. **Add inference** (infer from name attribute when attribute value is empty)
3. **Add event customization** (custom event types)
4. **Add selector/remote support** (target peer elements)

Don't try to implement all features at once.

---

*Last updated: June 2026*
