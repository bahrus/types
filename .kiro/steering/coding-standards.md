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

## Generated Files: Never Edit *.json Directly

### The Build Pipeline

Each project has `*.mjs` source files that generate corresponding `*.json` configuration files:
- `emc.mjs` → `emc.json` (canonical enhancement config)
- `[emoji].mjs` → `[emoji].json` (emoji shorthand config, imports emc.json)

### Rules

1. **NEVER edit `*.json` files directly** — they are generated artifacts
2. **Always edit the `*.mjs` source file** and then run `npm run build`
3. **The `*.mjs` files are the single source of truth** for enhancement configuration
4. **After any change to `*.mjs` files**, run `npm run build` to regenerate the JSON
5. **The emoji `.mjs` file imports `emc.json`**, so `emc.mjs` must be built first (the build script handles ordering)

### Workflow

```bash
# Edit the source
# (make changes to emc.mjs or [emoji].mjs)

# Rebuild generated files
npm run build

# Verify output
cat emc.json
```

### Why This Matters

- The `.mjs` files use `String.raw` template literals for regex patterns, making them readable and maintainable
- The `.json` files contain escaped regex strings that are error-prone to edit by hand
- The emoji `.mjs` file inherits from `emc.json`, so manual edits to JSON will be overwritten on next build
- Keeping a single source of truth prevents configuration drift between canonical and emoji variants
