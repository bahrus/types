# Requirements: Convert [PROJECT_NAME] to Modern Architecture

## Overview

Convert the legacy [PROJECT_NAME] enhancement project from the be-enhanced architecture to the modern be-hive + roundabout architecture.

## Reference Documentation

Complete conversion instructions: `#[[file:../../ConversionInstructions.md]]`

## User Stories

### US-1: Migrate Type Definitions
**As a** developer  
**I want** type definitions in the modern `types` submodule  
**So that** the project uses the clearer naming convention

**Acceptance Criteria:**
- Type definitions exist at `types/[project-name]/types.d.ts`
- `ts-refs` submodule is removed
- Types are accessible from the new location

### US-2: Preserve Legacy Implementation
**As a** developer  
**I want** the original implementation preserved in a `legacy` folder  
**So that** I can reference it during and after conversion

**Acceptance Criteria:**
- All `.js`, `.mjs`, and `.json` files (except package*.json) are moved to `legacy/`
- Legacy folder contains complete working implementation
- Root directory is ready for new implementation

### US-3: Update Dependencies
**As a** developer  
**I want** modern dependencies (be-hive, roundabout-lib)  
**So that** the project uses the new architecture

**Acceptance Criteria:**
- package.json has be-hive and roundabout-lib dependencies
- Legacy dependencies (be-enhanced, trans-render) are removed
- Build scripts use the new pattern (node emc.mjs > emc.json)
- `npm run update` successfully updates to latest versions

### US-4: Configure Import Maps
**As a** developer  
**I want** a proper imports.html file  
**So that** browser-based ES modules work correctly

**Acceptance Criteria:**
- imports.html exists with correct import map structure
- Project maps to "/" root
- Dependencies map to /node_modules/[package]/

### US-5: Establish Coding Standards
**As a** developer  
**I want** documented coding standards  
**So that** the codebase follows consistent conventions

**Acceptance Criteria:**
- `.kiro/steering/coding-standards.md` exists
- Standards cover import maps, file extensions, and TypeScript support
- Standards are automatically included in Kiro context

### US-6: Modernize Type Definitions
**As a** developer  
**I want** standalone type definitions without external dependencies  
**So that** types are portable and self-contained

**Acceptance Criteria:**
- No imports from trans-render or be-enhanced in types
- `EndUserProps` doesn't extend IEnhancement
- `AllProps` includes `enhancedElement: Element`
- `BAP` type is removed, replaced with `AP`

### US-7: Create Build Configuration
**As a** developer  
**I want** an emc.mjs build script  
**So that** configuration is generated at build time

**Acceptance Criteria:**
- emc.mjs exists with proper structure
- Uses withAttrs pattern for attribute mapping
- customData contains actions, handlers, compacts from legacy config
- No propDefaults or propInfo (inferred by roundabout)
- `npm run build` generates valid emc.json

### US-8: Configure VS Code
**As a** developer  
**I want** VS Code file nesting configured  
**So that** generated JSON files are organized under their source .mjs files

**Acceptance Criteria:**
- `.vscode/settings.json` exists
- File nesting patterns configured for *.mjs -> *.json
- File nesting is enabled

### US-9: Create Modern Enhancement Class
**As a** developer  
**I want** a modern enhancement class using roundabout  
**So that** the implementation uses the new architecture

**Acceptance Criteria:**
- be-[project-name].js exists
- Class doesn't extend anything
- Uses constructor with enhancedElement, ctx, initVals
- Uses WeakRef for element storage
- init method integrates roundabout
- Default values set via assignGingerly in init
- All action methods copied with BAP replaced by AP
- No bootUp or legacy imports

### US-10: Create Emoji Shorthand (Optional)
**As a** developer  
**I want** an emoji shorthand configuration  
**So that** users can use the shorter emoji syntax

**Acceptance Criteria:**
- [emoji].mjs exists (if emoji in README title)
- Imports and extends emc.json
- Overrides enhKey and base to use emoji
- `npm run build` generates [emoji].json

## Correctness Properties

### CP-1: Build Success
**Property:** The project builds without errors  
**Test:** Run `npm run build` and verify exit code 0

### CP-2: Test Compatibility
**Property:** All existing tests pass with the new implementation  
**Test:** Run `npm test` and verify all tests pass

### CP-3: Configuration Validity
**Property:** Generated JSON configuration is valid and complete  
**Test:** Parse emc.json and verify all required fields exist

### CP-4: Type Safety
**Property:** TypeScript checking passes with @ts-check  
**Test:** No TypeScript errors in be-[project-name].js

### CP-5: Legacy Preservation
**Property:** Legacy implementation is complete and unchanged  
**Test:** Verify all original files exist in legacy/ folder

## Non-Functional Requirements

### Performance
- Build time should be under 5 seconds
- No runtime performance degradation vs legacy

### Maintainability
- Code follows documented standards
- Clear separation between configuration and implementation
- Consistent with other converted projects

### Documentation
- ConversionInstructions.md is the source of truth
- Each step is clearly documented
- Examples provided for complex transformations

## Dependencies

- Node.js and npm installed
- Access to types submodule
- Original project in working state

## Constraints

- Must maintain backward compatibility with existing HTML usage
- Must preserve all existing functionality
- Must follow the 10-step conversion process in order

## Success Metrics

- ✅ All 10 conversion steps completed
- ✅ `npm run build` succeeds
- ✅ `npm test` passes
- ✅ No TypeScript errors
- ✅ Legacy code preserved
- ✅ Modern architecture verified
