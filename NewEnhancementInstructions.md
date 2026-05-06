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
    "mount-observer": "0.0.16",
    "roundabout-lib": "0.0.2"
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
