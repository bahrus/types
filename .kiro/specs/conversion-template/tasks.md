# Tasks: Convert [PROJECT_NAME] to Modern Architecture

## Task List

- [ ] 1. Migrate Type Definitions
  - [ ] 1.1 Check if ts-refs folder exists
  - [ ] 1.2 Copy ts-refs/[project-name] to types/[project-name]
  - [ ] 1.3 Delete ts-refs folder
  - [ ] 1.4 Verify types accessible at new location

- [ ] 2. Archive Legacy Implementation
  - [ ] 2.1 Create legacy folder if needed
  - [ ] 2.2 Empty legacy folder if it exists
  - [ ] 2.3 Move all .js files to legacy (except package*.json)
  - [ ] 2.4 Move all .mjs files to legacy
  - [ ] 2.5 Move all .json files to legacy (except package*.json)
  - [ ] 2.6 Verify legacy folder contains complete implementation

- [ ] 3. Update package.json
  - [ ] 3.1 Update scripts section with build, serve, test, safari, update
  - [ ] 3.2 Update dependencies to be-hive, mount-observer, and roundabout-lib
  - [ ] 3.3 Update devDependencies to @playwright/test and spa-ssi
  - [ ] 3.4 Run npm run update
  - [ ] 3.5 Verify npm install succeeds

- [ ] 4. Configure Import Maps
  - [ ] 4.1 Create or replace imports.html
  - [ ] 4.2 Add assign-gingerly mapping
  - [ ] 4.3 Add project mapping to "/"
  - [ ] 4.4 Add be-hive mapping
  - [ ] 4.5 Add mount-observer mapping
  - [ ] 4.6 Add roundabout-lib mapping

- [ ] 5. Establish Coding Standards
  - [ ] 5.1 Create .kiro/steering directory
  - [ ] 5.2 Create coding-standards.md
  - [ ] 5.3 Document import map conventions
  - [ ] 5.4 Document file extension conventions
  - [ ] 5.5 Document TypeScript support conventions

- [ ] 6. Modernize Type Definitions
  - [ ] 6.1 Open types/[project-name]/types.d.ts
  - [ ] 6.2 Remove import statements
  - [ ] 6.3 Remove extends IEnhancement from EndUserProps
  - [ ] 6.4 Add enhancedElement: Element to AllProps
  - [ ] 6.5 Remove BAP type alias
  - [ ] 6.6 Replace BAP with AP in Actions interface
  - [ ] 6.7 Verify no TypeScript errors

- [ ] 7. Create Build Configuration
  - [ ] 7.1 Create emc.mjs file
  - [ ] 7.2 Add imports and type annotations
  - [ ] 7.3 Configure enhConfig with enhKey and spawn
  - [ ] 7.4 Configure withAttrs for attribute mapping
  - [ ] 7.5 Add weakRef configuration with enhancedElement
  - [ ] 7.6 Copy actions from legacy static config to customData
  - [ ] 7.7 Add 'enhancedElement' to ifAllOf for actions that reference it
  - [ ] 7.8 Copy handlers from legacy static config to customData
  - [ ] 7.9 Copy compacts from legacy static config to customData
  - [ ] 7.10 Add render function
  - [ ] 7.11 Add console.log(render())
  - [ ] 7.12 Test build: npm run build (should generate emc.json)

- [ ] 8. Configure VS Code
  - [ ] 8.1 Create .vscode folder if needed
  - [ ] 8.2 Create or open .vscode/settings.json
  - [ ] 8.3 Add file nesting patterns
  - [ ] 8.4 Enable file nesting
  - [ ] 8.5 Verify JSON files nest under .mjs files in explorer

- [ ] 8a. Configure Auto-Build Hook (Optional)
  - [ ] 8a.1 Create .kiro/hooks folder if needed
  - [ ] 8a.2 Create auto-build-config.kiro.hook
  - [ ] 8a.3 Configure fileEdited event for emc.mjs and emoji .mjs
  - [ ] 8a.4 Configure runCommand action with npm run build
  - [ ] 8a.5 Test by saving emc.mjs and verifying JSON regenerates

- [ ] 9. Create Modern Enhancement Class
  - [ ] 9.1 Create be-[project-name].js file
  - [ ] 9.2 Add imports (emc.json with type annotation, types)
  - [ ] 9.3 Add class declaration
  - [ ] 9.4 Add constructor with enhancedElement, ctx, initVals parameters
  - [ ] 9.5 Add init method with enhancedElement parameter
  - [ ] 9.6 Add roundabout integration in init
  - [ ] 9.7 Add enhancedElement to assignGingerly call
  - [ ] 9.8 Add default values to init via assignGingerly
  - [ ] 9.9 Copy action methods from legacy
  - [ ] 9.10 Replace BAP with AP in all methods
  - [ ] 9.11 Remove legacy imports
  - [ ] 9.12 Export class
  - [ ] 9.13 Verify no TypeScript errors

- [ ] 10. Create Emoji Shorthand (Optional)
  - [ ] 10.1 Check README for emoji in title
  - [ ] 10.2 Create [emoji].mjs file (if emoji exists)
  - [ ] 10.3 Import emc.json
  - [ ] 10.4 Configure enhConfig override
  - [ ] 10.5 Add render function
  - [ ] 10.6 Add console.log(render())
  - [ ] 10.7 Test build: npm run build (should generate [emoji].json)

- [ ] 11. Verification
  - [ ] 11.1 Run npm run build (should succeed)
  - [ ] 11.2 Verify emc.json generated
  - [ ] 11.3 Verify [emoji].json generated (if applicable)
  - [ ] 11.4 Run npm test (should pass)
  - [ ] 11.5 Check for TypeScript errors
  - [ ] 11.6 Verify legacy folder is complete
  - [ ] 11.7 Compare behavior with legacy implementation

## Task Dependencies

```
1 (Types) → 6 (Modernize Types)
2 (Archive) → 7 (Build Config), 9 (Enhancement Class)
3 (package.json) → 7 (Build Config)
4 (imports.html) → 9 (Enhancement Class)
5 (Standards) → 9 (Enhancement Class)
6 (Types) → 7 (Build Config), 9 (Enhancement Class)
7 (Build Config) → 9 (Enhancement Class), 10 (Emoji)
8 (VS Code) → (no dependencies, can be done anytime)
9 (Enhancement Class) → 11 (Verification)
10 (Emoji) → 11 (Verification)
```

## Execution Notes

### Step 1: Migrate Type Definitions
- Check for ts-refs folder first
- If not found, types may already be migrated
- Verify types are accessible after migration

### Step 2: Archive Legacy Implementation
- This is critical - don't skip
- Verify all files are moved before proceeding
- Keep package.json and package-lock.json in root

### Step 3: Update package.json
- Note the emoji in README title for build script
- If no emoji, omit the emoji build command
- npm run update will fetch latest versions

### Step 7: Create Build Configuration
- Reference legacy emc.js for base/branches/map
- Reference legacy be-*.js static config for actions/handlers/compacts
- Don't copy propDefaults or propInfo
- Test the build immediately after creating

### Step 9: Create Modern Enhancement Class
- Copy action methods carefully
- Replace all BAP with AP
- Keep method implementations the same
- Remove any be-enhanced specific code

### Step 10: Create Emoji Shorthand
- Only if emoji exists in README title
- Very simple - just overrides enhKey and base
- Test build to verify JSON generation

### Step 11: Verification
- This is the final validation
- All tests should pass
- Build should succeed
- No TypeScript errors

## Reference

For detailed instructions on each step, see: `#[[file:../../ConversionInstructions.md]]`
