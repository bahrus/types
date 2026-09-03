# Enhancement Conversion Instructions

> **Scope:** This document applies to **enhancements** (declarative behaviors added to existing HTML elements via attributes using `be-hive` and `mount-observer`). It does NOT apply to custom elements. If you are creating a brand new enhancement (not converting a legacy one), see [NewEnhancementInstructions.md](./NewEnhancementInstructions.md) instead.

## Introduction

This document provides step-by-step instructions for converting legacy "be-*" enhancement projects to the modern architecture. The conversion process has been successfully applied to several projects including:

- **[be-clonable](https://github.com/bahrus/be-clonable)** ⭐ **RECOMMENDED REFERENCE** - The most up-to-date implementation with the latest architectural improvements. Use this as your primary reference.
- **[do-invoke](https://github.com/bahrus/do-invoke)** ⭐ **CUSTOM PARSER REFERENCE** - The first conversion using custom parser integration with nested paths and default values. Use this as your reference for complex attribute parsing.
- [be-committed](https://github.com/bahrus/be-committed)
- [be-decked-with](https://github.com/bahrus/be-decked-with)

Each of these repositories contains a "legacy" folder showing the original implementation for reference. When in doubt about implementation details, refer to be-clonable first as it demonstrates the cleanest, most refined patterns. For custom parser implementations, refer to do-invoke.

**Note:** be-a-beacon is intentionally not listed as a reference because its requirements are too simple - it just fires an event on construction without needing reactive properties or actions, making it an outlier that doesn't benefit from the roundabout architecture.

## What This Conversion Achieves

The conversion modernizes HTML element enhancement libraries that follow the "be-enhanced" pattern. These enhancements add declarative behaviors to HTML elements through attributes, enabling progressive enhancement without requiring custom elements.

The new architecture provides:

- **Simplified configuration**: Streamlined setup using be-hive's mount observer pattern
- **Better type safety**: Centralized type definitions in a shared types submodule
- **Cleaner separation**: Distinct interfaces for end-user props, internal props, and actions
- **Improved maintainability**: Consistent structure across all enhancement projects
- **Enhanced DX**: Better IDE support through TypeScript definitions

## High-Level Conversion Overview

The conversion transforms projects from a legacy architecture to a modern one that:

1. Uses `be-hive` for enhancement registration and lifecycle management
2. Centralizes type definitions in a shared `types` submodule
3. Separates concerns between end-user properties, internal state, and actions
4. Adopts a declarative configuration approach for defining enhancement behavior
5. Leverages modern ES modules and import patterns

The process involves updating:
- Project structure and file organization
- Type definitions and interfaces
- Enhancement registration and initialization
- Configuration and property handling
- Import/export patterns

## Conversion Steps

### Step 1: Migrate Type Definitions to New Submodule

The first step is to move your project's type definitions from the `ts-refs` submodule to the `types` submodule.

**Why this step?** The legacy architecture used a git submodule called `ts-refs` to share type definitions across all be-* projects. The modern approach uses a renamed submodule called `types` with a clearer, more intuitive name that better communicates its purpose.

**Instructions:**

1. Check if a `ts-refs` folder exists in your project root (it's a git submodule)
2. If it exists, locate the subfolder matching your project name (e.g., `ts-refs/be-clonable` for the be-clonable project)
3. Copy that folder and its contents into the `types` folder (e.g., copy `ts-refs/be-clonable/` to `types/be-clonable/`)
4. Delete the entire `ts-refs` folder using `Remove-Item -Recurse -Force ts-refs` (or `rm -rf ts-refs` on Unix-like systems)

**Result:** You should now have your type definitions at `types/[project-name]/types.d.ts` and the `ts-refs` submodule should be removed.

### Step 2: Archive Legacy Implementation

Before converting to the new architecture, preserve the existing implementation in a `legacy` folder for reference.

**Why this step?** Keeping the original implementation allows you to compare the old and new approaches, verify behavior during conversion, and provides a fallback if needed. It also serves as documentation for others learning about the architectural changes.

**Instructions:**

1. Create a `legacy` folder in your project root if it doesn't exist
2. If the `legacy` folder already exists, empty its contents: `Remove-Item -Path legacy/* -Force` (or `rm -rf legacy/*` on Unix-like systems)
3. Move all `.js`, `.mjs`, and `.json` files from the root directory to the `legacy` folder, excluding `package.json` and `package-lock.json`
   - Example: `Move-Item -Path *.js -Destination legacy/`
   - For .json files: `Get-ChildItem -Filter *.json | Where-Object { $_.Name -notlike 'package*.json' } | Move-Item -Destination legacy/`

**Result:** Your `legacy` folder should now contain copies of all implementation files that will be converted in subsequent steps.

### Step 3: Update package.json Dependencies and Scripts

Update the package.json to use the modern architecture's dependencies and build scripts.

**Why this step?** The new architecture uses a simplified dependency set with be-hive for enhancement management and roundabout-lib for utilities. The build process also changes to generate configuration files for both the full name and emoji shorthand versions.

**Instructions:**

1. Update the `scripts` section:
   ```json
   "scripts": {
     "build": "node emc.mjs > emc.json && node [emoji].mjs > [emoji].json",
     "serve": "node ./node_modules/spa-ssi/serve.js",
     "test": "playwright test",
     "safari": "npx playwright wk http://localhost:8000",
     "update": "ncu -u && npm install"
   }
   ```
   - Replace `[emoji]` with the emoji from your README.md title (e.g., `⿻` for be-clonable)
   - If there's no emoji in the README title, omit the `&& node [emoji].mjs > [emoji].json` part

2. Update the `dependencies` section to the modern set:
   ```json
   "dependencies": {
     "be-hive": "*",
     "mount-observer": "*",
     "roundabout-lib": "*",
     "nested-regex-groups": "*"
   }
   ```
   - Drop the legacy dependencies (`be-enhanced`, `trans-render`, etc.). Keep a legacy dependency **only** if a converted action still imports from it and the modern stack has no replacement (e.g. `trans-render/XV/set.js` for the Uniform Storage Path protocol) — note any such carry-over in your conversion notes.
   - `mount-observer` is listed as a direct dependency so it lands at the root `node_modules/` level, accessible via the import map. `nested-regex-groups` is optional but recommended if your enhancement needs custom attribute parsing (Step 7a).
   - The exact version strings do not matter here — the next step replaces them all with the latest published versions.

3. **Upgrade everything to the latest version**, including `devDependencies`. Do not preserve the versions the legacy project pinned, and do not hand-pick versions from this document — the version numbers in these instructions are illustrative only and go stale. Verify the `update` script exists in `scripts`:
   ```json
   "update": "ncu -u && npm install"
   ```
   If it's missing, add it. Then run:
   ```
   npm run update
   ```
   `npm run update` runs npm-check-updates (`ncu -u`), which rewrites **every** entry in both `dependencies` and `devDependencies` to the latest published version (as an exact point version, no `^`/`~` range), then installs. This is the single source of truth for dependency versions after conversion — `@playwright/test`, the SSI dev server, and every runtime package included.

**IMPORTANT:** You MUST run `npm run update` before proceeding — the subsequent steps require these packages to be installed. Use `npm run update` (not a bare `npm install`) so you get the latest versions.

**Result:** `package.json` uses the modern dependency set, and every dependency (runtime and dev) is at its latest published point version.

### Step 4: Update imports.html

Create or update the imports.html file to use the modern import map pattern.

**Why this step?** The import map provides a clean way to map bare module specifiers to their locations, enabling browser-native ES module imports without bundling. This approach follows web standards and improves development experience.

**Instructions:**

1. Create or replace the `imports.html` file in your project root with the following structure:
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
               "id-generation/": "/node_modules/id-generation/",
               "nested-regex-groups/": "/node_modules/nested-regex-groups/"
           }
       }
   </script>
   ```
2. Replace `[project-name]` with your actual project name (e.g., `be-clonable`)
3. The key difference: the project itself maps to `"/"` (root), while dependencies map to `/node_modules/[package]/`
4. **Note:** The `id-generation` and `nested-regex-groups` entries are required if your enhancement uses custom parsers (Step 7a). If you're not using custom parsers, these can be omitted.

**Result:** Your imports.html file should now provide proper import mappings for the browser.

### Step 5: Establish Coding Standards

Create a coding standards steering document to guide development practices.

**Why this step?** Establishing clear conventions ensures consistency across the codebase and helps maintain the architectural patterns of the modern approach.

**Instructions:**

1. Create the directory structure: `.kiro/steering/`
2. Create a file `.kiro/steering/coding-standards.md` with the following content:

```markdown
# Coding Standards

## JavaScript Module Conventions

### Import Maps
- Use import maps with explicit, bare specifiers ending with `*.js` for all JavaScript references that run in the browser
- Example: `"be-hive/": "/node_modules/be-hive/"`

### File Extensions
- Use `*.mjs` files exclusively for npm build scripts, not for browser code
- Use `*.js` files (not `*.ts`) for all browser-executable code
- Enable TypeScript support in `*.js` files via `@ts-check` directive at the top of files

### TypeScript Support
- Add `// @ts-check` at the beginning of JavaScript files to enable TypeScript checking
- Use JSDoc comments for type annotations when needed
- Leverage type definitions from the `types` submodule
```

**Result:** Your project now has documented coding standards that will be automatically included in Kiro's context when working on the codebase.

### Step 6: Update Type Definitions to be Standalone

Modernize the type definitions to be self-contained without external dependencies.

**Why this step?** The legacy types relied on imports from trans-render and be-enhanced packages. The modern approach makes type files standalone, improving portability and reducing coupling between packages.

**Instructions:**

1. Open `types/[project-name]/types.d.ts`
2. Remove the import statement: `import { IEnhancement, BEAllProps } from '../trans-render/be/types';`
3. Remove `extends IEnhancement` from the `EndUserProps` interface
4. Add `enhancedElement: Element;` to the `AllProps` interface (this is the key property that was previously inherited)
5. Remove the `BAP` type alias entirely
6. Replace all occurrences of `BAP` with `AP` in the `Actions` interface method signatures

**Example transformation:**

Before:
```typescript
import { IEnhancement, BEAllProps } from '../trans-render/be/types';

export interface EndUserProps extends IEnhancement{
    triggerInsertPosition: InsertPosition;
}

export interface AllProps extends EndUserProps{
    byob?: boolean;
}

export type BAP = AP & BEAllProps;

export interface Actions{
    addCloneBtn(self: BAP): ProPAP;
}
```

After:
```typescript
export interface EndUserProps{
    triggerInsertPosition: InsertPosition;
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    byob?: boolean;
}

export interface Actions{
    addCloneBtn(self: AP): ProPAP;
}
```

**Result:** Your type definitions are now standalone and don't depend on external type packages.

### Step 7: Create emc.mjs Build Configuration

Transform the legacy browser-based emc.js into a build-time emc.mjs configuration file that generates emc.json.

**Why this step?** The legacy architecture used emc.js as a browser module that imported be-hive and registered enhancements at runtime. The modern approach uses emc.mjs as a build script that generates a static JSON configuration file, improving performance and separating build-time concerns from runtime code.

**Key Changes:**

1. **withAttrs replaces base/branches/map**: The new assign-gingerly withAttrs pattern provides a cleaner, more intuitive way to map HTML attributes to properties using template syntax
2. **Static config moves to customData**: Configuration from the legacy be-*.js static config section (actions, handlers, compacts) moves into the customData section of emc.mjs
3. **Property inference**: propDefaults and propInfo are no longer needed - the roundabout library automatically infers property names from actions, handlers, and compacts
4. **Build-time only**: emc.mjs is used only for generating JSON, not loaded in the browser

**Instructions:**

1. Create `emc.mjs` in your project root
2. Start with the basic structure:

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
        // Keep the SAME key the legacy project used for `enhPropKey`
        // (traditional camelCase JS property naming, e.g. 'beLiterate').
        enhKey: '[enhPropKey]',
        spawn: '[project-name]/[project-name].js',
        withAttrs: {
            base: '[project-name]',
            // Map each property to an attribute using ${base} template
            propertyName: '${base}-property-name',
            // For boolean properties, add instanceOf
            _booleanProp: {
                instanceOf: 'Boolean'
            }
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            // Copy from legacy static config
        },
        handlers: {
            // Copy from legacy static config
        },
        compacts: {
            // Copy from legacy static config
        },
        defaultPropVals: {
            // Copy from legacy static config.propDefaults
            // Note: propDefaults → defaultPropVals
        }
    }
}

export function render(){
    return JSON.stringify(emc, null, 4);
}
```

3. **Configure withAttrs**: For each EndUserProps property in your types file:
   - Add `propertyName: '${base}-property-name'` for string/number properties
   - For boolean properties, you still need the attribute name mapping AND the underscore-prefixed metadata entry:
     ```javascript
     nudge: '${base}-nudge',    // attribute name mapping (REQUIRED - defines what attribute to observe)
     _nudge: {                   // metadata (optional - provides type/parsing info)
         instanceOf: 'Boolean'
     }
     ```
   - The underscore-prefixed key (`_propertyName`) is **metadata only** — it tells the framework how to parse the attribute value. It does NOT register the attribute by itself. You must always have the non-underscore entry to define the actual attribute name.
   - The `${base}` template variable references the base attribute name
   - Special case: `_base` is metadata for the base attribute itself (which is implicitly the `base` value)

4. **Configure weakRef**: 
   - Add `weakRef: { properties: ['enhancedElement'] }` at the start of customData
   - If any action methods reference other element properties (like `trigger`, `button`, etc.), add those to the properties array as well
   - This tells roundabout to automatically create property getters/setters that store weak references

5. **Migrate static config to customData**: 
   - Copy `actions`, `handlers`, and `compacts` from the legacy be-*.js static config
   - For any action methods that have `ifAllOf` and reference `enhancedElement` in their code, add `'enhancedElement'` to the `ifAllOf` array
   - Copy `propDefaults` to `defaultPropVals` in customData (note the name change from propDefaults to defaultPropVals)
   - Do NOT copy `propInfo` - property names are automatically inferred by roundabout from actions, handlers, and compacts
   - Remove any `positractions` - these are handled differently in the new architecture

**Example Transformation:**

Legacy emc.js:
```javascript
export const emc = {
    base: 'be-committed',
    branches: ['', 'to', 'nudges'],
    map: {
        '0.0': { instanceOf: 'Object', mapsTo: '.' },
        '1.0': { instanceOf: 'String', mapsTo: 'to' },
        '2.0': { instanceOf: 'Boolean', mapsTo: 'nudges' }
    },
    enhPropKey: 'beCommitted',
    importEnh: async () => {
        const {BeCommitted} = await import('./be-committed.js');
        return BeCommitted;
    },
};
```

Legacy be-committed.js static config:
```javascript
static config = {
    propDefaults: { on: 'keyup' },
    propInfo: { to: {}, nudges: {} },
    compacts: { when_on_changes_call_hydrate: 0 },
    positractions: [resolved, rejected]
}
```

Modern emc.mjs (note `enhKey` keeps the legacy `enhPropKey` value verbatim — `'beCommitted'`, not `'BeCommitted'`):
```javascript
export const emc = {
    enhConfig: {
        enhKey: 'beCommitted',
        spawn: 'be-committed/be-committed.js',
        withAttrs: {
            base: 'be-committed',
            to: '${base}-to',
            nudge: '${base}-nudge',
            _nudge: { instanceOf: 'Boolean' }
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            hydrate: { ifAllOf: ['on', 'to', 'enhancedElement'] }
        },
        compacts: {
            when_resolved_changes_dispatch: 'resolved',
        },
        defaultPropVals: {
            on: 'keyup'
        }
    }
}

export function render(){
    return JSON.stringify(emc, null, 4);
}

console.log(render());
```

**Result:** You now have a build-time configuration file that will generate emc.json when you run the build script.

### Step 7a: Custom Parser Integration (Optional)

#### Overview

Some be-* enhancements require **custom attribute parsers** to transform complex attribute syntax into structured data. The legacy architecture used `regExpExts` patterns in emc.js, while the modern architecture uses **built-in parsers from nested-regex-groups** integrated through the `parserConfig` property.

**When do you need a custom parser?**

- Your enhancement accepts complex attribute syntax (e.g., `do-invoke="methodName on click"` or `be-switched="case1: /pattern1/ | case2: /pattern2/"`)
- You need to parse multiple patterns or conditional logic from a single attribute
- Simple string-to-property mapping isn't sufficient

**References:** 
- [nested-regex-groups](https://github.com/bahrus/nested-regex-groups) - Documentation for the parsing library
- [nested-regex-groups npm](https://www.npmjs.com/package/nested-regex-groups) - Install with `npm install nested-regex-groups`
- **[do-invoke](https://github.com/bahrus/do-invoke)** ⭐ - Complete working example demonstrating custom parser with nested paths and default values

**Key Insight:** You don't need to write custom parser functions! The `nested-regex-groups` package provides built-in parsers that you configure with pattern definitions in your `emc.mjs` file.

#### Built-in Parsers Available

The modern architecture provides these built-in parsers (no custom code needed):

1. **`parse-pattern-statements`** - For flat objects (no nested properties)
   - Use when your target type has no nested properties
   - Example: `InvokingParameters { targetPart: string, localEventType?: string }`
   - Parses multiple statements separated by periods
   - **Use this for do-invoke style patterns**

2. **`parse-grouped-captures`** - For flat objects, single statement
   - Use when parsing a single statement into a flat object
   - No statement splitting

3. **`parse-grouped-capture-statements`** - For flat objects, multiple statements
   - Similar to `parse-pattern-statements` but different API

**CRITICAL:** All content in `emc.mjs` must be JSON-serializable. The `render()` function exports the configuration as JSON, which means:
- No function references (including parser functions)
- No class constructors  
- No symbols or other non-JSON types
- Parser names must be strings
- Pattern configurations must use `String.raw` for regex patterns

#### Step-by-Step Implementation

**Step 1: Define Pattern Configurations in emc.mjs**

Create pattern configurations using `PatternConfig` objects with `String.raw` for regex patterns:

```javascript
// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/do-invoke/types' */
/** @import {RAConfig} from './types/roundabout/types' */
/** @import {PatternConfig} from './types/nested-regex-groups/types' */

/** @type {PatternConfig[]} */
const parsePatterns = [
    {
        name: 'targetsPartOnEventType',
        pattern: String.raw `^(?<targetPart>.*) on (?<localEventType>.*)`,
        description: 'Method/selector with explicit event type'
    },
    {
        name: 'targetsPart',
        pattern: String.raw `^(?<targetPart>.*)`,
        description: 'Method/selector with default event type'
    }
];
```

**Why `String.raw`?** Template literals with `String.raw` prevent JavaScript from interpreting backslashes as escape sequences, which is essential for regex patterns containing `\w`, `\s`, `\.`, etc.

**Pattern Priority:** Patterns are tried in order - most specific first. The first matching pattern wins.

**Step 2: Configure withAttrs to Use Built-in Parser**

Reference the built-in parser by name and pass your pattern configuration:

```javascript
export const emc = {
    enhConfig: {
        enhKey: 'doInvoke',
        spawn: 'do-invoke/do-invoke.js',
        withAttrs: {
            base: 'do-invoke',
            _base: {
                mapsTo: 'invokeParamSets',
                parser: 'parse-pattern-statements',  // Built-in parser name
                instanceOf: 'Array',                  // Result is an array
                parserConfig: parsePatterns           // Your pattern configs
            }
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            hydrate: {
                ifAllOf: ['invokeParamSets', 'enhancedElement']
            }
        }
    }
};

export function render() {
    return JSON.stringify(emc, null, 4);
}

console.log(render());
```

**Key Configuration Properties:**

- **`parser`**: String name of built-in parser (`'parse-pattern-statements'`)
- **`parserConfig`**: Array of `PatternConfig` objects defining your patterns
- **`instanceOf`**: `'Array'` since the parser returns an array of parsed statements
- **`mapsTo`**: Property name where parsed result is stored (`'invokeParamSets'`)

**Step 3: Ensure Type Definitions Match**

Your type definitions should match the parser output structure:

```typescript
// types/do-invoke/types.d.ts

export interface InvokingParameters {
    targetPart: string;        // Captured from pattern
    localEventType?: string;   // Optional, captured from pattern
}

export interface EndUserProps {
    invokeParamSets: Array<InvokingParameters>;  // Array of parsed statements
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
}
```

**Important:** 
- The property names in your type (`targetPart`, `localEventType`) must match the capture group names in your regex patterns (`(?<targetPart>...)`, `(?<localEventType>...)`).
- When using custom parsers, wrap your parsed property type with `StatementsResult<T>` from `nested-regex-groups`:
  ```typescript
  import { StatementsResult } from "../nested-regex-groups/types";
  
  export interface EndUserProps {
      parsedStatements: StatementsResult<IncParameters>;
  }
  ```
- The `StatementsResult<T>` type includes a `success` flag and a `statements` array containing your parsed data.

#### Complete Working Example: do-invoke

Here's the complete, tested implementation from do-invoke that demonstrates nested paths and default values:

**emc.mjs:**
```javascript
// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/do-invoke/types' */
/** @import {RAConfig} from './types/roundabout/types' */
/** @import {PatternConfig} from './types/nested-regex-groups/types' */

const defaultVals = {
    localEventType: 'click'
};

/** @type {PatternConfig[]} */
const parsePatterns = [
    {
        name: 'idWithMethodAndEvent',
        pattern: String.raw `^#(?<targetSpecifier.targetElementId>[^?]+)\?\.(?<targetSpecifier.hostOrPeerMethodName>\w+) on (?<localEventType>\w+)$`,
        description: 'Element ID with method and explicit event type: #{{id}}?.method on event',
        defaultVals,
    },
    {
        name: 'idWithMethod',
        pattern: String.raw `^#(?<targetSpecifier.targetElementId>[^?]+)\?\.(?<targetSpecifier.hostOrPeerMethodName>\w+)$`,
        description: 'Element ID with method, default event: #{{id}}?.method',
        defaultVals,
    },
    {
        name: 'methodWithEvent',
        pattern: String.raw `^(?<targetSpecifier.hostOrPeerMethodName>\w+) on (?<localEventType>\w+)$`,
        description: 'Method name with explicit event type: method on event',
        defaultVals,
    },
    {
        name: 'methodOnly',
        pattern: String.raw `^(?<targetSpecifier.hostOrPeerMethodName>\w+)$`,
        description: 'Method name only, default event: method',
        defaultVals,
    }
];

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'doInvoke',
        spawn: 'do-invoke/do-invoke.js',
        withAttrs: {
            base: 'do-invoke',
            _base: {
                mapsTo: 'invokeParamSet',
                parser: 'parse-pattern-statements',
                instanceOf: 'Array',
                parserConfig: parsePatterns
            }
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            hydrate: {
                ifAllOf: ['invokeParamSet', 'enhancedElement']
            }
        }
    }
};

export function render() {
    return JSON.stringify(emc, null, 4);
}

console.log(render());
```

**types/do-invoke/types.d.ts:**
```typescript
import { StatementsResult } from "../nested-regex-groups/types";

export interface InvokingParameters {
    targetSpecifier: {
        hostOrPeerMethodName: string,
        targetElementId?: string,
    },
    // defaults to "click" if not specified
    localEventType: string,
}

export interface EndUserProps {
    invokeParamSet: StatementsResult<InvokingParameters>;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    resolved: boolean;
}
```

**Key Features Demonstrated:**

1. **Nested paths**: Using dot notation like `targetSpecifier.hostOrPeerMethodName` creates nested object structures
2. **Default values**: The `defaultVals` object provides defaults for `localEventType: 'click'`
3. **Multiple patterns**: Four patterns handle different syntax variations, ordered from most specific to least specific
4. **StatementsResult type**: The parser returns a `StatementsResult<InvokingParameters>` which includes `success` flag and `statements` array

**Usage Examples:**
```html
<!-- Pattern 1: Method only (uses default click event) -->
<button do-invoke="handleClick">Click me</button>
<!-- Parsed: { targetSpecifier: { hostOrPeerMethodName: "handleClick" }, localEventType: "click" } -->

<!-- Pattern 2: Method with explicit event -->
<input do-invoke="handleInput on input" />
<!-- Parsed: { targetSpecifier: { hostOrPeerMethodName: "handleInput" }, localEventType: "input" } -->

<!-- Pattern 3: Element ID with method (uses default click event) -->
<button do-invoke="#{{soul-searching}}?.engage">What have I done?</button>
<!-- Parsed: { targetSpecifier: { targetElementId: "soul-searching", hostOrPeerMethodName: "engage" }, localEventType: "click" } -->

<!-- Pattern 4: Element ID with method and explicit event -->
<button do-invoke="#{{soul-searching}}?.engage on mouseover">Hover me</button>
<!-- Parsed: { targetSpecifier: { targetElementId: "soul-searching", hostOrPeerMethodName: "engage" }, localEventType: "mouseover" } -->
```

#### Choosing the Right Parser

The `nested-regex-groups` package provides two built-in parsers with different capabilities:

**Use `parse-pattern-statements` when:**
- You need to support **nested object structures** using dot notation in capture groups
- Example: `(?<lhs.id>#\\w+)` creates nested structure `{ lhs: { id: '#foo' } }`
- This is a heavier-footprint parser based on the API documented [here](https://github.com/bahrus/nested-regex-groups#parsepatternstatementsinput-patternconfigs-options)
- Example usage:
  ```javascript
  import { parsePatternStatements } from 'nested-regex-groups';
  
  const patterns = [
    { name: 'comparison', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+eq\\s+(?<rhs.id>#\\w+)$' }
  ];
  
  const result = parsePatternStatements('on when #foo eq #bar. off when #baz eq #qux.', patterns);
  // {
  //   success: true,
  //   statements: [
  //     { pattern: 'comparison', value: { trigger: 'on', lhs: { id: '#foo' }, rhs: { id: '#bar' } } },
  //     { pattern: 'comparison', value: { trigger: 'off', lhs: { id: '#baz' }, rhs: { id: '#qux' } } }
  //   ]
  // }
  ```

**Use `parse-grouped-capture-statements` when:**
- Your target object is **flat** (no nested properties)
- You want a lighter-weight parser that relies almost exclusively on built-in regex capabilities
- Example: `InvokingParameters { targetPart: string, localEventType?: string }`
- This parser can only result in a flat document structure
- Based on the API documented [here](https://github.com/bahrus/nested-regex-groups#parsegroupedcapturestatementsinput-patternconfigs-options)
- Example usage:
  ```javascript
  import { parseGroupedCaptureStatements } from 'nested-regex-groups';
  
  const patterns = [
    { name: 'withEvent', pattern: '^(?<methodName>\\w+)\\s+on\\s+(?<eventType>\\w+)$' },
    { name: 'methodOnly', pattern: '^(?<methodName>\\w+)$' }
  ];
  
  const result = parseGroupedCaptureStatements('handleClick on click. handleInput on input.', patterns);
  // {
  //   success: true,
  //   statements: [
  //     { pattern: 'withEvent', value: { methodName: 'handleClick', eventType: 'click' } },
  //     { pattern: 'withEvent', value: { methodName: 'handleInput', eventType: 'input' } }
  //   ]
  // }
  ```

**Use custom parser (advanced) when:**
- You need complex post-processing logic beyond pattern matching
- Built-in parsers don't meet your needs
- See [Scoped Parser Registry](https://github.com/bahrus/mount-observer#scoped-parser-registry-for-emc-scripts) for custom parser documentation

#### Troubleshooting

**Parser not working:**
- Verify `nested-regex-groups` is in dependencies
- Check that capture group names match your type properties
- Ensure `String.raw` is used for patterns with backslashes
- Run `node emc.mjs` to verify JSON output includes `parserConfig`

**Type mismatches:**
- Capture group names must exactly match type property names
- Use optional properties (`?`) for optional capture groups
- Ensure `instanceOf: 'Array'` when parser returns an array

**Pattern not matching:**
- Test patterns in order - first match wins
- Use more specific patterns first
- Check regex syntax with online regex testers
- Remember `.*` is greedy - use `.*?` for non-greedy matching

---

**Result:** If your enhancement requires custom parsing, you now have pattern configurations in `emc.mjs` using built-in parsers. If not needed, skip this step and proceed to Step 8.

### Step 8: Configure VS Code File Nesting

Set up VS Code to nest generated .json files under their corresponding .mjs source files for better project organization.

**Why this step?** The build process generates .json files from .mjs files (e.g., emc.mjs → emc.json). File nesting in VS Code's explorer keeps these related files grouped together, reducing visual clutter and making it clear which JSON files are generated artifacts.

**Instructions:**

1. Create a `.vscode` folder in your project root if it doesn't exist
2. Create or open `.vscode/settings.json`
3. Add the following settings (merge with existing settings if the file already has content):

```json
{
    "explorer.fileNesting.patterns": {
        "*.mjs": "${capture}.json"
    },
    "explorer.fileNesting.enabled": true
}
```

**What this does:**
- `"*.mjs": "${capture}.json"` - Nests any .json file under its matching .mjs file (e.g., emc.json nests under emc.mjs)
- `"explorer.fileNesting.enabled": true` - Enables the file nesting feature in VS Code's explorer

**Result:** In VS Code's file explorer, generated JSON files will appear nested under their source .mjs files, making the project structure cleaner and more intuitive.

### Step 8a: Configure Auto-Build Hook (Optional but Recommended)

Set up a Kiro hook to automatically rebuild JSON configuration files when .mjs files are saved.

**Why this step?** Manually running `npm run build` after every change to emc.mjs or [emoji].mjs is tedious and easy to forget. A Kiro hook automates this, ensuring your JSON files are always up-to-date.

**Instructions:**

1. Use Kiro to create the hook by saying: "Create a hook that runs npm run build when emc.mjs or [emoji].mjs is saved"

   Or manually create `.kiro/hooks/auto-build-config.kiro.hook` with:

```json
{
    "name": "Auto-build Configuration",
    "version": "1.0.0",
    "description": "Automatically runs npm run build when emc.mjs or emoji .mjs files are saved, regenerating the JSON configuration files",
    "when": {
        "type": "fileEdited",
        "patterns": ["emc.mjs", "⿻.mjs"]
    },
    "then": {
        "type": "runCommand",
        "command": "npm run build",
        "timeout": 10000
    }
}
```

2. Adjust the patterns array to match your emoji filename if different from `⿻.mjs`
3. If you don't have an emoji variant, use: `"patterns": ["emc.mjs"]`

**What this does:**
- Watches for saves to emc.mjs and emoji .mjs files
- Automatically runs `npm run build` to regenerate JSON files
- Completes within 10 seconds (configurable via timeout)
- Keeps your runtime configuration in sync with source files

**Result:** Your JSON configuration files will automatically regenerate whenever you save the source .mjs files, eliminating manual build steps during development.

### Step 9: Create Modern Enhancement Class

Transform the legacy enhancement class to use the modern architecture with roundabout and assign-gingerly.

**Why this step?** The legacy class extended BE (be-enhanced) and used a static config object. The modern approach uses a standalone class with constructor-based initialization, leveraging roundabout for reactive property management and assign-gingerly for property assignment.

**Key Changes:**

1. **No base class**: Class doesn't extend anything - it's a plain JavaScript class
2. **No static config**: Configuration is now in emc.mjs, not in the class
3. **Constructor pattern**: Uses constructor with enhancedElement, ctx, and initVals parameters
4. **No WeakRef boilerplate**: The roundabout library automatically handles weak references for properties listed in `customData.weakRef.properties`
5. **Configuration from ctx, not JSON import**: The `ctx` parameter (typed as `SpawnContext`) carries the full EMC configuration via `ctx.emc`, so the enhancement class does NOT need to import `emc.json`. This avoids duplicate JSON parsing when both the canonical name and emoji shorthand are used.
6. **Single library call**: Only roundabout is called - no separate assignGingerly import needed
7. **No bootUp/export boilerplate**: Simply export the class, no await bootUp() needed
8. **BAP → AP**: Replace all BAP type references with AP
9. **Class name stays PascalCase**: The exported JS class keeps its `Be[ClassName]` / `Do[ClassName]` name. Only the *registration key* differs — `enhKey` in `emc.mjs` keeps the legacy `enhPropKey` (camelCase, e.g. `beLiterate`), because that is what consumers use to read the enhancement (`event.enh`, and traditional camelCase property access reads better).

**Instructions:**

1. Create `be-[project-name].js` (or `do-[project-name].js`) in your project root
2. Start with the required imports — note there is **no `emc.json` import**:

```javascript
// @ts-check
/** @import {Actions, PAP, AllProps, AP} from './types/[project-name]/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;
```

**Important:** The class does NOT import `emc.json`. Instead, the full EMC configuration (including `customData`) is passed through the `ctx` parameter by the mount-observer/assign-gingerly infrastructure. This means:
- Only one JSON file is parsed by the browser (whichever EMC script triggered the spawn)
- The enhancement class is name-agnostic — it works identically whether spawned by `emc.json` or an emoji variant JSON
- No duplicate JSON imports when using emoji shorthand aliases

3. Add the class with the standard boilerplate:

```javascript
/**
 * @implements {Actions}
 */
class Be[ClassName] {

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

    // Copy your action methods here, replacing BAP with AP
}

export { Be[ClassName] }
```

**Key pattern — extracting customData from ctx.emc:**
```javascript
const {customData} = /** @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>} */ (ctx.emc);
```
The `ctx.emc` property is typed as `any` on `SpawnContext`, so you cast it to your specific `EMC` parameterization to get full type safety on `customData`.

**IMPORTANT — Update the `init` signature in types.d.ts:** The `Actions` interface in `types/[project-name]/types.d.ts` must be updated to match the new 4-parameter `init` method. The legacy signature has 3 parameters (no `ctx`), but the modern architecture passes `ctx` through so the class can access `ctx.emc`. If you skip this, `@ts-check` will report "Expected 3 arguments, but got 4" in the constructor and a signature mismatch on `init`.

Add `SpawnContext` to the import and update the `init` signature:

Before:
```typescript
import { ElementEnhancementGateway } from "../assign-gingerly/types";

export interface Actions{
    init(self: AP, enhancedElement: Element, initVals: PAP): Promise<void>;
}
```

After:
```typescript
import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface Actions{
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
}
```

4. **Copy action methods** from the legacy class:
   - Remove the static config section entirely
   - Copy all action methods (like addCloneBtn, setBtnContent, etc.)
   - Replace all `BAP` type annotations with `AP`
   - Keep the method implementations the same
   - **Update import paths**: Replace `'mount-observer/refid/nudge.js'` with `'mount-observer/nudge.js'` (whether dynamic import or top-level import)

5. **Apply default values** in the init method:
   - Extract `customData` from `ctx.emc` with a cast to your EMC type
   - Pass all initial values through the `initialPropVals` property in roundabout options
   - Spread values in order: `enhancedElement`, then `defaultPropVals`, then `initVals`
   - This ensures defaults are applied, but can be overridden by `initVals`

6. **Remove legacy code**:
   - Remove `await BeClonable.bootUp();` at the bottom
   - Remove imports from be-enhanced (BE, resolved, rejected, propInfo)
   - Remove imports from trans-render that were only used in static config
   - Remove any separate assignGingerly imports - roundabout handles initialization

7. **Update utility imports**:
   - Replace `trans-render/lib/findAdjacentElement.js` with `be-hive/findAdjacentElement.js`
   - The be-hive package provides common utilities that were previously in trans-render

**CRITICAL - Avoid Compact/Action Conflicts:**

When migrating the static config to emc.mjs, be careful not to define the same method in both `actions` and `compacts`:

- **Compacts** automatically call methods when properties change (e.g., `when_triggerInsertPosition_changes_call_addDeleteBtn`)
- **Actions** define when methods should be called based on property availability (e.g., `ifAllOf: ['prop1', 'prop2']`)
- If a method is already invoked by a compact, DO NOT add it to actions - this will cause a "Conflict detected" error
- Example: If you have `when_triggerInsertPosition_changes_call_addDeleteBtn: 0` in compacts, do NOT add `addDeleteBtn` to actions

**Example Transformation:**

Legacy class:
```javascript
import { BE } from 'be-enhanced/BE.js';

class BeClonable extends BE {
    static config = {
        propDefaults: { byob: true },
        actions: { addCloneBtn: { ifAllOf: ['triggerInsertPosition'] } }
    };

    async addCloneBtn(self) {
        // method implementation
    }
}

await BeClonable.bootUp();
export { BeClonable }
```

Modern class:
```javascript
// @ts-check
/** @import {Actions, PAP, AllProps, AP} from './types/be-clonable/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway, SpawnContext} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;

/**
 * @implements {Actions}
 */
class BeClonable {
    
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

    async addCloneBtn(self) {
        // same method implementation
    }
}

export { BeClonable }
```

**Result:** You now have a modern enhancement class that uses roundabout for reactive properties and integrates with the emc.mjs configuration.

### Step 10: Create Emoji Shorthand Configuration (Optional)

If your project has an emoji shorthand in the README title, create a corresponding .mjs file that generates a variant configuration using the emoji as the base attribute.

**Why this step?** Many be-* projects support both a full name (e.g., `be-clonable`) and an emoji shorthand (e.g., `⿻`) for brevity. This step creates a separate JSON configuration that uses the emoji as the base attribute name, allowing users to write `<div ⿻>` instead of `<div be-clonable>`.

**When to do this:** Only if your README.md title includes an emoji in parentheses, like `# be-clonable (⿻)`.

**Instructions:**

1. Identify the emoji from your README.md title (the character in parentheses)
2. Create `[emoji].mjs` in your project root (e.g., `⿻.mjs`)
3. Use this template:

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
}

export function render(){
    return JSON.stringify(emc, null, 4);
}

console.log(render());
```

4. Replace `[emoji]` with your actual emoji character
5. Replace `[project-name]` with your project name in the import

**What this does:**
- Imports the base emc.json configuration
- Creates a variant that overrides the `enhKey` and `base` attribute to use the emoji
- Generates a separate JSON file (e.g., `⿻.json`) when the build script runs

**Example:**

For be-clonable with emoji `⿻`:

```javascript
import myJSON from './emc.json' with {type: 'json'};

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps} from './types/be-clonable/types' */

/**
 * @type {EMC<any, AllProps> }
 */
const emc = {
    ...myJSON,
    enhConfig: {
        ...myJSON.enhConfig,
        enhKey: '⿻',
        withAttrs: {
            ...myJSON.enhConfig.withAttrs,
            base: '⿻'
        }
    }
}

export function render(){
    return JSON.stringify(emc, null, 4);
}

console.log(render());
```

**IMPORTANT — Spread `...myJSON` at the top level:** The `...myJSON` spread ensures that all top-level properties from `emc.json` (including `customData`) are carried over into the emoji variant. Without this, the emoji JSON would only contain `enhConfig` and the enhancement class would not have access to its configuration (actions, weakRef, defaultPropVals, etc.) when spawned via the emoji attribute.

**Result:** When you run `npm run build`, both `emc.json` and `⿻.json` will be generated, allowing users to use either the full name or emoji shorthand.

### Step 11: Update Tests and Demo Files

Update test and demo HTML files to use the modern be-hive registration pattern.

**Why this step?** The legacy architecture used direct imports of emc.js files. The modern approach uses be-hive's declarative `<be-hive>` element with `<script type=emc>` tags to load enhancement configurations.

**Instructions:**

1. **Update test HTML files** (e.g., `tests/test1.html`):
   - Replace the legacy import pattern:
     ```html
     <script type=module>
         import '/emc.js';
     </script>
     ```
   - With the modern be-hive pattern:
     ```html
     <be-hive>
         <script type=emc src="[project-name]/emc.json"></script>
     </be-hive>
     <script type=module>
         import 'be-hive/be-hive.js';
     </script>
     ```
   - Replace `[project-name]` with your actual project name (e.g., `be-delible`)
   - **Important**: Reference `emc.json` (not `emc.mjs`) - this reduces dependency on special web server behavior and makes the markup portable across different hosting environments without modification

2. **If using custom parsers (Step 7a), register the parser in HTML:**
   - When your enhancement uses a custom parser like `parse-pattern-statements`, you must register it in the HTML before loading the EMC configuration
   - Add a `<script type=emc-parser>` tag that loads the parser and assigns it a name
   - Use `wait-for-parsers` attribute on the EMC script to ensure the parser is loaded first
   - Example for enhancements using `parse-pattern-statements`:
     ```html
     <be-hive>
         <script type=emc-parser 
                 src="be-hive/parsers/parse-pattern-statements.js" 
                 parser-name=parse-pattern-statements></script>
         <script type=emc 
                 src="do-invoke/🕹️.json" 
                 wait-for-parsers=parse-pattern-statements></script>
     </be-hive>
     <script type=module>
         import 'be-hive/be-hive.js';
     </script>
     ```
   - **Key attributes:**
     - `type=emc-parser` - Identifies this as a parser registration script
     - `src` - Path to the parser module (e.g., `be-hive/parsers/parse-pattern-statements.js`)
     - `parser-name` - The name you used in `emc.mjs` for the `parser` property
     - `wait-for-parsers` - Comma-separated list of parser names to wait for before processing the EMC

3. **Update demo files** (e.g., `demo/dev.html`) with the same pattern

4. **Update test selectors** in test files:
   - Change button selectors from generic `button` to the specific class (e.g., `.be-delible-trigger`)
   - Verify test logic matches the enhancement behavior

5. **Update playwright.config.ts** to only run Chrome tests:
   - Comment out firefox and webkit projects
   - Add a comment explaining that Chrome 146+ features are required (JSON imports with type assertion)
   - Example:
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

**Complete Working Example (do-invoke):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example 1a</title>
    <!-- #include virtual="/imports.html" -->
    <be-hive>
        <script type=emc-parser 
                src="be-hive/parsers/parse-pattern-statements.js" 
                parser-name=parse-pattern-statements></script>
        <script type=emc 
                src="do-invoke/🕹️.json" 
                wait-for-parsers=parse-pattern-statements></script>
    </be-hive>
    <script type=module>
        import 'be-hive/be-hive.js';
        class MoodStone extends HTMLElement{
            howAmIFeelingAboutToday(targetElement, event){
                console.log({targetElement, event});
            }
        }
        customElements.define('mood-stone', MoodStone);
    </script>
</head>
<body>
    <mood-stone itemscope>
        <button 🕹️=howAmIFeelingAboutToday>Feeling great</button>
    </mood-stone>
</body>
</html>
```

**Common Issues:**

- **Module resolution errors**: If you see "Failed to resolve module specifier" errors for utilities like `findAdjacentElement`, ensure you're importing from `be-hive/findAdjacentElement.js` (not `trans-render/lib/findAdjacentElement.js`)
- **Compact/Action conflicts**: If roundabout reports "Method X is invoked by both a compact and an action", remove the method from the `actions` section in emc.mjs - compacts already handle the invocation
- **WeakRef properties**: Ensure any properties that store element references (like `trigger`, `button`, etc.) are listed in `customData.weakRef.properties` in emc.mjs
- **Parser not found**: If you get errors about parser not being found, ensure:
  - The `parser-name` attribute matches the `parser` value in your `emc.mjs`
  - The `wait-for-parsers` attribute lists all required parsers
  - The parser script loads before the EMC script

**Result:** Tests and demos should now work with the modern architecture. Run `npm test` to verify.
---

*This document is a living guide that will be expanded with detailed instructions for each conversion step.*


## Lessons Learned from Recent Conversions

### Emoji Shorthand Configuration (⏻.mjs)

**Issue:** When creating emoji shorthand files, the generated JSON was missing the `customData` section, causing the enhancement to fail silently.

**Solution:** Always include `customData` when spreading the base configuration:

```javascript
const emc = {
    enhConfig: {
        ...myJSON.enhConfig,
        enhKey: '⏻',
        withAttrs: {
            ...myJSON.enhConfig.withAttrs,
            base: '⏻'
        }
    },
    customData: myJSON.customData  // ← CRITICAL: Don't forget this!
}
```

**Why:** The `customData` section contains essential configuration for roundabout:
- `actions` - Defines when methods should be called
- `weakRef` - Specifies which properties should use weak references
- `compacts` - Defines property change handlers
- `defaultPropVals` - Default property values

Without `customData`, roundabout won't know how to initialize the enhancement, and the enhancement will appear to load but won't respond to events.

### Property Inference from Name Attribute

**Issue:** When implementing inference from the `name` attribute (for empty attribute values like `⏻` with no value), the inferred statement structure must match the parser's output structure.

**Solution:** Ensure the inferred statement matches your type definitions:

```javascript
// If using simple structure with just 'prop':
if(statements.length === 0){
    const name = enhancedElement.getAttribute('name');
    if(name){
        statements.push({
            value: {
                prop: name,              // ← Match your TogglingParameters type
                localEventType: 'click'
            }
        });
    }
}
```

**Don't use nested structures** like `remoteSpecifier: { targetPart: name }` unless your types actually define that structure.

### Chained Accessor Syntax for Selectors

**Issue:** When using selectors with properties like `[#myLight].isOn`, the simple period `.` conflicts with statement splitting (periods are used to separate multiple statements in a single attribute).

**Solution:** Use the chained accessor `?.` syntax instead:

```html
<!-- ❌ Wrong - period conflicts with statement splitting -->
<button ⏻="[#myLight].isOn">Toggle</button>

<!-- ✅ Correct - chained accessor avoids conflict -->
<button ⏻="[#myLight]?.isOn">Toggle</button>
```

**Implementation:** Update your regex patterns to match `?.` instead of `.`:

```javascript
// Match [selector]?.property instead of [selector].property
const selectorMatch = prop.match(/^\[(.+?)\](?:\?\.(.+))?$/);
```

**Why:** The `parse-grouped-capture-statements` parser splits on periods to handle multiple statements like `prop1. prop2. prop3`. Using `?.` avoids this conflict while maintaining readable syntax.

### Parser Selection: parse-grouped-capture-statements vs parse-pattern-statements

**When to use `parse-grouped-capture-statements`:**
- Your target object is **flat** (no nested properties)
- Example: `{ prop: "isHappy", localEventType: "click" }`
- Lighter weight, simpler patterns
- Good for most basic enhancements

**When to use `parse-pattern-statements`:**
- You need **nested object structures** using dot notation in capture groups
- Example: `{ targetSpecifier: { hostOrPeerMethodName: "method" }, localEventType: "click" }`
- Required when using `dssKeys` for DSS (DOM Selector Syntax) parsing
- Heavier footprint but more powerful

**Key difference:** The parser choice affects your type definitions and how you structure parsed data. Choose based on your data structure needs, not syntax complexity.

### Testing Strategy

**Start simple, then expand:**

1. **Get the basic case working first** (Example1a - simple property toggle on host)
2. **Add inference** (Example1aInfer - infer from name attribute)
3. **Add event customization** (Example1b - custom event types)
4. **Add selector support** (Example1c - toggle peer elements)

**Don't try to implement all features at once.** Each step builds on the previous one and helps identify issues early.

### Common Pitfalls

1. **Missing customData in emoji JSON** - Enhancement loads but doesn't work
2. **Type mismatch in inference** - Using nested structure when types expect flat structure
3. **Wrong parser in HTML** - HTML references `parse-pattern-statements` but emc.mjs uses `parse-grouped-capture-statements`
4. **Period vs chained accessor** - Using `.` instead of `?.` for selector properties
5. **Forgetting to rebuild** - After changing emc.mjs or emoji.mjs, always run `npm run build`
6. **Hydrate fires before all attributes are read** - Attribute props are assigned one at a time during initialization; use the `initialized` flag pattern (see below) when an action must wait for all of them

### Blocking an Action Until All Attributes Are Read

When converting an enhancement whose `hydrate` (or other action) depends on multiple attribute-derived props, it's often predictable that nothing should happen until all relevant attributes have been read. Gating on the props alone doesn't work:

- `ifKeyIn` alone means **at least one** of the listed props is defined, so the action can fire after the first attribute is read with the rest still `undefined`.
- With `ifKeyIn` and `ifAllOf` combined, roundabout only runs the action when the *changed* property is in `ifKeyIn` — a prop listed only in `ifAllOf` never triggers it.

The proven fix (from three-peat): add `initialized?: boolean` to `AllProps`, set `self.initialized = true` in `init` immediately after `await roundabout(...)`, and gate the action on it in both lists:

```javascript
actions: {
    hydrate: {
        ifKeyIn: ['src', 'listProp', 'initialized'],
        ifAllOf: ['enhancedElement', 'initialized']
    }
}
```

`initialized` flips only after `roundabout()` returns (all attribute reads complete), and including it in `ifKeyIn` makes its change the trigger. Keep the attribute props in `ifKeyIn` too, so later attribute changes still re-trigger the action. See `NewEnhancementInstructions.md` ("Blocking an Action Until All Attributes Are Read") for the full step-by-step recipe.

### Debugging Tips

1. **Check the generated JSON** - Verify emc.json and emoji.json have all expected sections
2. **Console log parsedStatements** - Add `console.log({parsedStatements})` in hydrate to see what the parser produced
3. **Verify parser loading** - Check browser console for "Parser not found" errors
4. **Test incrementally** - Get one example working before moving to the next
5. **Compare with working examples** - Look at do-inc and do-invoke for reference patterns

---

*Last updated: April 2026 - Based on do-toggle conversion experience*


## Using the Infer Pattern for Element Conventions

### Overview

The modern architecture provides a standardized way to infer element properties and event types through the **`infer` pattern** from `assign-gingerly`. This eliminates the need for hardcoded element type checks and provides a consistent, extensible approach to element conventions.

### The Infer Function

Add this helper function at the bottom of your enhancement class file:

```javascript
/**
 * @param {Element & ElementEnhancementGateway} from 
 */
async function infer(from){
    return /** @type {ElementInfer} */ (
        /** @type {any} */ (
            from.enh.get((await import('assign-gingerly/Infer.js')).registryItem)
        )
    );
}
```

### What It Provides

The `infer` function returns an `ElementInfer` object with:
- **`eventType`**: The most appropriate event type for the element (e.g., 'click', 'input', 'change')
- **`propName`**: The most appropriate property name for the element (e.g., 'checked', 'value', 'textContent')
- **`value`**: The current value of the inferred property (getter/setter)

### Type Import

Add `ElementInfer` to your imports:

```javascript
/** @import {ElementEnhancementGateway, ElementInfer} from './types/assign-gingerly/types' */;
```

### Usage Examples

#### Example 1: Inferring Event Type

Replace hardcoded event type logic:

```javascript
// ❌ Old approach - hardcoded logic
if (localEventType === undefined) {
    const tagName = enhancedElement.tagName.toLowerCase();
    if(tagName === 'input' || tagName === 'textarea' || tagName === 'select'){
        localEventType = 'input';
    } else {
        localEventType = 'click';
    }
}

// ✅ New approach - use infer
if (localEventType === undefined) {
    localEventType = (await infer(enhancedElement)).eventType;
}
```

#### Example 2: Inferring Property Name

Replace hardcoded property inference:

```javascript
// ❌ Old approach - hardcoded logic
if(!propertyName){
    const tagName = target.tagName.toLowerCase();
    if(tagName === 'input'){
        const inputType = target.getAttribute('type');
        propertyName = (inputType === 'checkbox' || inputType === 'radio') ? 'checked' : 'value';
    } else {
        propertyName = 'textContent';
    }
}

// ✅ New approach - use infer
if(!propertyName){
    propertyName = (await infer(target)).propName;
}
```

#### Example 3: Inferring from Name Attribute

When the attribute value is empty, infer both event type and property name:

```javascript
// When statements.length === 0, infer from element
if(statements.length === 0){
    const inference = await infer(enhancedElement);
    statements.push({
        value: {
            prop: inference.propName,
            localEventType: inference.eventType
        }
    });
}
```

#### Example 4: Getting/Setting Inferred Property Value

The `infer` object provides direct access to the property value:

```javascript
// Get the inferred property value
const inference = await infer(target);
const currentValue = inference.value;

// Set the inferred property value
inference.value = !inference.value;  // Toggle
```

This is particularly useful in do-toggle when no property is specified:

```javascript
if(propertyName){
    target[propertyName] = !target[propertyName];
} else {
    const inference = await infer(target);
    inference.value = !inference.value;
}
```

### Complete Example: do-toggle

Here's how do-toggle uses the infer pattern throughout:

```javascript
class DoToggle {
    async hydrate(self){
        const { parsedStatements, enhancedElement } = self;
        const {success, statements} = parsedStatements;
        if(!success) throw 400;
        
        // Infer when no statements provided
        if(statements.length === 0){
            const name = enhancedElement.getAttribute('name');
            statements.push({
                value: {
                    prop: name,
                    localEventType: (await infer(enhancedElement)).eventType,
                }
            });
        }
        
        for (const statement of statements) {
            const {value} = statement;
            if(!value) continue;
            
            // Infer event type if not specified
            let { localEventType } = value;
            if (localEventType === undefined) {
                localEventType = (await infer(enhancedElement)).eventType;
            }
            
            enhancedElement.addEventListener(localEventType, e => {
                self.handleEvent(self, e, value);
            });
        }
        // ...
    }

    async handleEvent(self, e, parsedStatement){
        // ... find target element ...
        
        // Use inferred value when no property specified
        if(propertyName){
            target[propertyName] = !target[propertyName];
        } else {
            const inference = await infer(target);
            inference.value = !inference.value;
        }
    }
}

// Helper type at top of file
/** @import {Infer} from './types/inferencer/types' */

// Helper function at bottom of file
/**
 * 
 * @param {Element & ElementEnhancementGateway} from 
 */
async function infer(from){return /** @type {Infer} */ (/** @type {any} */ (from.enh.get((await import('inferencer/inferencer.js')).registryItem)));}
```

### Benefits

1. **Consistency**: All enhancements use the same inference logic
2. **Extensibility**: New element types can be supported by updating assign-gingerly, not each enhancement
3. **Maintainability**: No duplicated element type checking code
4. **Type Safety**: TypeScript definitions ensure correct usage
5. **Future-proof**: Custom elements can provide their own inference hints

### How It Works

The `infer` function:
1. Accesses the enhancement gateway on the element (`from.enh`)
2. Gets the `Infer` enhancement instance from the registry
3. Returns an object with inferred `eventType`, `propName`, and `value` getter/setter

The `Infer` enhancement (from assign-gingerly) analyzes the element and provides sensible defaults based on:
- Element tag name (input, button, textarea, etc.)
- Input type attribute (checkbox, radio, text, etc.)
- Name attribute (as fallback for property name)
- Itemprop attribute (for microdata-aware properties)
- Custom element conventions

### Migration Checklist

When converting an enhancement to use the infer pattern:

- [ ] Add `ElementInfer` to type imports
- [ ] Add the `infer` helper function at the bottom of the file
- [ ] Replace hardcoded event type inference with `(await infer(element)).eventType`
- [ ] Replace hardcoded property name inference with `(await infer(element)).propName`
- [ ] Use `inference.value` for getting/setting inferred properties
- [ ] Update empty statement handling to use infer
- [ ] Test with various element types (button, input, checkbox, etc.)

### Reference

For more details on the inference system, see:
- [assign-gingerly documentation](https://github.com/bahrus/assign-gingerly#accessing-the-enhancement-instance)
- Working examples: do-toggle, do-inc, do-invoke

---

*Added: April 2026 - Standardized inference pattern*


## Binding Enhancements: Patterns from be-bound

### Overview

be-bound is the first binding-focused enhancement converted to the modern architecture. It provides two-way data binding between elements and their hosts or peers. The patterns below apply to any enhancement that needs to synchronize property values between elements (e.g., be-observant, be-synced, or similar future packages).

### The InferencedPropagator Pattern

Binding enhancements need to detect property changes on arbitrary elements — both custom elements (which may have roundabout propagators) and native elements (which don't). The `inferencer` package provides `InferencedPropagator` which handles this transparently:

```javascript
const localInference = await infer(enhancedElement);
const localPropagator = await localInference.getPropagator();

// Works for both custom elements (uses native propagator) and built-in elements (creates InferencedPropagator)
localPropagator.addEventListener('value', () => {
    // property changed
});
```

**How `getPropagator()` works:**
- For **custom elements** with roundabout: returns the element's native `propagator` EventTarget (already set up by roundabout)
- For **built-in elements**: creates an `InferencedPropagator` that uses best-effort detection strategies (native events, setter interception, attribute observation, polling fallback)

**Key insight:** The propagator's `addEventListener` uses the **property name** as the event type (not a DOM event name). This is the unified interface — you always listen for `'value'`, `'checked'`, `'textContent'`, etc., regardless of whether it's a custom element or native element underneath.

### contentEditable Elements

The `InferencedPropagator` supports contentEditable elements by detecting `element.isContentEditable` and listening for the native `input` event. When the bound property is `textContent`, `innerHTML`, or `innerText`, user edits in contentEditable elements will trigger propagation.

This is handled in `InferencedPropagator.#getNativeEventType`:

```typescript
if (element instanceof HTMLElement && element.isContentEditable) {
    if (propName === 'textContent' || propName === 'innerHTML' || propName === 'innerText') {
        return 'input';
    }
}
```

**Important:** The browser does NOT fire the `textContent` setter when users type in a contentEditable element — it mutates the DOM directly. The `input` event is the only reliable signal for user edits. Any binding enhancement targeting contentEditable must handle this case.

### upSearch: Resolving Remote Targets

The `inferencer/upSearch.js` function resolves remote binding targets with a simple convention:

```javascript
const target = await upSearch(enhancedElement, remoteId);
```

- If `remoteId` is truthy: calls `getRootNode().getElementById(remoteId)` (finds by ID within the same root)
- If `remoteId` is falsy/undefined: traverses up to the nearest `[itemscope]` ancestor, or the shadow root's host

This means the absence of a remote ID implies "bind to the host element," which is the most common binding case.

### Attribute Syntax: Disambiguating IDs vs Property Names

For binding enhancements, the attribute value often needs to reference either an element (by ID) or a property (by name). Use `#` as the disambiguator:

- `#search` → element with `id="search"` (remoteId)
- `currentMood` → property name on the host (remoteProp)

Parser patterns should be ordered most-specific first:
```javascript
// Match ID first (has # prefix)
{ pattern: "^with #(?<remoteId>\\S+)" }
// Then match property name (no prefix)
{ pattern: "^with (?<remoteProp>[\\w\\.]+)" }
```

### Path-Based Property Access

When binding to nested properties (e.g., `form.rating.value`), use the `?.` path syntax to avoid conflicts with the period-based statement separator:

```html
<form 🪢="between ?.rating?.value@change and #alternativeRating.">
```

Implement path resolution in your enhancement:

```javascript
function resolvePath(obj, path) {
    if (!path.startsWith('?.')) return obj[path];
    const segments = path.split('?.').filter(s => s.length > 0);
    let current = obj;
    for (const seg of segments) {
        if (current == null) return undefined;
        current = current[seg];
    }
    return current;
}

function setPath(obj, path, value) {
    if (!path.startsWith('?.')) { obj[path] = value; return; }
    const segments = path.split('?.').filter(s => s.length > 0);
    let current = obj;
    for (let i = 0; i < segments.length - 1; i++) {
        if (current == null) return;
        current = current[segments[i]];
    }
    if (current != null) current[segments[segments.length - 1]] = value;
}
```

### Explicit Event Listening with `@` Syntax

When the inferred event isn't appropriate (e.g., binding a form's `rating.value` which changes on `change` events from radio buttons), allow users to specify the event by appending `@eventName` to the property:

```html
<form 🪢="between ?.rating?.value@change and #alternativeRating.">
```

In `hydrate`, check for `localEvent` and use it instead of the inferred propagator:

```javascript
let { localEvent } = value;
if (localEvent) {
    enhancedElement.addEventListener(localEvent, () => {
        self.reconcileValues(self, value, 'lToR');
    }, { signal: abortController.signal });
} else {
    localPropagator.addEventListener(localProp, () => {
        self.reconcileValues(self, value, 'lToR');
    });
}
```

### Tie-Breaking for Initial Reconciliation

When two-way binding is first established, both sides may already have values. A `breakTie` function determines which value wins based on type specificity:

```
object > function > symbol > bigint > number > boolean > string > null > undefined
```

Within the same type, longer string representations win. Equal values result in no action. This avoids overwriting meaningful data with defaults during initial binding.

### Caching Inference Results

If your enhancement calls `reconcileValues` repeatedly (e.g., on every property change), cache the `Infer` instance to avoid re-computing inference on every call:

```javascript
#localInference;

async hydrate(self) {
    const localInference = await infer(enhancedElement);
    this.#localInference = localInference;
    // ...
}

async reconcileValues(self, rule, direction) {
    let { remoteProp, localProp } = rule;
    if (remoteProp === undefined) remoteProp = this.#localInference?.defaultRemoteBindingPropName;
    if (localProp === undefined) localProp = this.#localInference?.valueProperty;
    // ...
}
```

### Preventing Duplicate Enhancement Spawns

When an element has multiple `<be-hive>` instances observing it (e.g., one in the document and one in a shadow root), the same enhancement may be spawned multiple times. The mount-observer's `EMCScript.handleMount` uses an in-flight guard to prevent this:

```javascript
const inflightKey = `__enhInFlight_${String(enhKey)}`;
if (mountedElement[inflightKey]) return;
mountedElement[inflightKey] = true;
```

This is handled at the infrastructure level — individual enhancements don't need to implement their own duplicate guards.

### Complete Parser Config Example (be-bound)

be-bound's parser config demonstrates handling multiple syntax variations in a single enhancement:

```javascript
const parsePatterns = [
    // Path + event + remote ID
    { name: "betweenPathEventAndRemoteId",
      pattern: "^between (?<localProp>\\?\\.[\\w\\?\\.]+)@(?<localEvent>[\\w]+) and #(?<remoteId>\\S+)" },
    // Path + event + remote prop
    { name: "betweenPathEventAndRemoteProp",
      pattern: "^between (?<localProp>\\?\\.[\\w\\?\\.]+)@(?<localEvent>[\\w]+) and (?<remoteProp>[\\w\\.]+)" },
    // Simple prop + event + remote ID
    { name: "betweenLocalPropEventAndRemoteId",
      pattern: "^between (?<localProp>[\\w]+)@(?<localEvent>[\\w]+) and #(?<remoteId>\\S+)" },
    // Simple prop + event + remote prop
    { name: "betweenLocalPropEventAndRemoteProp",
      pattern: "^between (?<localProp>[\\w]+)@(?<localEvent>[\\w]+) and (?<remoteProp>[\\w\\.]+)" },
    // Simple prop + remote ID (no event)
    { name: "betweenLocalPropAndRemoteId",
      pattern: "^between (?<localProp>[\\w]+) and #(?<remoteId>\\S+)" },
    // Simple prop + remote prop (no event)
    { name: "betweenLocalPropAndRemoteProp",
      pattern: "^between (?<localProp>[\\w]+) and (?<remoteProp>[\\w\\.]+)" },
    // Remote by ID, everything inferred
    { name: "withRemoteId", pattern: "^with #(?<remoteId>\\S+)" },
    // Remote prop on host, everything inferred
    { name: "withRemoteProp", pattern: "^with (?<remoteProp>[\\w\\.]+)" }
];
```

**Key design decisions:**
- Patterns ordered most-specific to least-specific (first match wins)
- `#` prefix unambiguously marks element IDs
- `?.` prefix marks path-based property access
- `on` keyword separates the event specification
- Falling through to less-specific patterns enables progressive disclosure of complexity

### Migration Checklist for Binding Enhancements

- [ ] Add `inferencer` to dependencies in package.json
- [ ] Import and use `upSearch` for resolving remote targets
- [ ] Import and use `infer` for getting propagators and inferring defaults
- [ ] Implement `resolvePath` / `setPath` if supporting `?.` path syntax
- [ ] Handle `localEvent` for explicit DOM event listening
- [ ] Implement `breakTie` or equivalent for initial reconciliation
- [ ] Cache inference results to avoid redundant computation
- [ ] Handle contentEditable elements (they need `input` event, not setter interception)
- [ ] Test both directions of binding (local→remote, remote→local, and initial tie)

---

*Added: June 2026 - Based on be-bound conversion to modern architecture*
