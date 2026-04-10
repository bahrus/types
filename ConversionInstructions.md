# Conversion Instructions

## Introduction

This document provides step-by-step instructions for converting legacy "be-*" enhancement projects to the modern architecture. The conversion process has been successfully applied to several projects including:

- [be-a-beacon](https://github.com/bahrus/be-a-beacon)
- [be-committed](https://github.com/bahrus/be-committed)
- [be-decked-with](https://github.com/bahrus/be-decked-with)

Each of these repositories contains a "legacy" folder showing the original implementation for reference.

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
     "build": "node build-emc.mjs > emc.json && node build-[emoji].mjs > [emoji].json",
     "serve": "node ./node_modules/spa-ssi/serve.js",
     "test": "playwright test",
     "safari": "npx playwright wk http://localhost:8000",
     "update": "ncu -u && npm install"
   }
   ```
   - Replace `[emoji]` with the emoji from your README.md title (e.g., `⿻` for be-clonable)
   - If there's no emoji in the README title, omit the `&& node build-[emoji].mjs > [emoji].json` part

2. Update the `dependencies` section:
   ```json
   "dependencies": {
     "be-hive": "0.1.9",
     "roundabout-lib": "0.0.2"
   }
   ```

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

---

*This document is a living guide that will be expanded with detailed instructions for each conversion step.*
