# New Custom Element Instructions

## Introduction

This document provides step-by-step instructions for creating a **brand new** custom element project that extends `ElementMaker`. Custom elements built this way inherit a catalog of composable features (form association, attribute sourcing, roundabout reactive wiring, CSS reflection) out of the box, and only need to declare what's unique to them.

**Note:** This guide is for **custom elements** — concrete components registered with `customElements.define()`. It does NOT apply to:
- Custom element features (composable behavior classes injected into elements) — see [NewCustomElementFeature.md](./NewCustomElementFeature.md)
- Enhancements (declarative behaviors attached to existing elements via attributes) — see [NewEnhancementInstructions.md](./NewEnhancementInstructions.md)

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


## Step 4: Create imports.html

```html
<script type=importmap>
    {
        "imports": {
            "assign-gingerly/": "/node_modules/assign-gingerly/",
            "el-maker/": "/node_modules/el-maker/",
            "roundabout-lib/": "/node_modules/roundabout-lib/",
            "[project-name]/": "/",
        }
    }
</script>
```

**Notes:**
- Include all transitive dependencies that are loaded in the browser
- The project itself maps to `/` for local development

## Fork in the road -- HTML first vs JS First

When developing such a web component, a fundamental question must be asked -- is the web component heavy on HTML / CSS, or is the web component a (usually non visual) component that is heavy on non-reusable JavaScript - JS First?

If the decision is JS-first, follow the directions of [New JS First Custom Element](./NewJSFirstCustomElement.md).

If the decision is mostly code free, HTML-first, follow the directions of [New HTML First Custom Element](./NewHTMLFirstCustomElement.md).


**Notes:**
- Use exact versions, not ranges (no `^` or `~`)
- Run `npm run update` after creating package.json to install dependencies



## What ElementMaker Provides

By extending `ElementMaker`, your element inherits these loaded on-demand features:

| Key/Feature          | Package     | Description | Source |
|--------------|-------------|-------------|--------|
| truthSourcer | [truth-sourcer](https://www.npmjs.com/package/truth-sourcer) | Attribute/property binding and truth-sourcing for custom elements | [GitHub](https://github.com/bahrus/truth-sourcer) |
| reflector    | [be-reflective](https://www.npmjs.com/package/be-reflective) | CSS custom state reflection from computed styles | [GitHub](https://github.com/bahrus/be-reflective) |
| faceUp       | [face-up](https://www.npmjs.com/package/face-up) | Form Associated Custom Element behavior via ElementInternals | [GitHub](https://github.com/bahrus/face-up) |
| roundabout   | [roundabout-lib](https://www.npmjs.com/package/roundabout-lib) | Reactive view-model binding with template rendering and computed property orchestration | [GitHub](https://github.com/bahrus/roundabout-lib) |
| templateMaker | [templ-maker](https://www.npmjs.com/package/templ-maker) | Extracts a DOM fragment into a reusable template and clones it per instance (works with cede scripts) | [GitHub](https://github.com/bahrus/templ-maker) |
| fontMgr       | [font-face-feature](https://www.npmjs.com/package/font-face-feature) | Installs global fonts | [GitHub](https://github.com/bahrus/font-face-feature)

Plus infrastructure:
- `propagator` (EventTarget) for inter-feature communication
- `#internals` (ElementInternals) shared via `getSharedContext`
- `attachInternals()` called in the constructor
- Async `fallbackSpawn` for lazy-loading all feature implementations






