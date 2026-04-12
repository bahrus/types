# Conversion Instructions

## Introduction

This document provides step-by-step instructions for converting legacy "be-*" enhancement projects to the modern architecture. The conversion process has been successfully applied to several projects including:

- **[be-clonable](https://github.com/bahrus/be-clonable)** ⭐ **RECOMMENDED REFERENCE** - The most up-to-date implementation with the latest architectural improvements. Use this as your primary reference.
- [be-a-beacon](https://github.com/bahrus/be-a-beacon)
- [be-committed](https://github.com/bahrus/be-committed)
- [be-decked-with](https://github.com/bahrus/be-decked-with)

Each of these repositories contains a "legacy" folder showing the original implementation for reference. When in doubt about implementation details, refer to be-clonable first as it demonstrates the cleanest, most refined patterns.

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

2. Update the `dependencies` section:
   ```json
   "dependencies": {
     "be-hive": "0.1.9",
     "mount-observer": "0.0.16",
     "roundabout-lib": "0.0.2"
   }
   ```
   
   **Note:** Including `mount-observer` as a direct dependency ensures it's installed at the root `node_modules/` level, making it accessible via the import map and available for direct use in your code.

3. Update the `devDependencies` section:
   ```json
   "devDependencies": {
     "@playwright/test": "1.59.1",
     "spa-ssi": "0.0.27"
   }
   ```

4. Run `npm run update` to fetch the latest versions of all dependencies

**Result:** Your package.json should now use the modern dependency set, and running the update script will ensure you have the latest compatible versions.

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
               "mount-observer/": "/node_modules/mount-observer/",
               "roundabout-lib/": "/node_modules/roundabout-lib/"
           }
       }
   </script>
   ```
2. Replace `[project-name]` with your actual project name (e.g., `be-clonable`)
3. The key difference: the project itself maps to `"/"` (root), while dependencies map to `/node_modules/[package]/`

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
        enhKey: '[EnhancementKey]',
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
   - For boolean properties, use the underscore prefix and instanceOf pattern:
     ```javascript
     _nudge: {
         instanceOf: 'Boolean'
     }
     ```
   - The `${base}` template variable references the base attribute name

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

Modern emc.mjs:
```javascript
export const emc = {
    enhConfig: {
        enhKey: 'BeCommitted',
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
5. **Simplified init method**: All initial values (enhancedElement, defaults, and initVals) are passed through roundabout's `initialPropVals` option
6. **Single library call**: Only roundabout is called - no separate assignGingerly import needed
7. **Module-level customData**: Extract customData from emc at the module level for reuse
8. **No bootUp/export boilerplate**: Simply export the class, no await bootUp() needed
9. **BAP → AP**: Replace all BAP type references with AP

**Instructions:**

1. Create `be-[project-name].js` in your project root
2. Start with the required imports:

```javascript
// @ts-check
/** @import {Actions, PAP, AllProps, AP} from './types/[project-name]/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;
/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>}
 */
import emc from './emc.json' with {type: 'json'};

const {customData} = emc;
```

**Important:** The class imports the generated `emc.json` file (not `emc.mjs`). This is the runtime configuration that was built from emc.mjs. Extract `customData` at the module level for use in the init method.

3. Add the class with the standard boilerplate:

```javascript
/**
 * @implements {Actions}
 */
class Be[ClassName] {

    /**
     * @this {AllProps & Actions}
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {*} ctx 
     * @param {AllProps} initVals 
     */
    constructor(enhancedElement, ctx, initVals){
        this.init(this, enhancedElement, initVals);
    }

    /**
     * @param {AllProps} self 
     * @param {Element & ElementEnhancementGateway} enhancedElement 
     * @param {PAP} initVals 
     */
    async init(self, enhancedElement, initVals){
        const {defaultPropVals} = customData;
        /**
         * @type {RoundaboutOptions}
         */
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                ...defaultPropVals,
                ...initVals
            }
        };
        (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
    }

    // Copy your action methods here, replacing BAP with AP
}

export { Be[ClassName] }
```

4. **Copy action methods** from the legacy class:
   - Remove the static config section entirely
   - Copy all action methods (like addCloneBtn, setBtnContent, etc.)
   - Replace all `BAP` type annotations with `AP`
   - Keep the method implementations the same

5. **Apply default values** in the init method:
   - Extract `defaultPropVals` from `customData`: `const {defaultPropVals} = customData;`
   - Pass all initial values through the `initialPropVals` property in roundabout options
   - Spread values in order: `enhancedElement`, then `defaultPropVals`, then `initVals`
   - This ensures defaults are applied, but can be overridden by `initVals`
   - Example:
     ```javascript
     const {defaultPropVals} = customData;
     const raOptions = {
         ...customData,
         vm: this,
         initialPropVals: {
             enhancedElement,
             ...defaultPropVals,
             ...initVals
         }
     };
     (await import('roundabout-lib/roundabout.js')).roundabout(raOptions);
     ```

6. **Remove legacy code**:
   - Remove `await BeClonable.bootUp();` at the bottom
   - Remove imports from be-enhanced (BE, resolved, rejected, propInfo)
   - Remove imports from trans-render that were only used in static config
   - Remove any separate assignGingerly imports - roundabout handles initialization

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
/** @import {Actions, PAP, AllProps, AP} from './types/be-clonable/types' */;
/** @import {RoundaboutOptions} from './types/roundabout/types' */;
/** @import {ElementEnhancementGateway} from './types/assign-gingerly/types' */;
/** @import {EMC} from './types/mount-observer/types' */;
/** @import {RAConfig} from './types/roundabout/types' */;
/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions>>}
 */
import emc from './emc.json' with {type: 'json'};

const {customData} = emc;

class BeClonable {
    
    /**
     * @this {AllProps & Actions}
     */
    constructor(enhancedElement, ctx, initVals){
        this.init(this, enhancedElement, initVals);
    }

    async init(self, enhancedElement, initVals){
        const {defaultPropVals} = customData;
        const raOptions = {
            ...customData,
            vm: self,
            initialPropVals: {
                enhancedElement,
                ...defaultPropVals,
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

**Result:** When you run `npm run build`, both `emc.json` and `⿻.json` will be generated, allowing users to use either the full name or emoji shorthand.

---

*This document is a living guide that will be expanded with detailed instructions for each conversion step.*
