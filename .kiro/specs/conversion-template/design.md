# Design: Convert [PROJECT_NAME] to Modern Architecture

## Architecture Overview

This conversion transforms a legacy be-enhanced project to the modern be-hive + roundabout architecture. The design follows a systematic 10-step process that preserves the original implementation while building the new architecture.

## System Context

```
┌─────────────────────────────────────────────────────────────┐
│                     Legacy Architecture                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   emc.js     │  │ be-*.js      │  │  ts-refs/    │     │
│  │ (runtime)    │  │ extends BE   │  │  (types)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                           │                                 │
│                    be-enhanced                              │
│                    trans-render                             │
└─────────────────────────────────────────────────────────────┘
                           │
                    [CONVERSION]
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Modern Architecture                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  emc.mjs     │  │ be-*.js      │  │   types/     │     │
│  │ (build)      │  │ standalone   │  │  (types)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         ▼                  │                  │             │
│    emc.json                └──────────────────┘             │
│         │                           │                       │
│         └───────────────────────────┘                       │
│                           │                                 │
│                      be-hive                                │
│                   roundabout-lib                            │
│                  assign-gingerly                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Type Definitions (types/[project-name]/types.d.ts)

**Purpose:** Standalone type definitions without external dependencies

**Structure:**
```typescript
// EndUserProps: Properties exposed to HTML attributes
export interface EndUserProps {
    // User-facing properties
}

// AllProps: Internal properties + EndUserProps
export interface AllProps extends EndUserProps {
    enhancedElement: Element;  // Required
    // Internal properties
}

// Type aliases for convenience
export type AP = AllProps;
export type PAP = Partial<AP>;
export type ProPAP = Promise<PAP>;

// Actions: Methods that implement behavior
export interface Actions {
    methodName(self: AP): ProPAP | void;
}
```

**Key Design Decisions:**
- No external imports (standalone)
- `enhancedElement` is explicit in AllProps
- BAP removed (was AP & BEAllProps)
- All action methods use AP instead of BAP

### 2. Build Configuration (emc.mjs)

**Purpose:** Generate static JSON configuration at build time

**Structure:**
```javascript
//@ts-check
import {emc} from './emc.mjs';

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/[project-name]/types' */
/** @import {RAConfig} from './types/roundabout/types' */

export const emc = {
    enhConfig: {
        enhKey: 'EnhancementKey',
        spawn: '[project-name]/[project-name].js',
        withAttrs: {
            base: '[project-name]',
            // Attribute mappings using ${base} template
        }
    },
    customData: {
        actions: { /* reactive action triggers */ },
        handlers: { /* event handlers */ },
        compacts: { /* compact syntax mappings */ }
    }
}

export function render(){
    return JSON.stringify(emc, null, 4);
}

console.log(render());
```

**Key Design Decisions:**
- withAttrs replaces base/branches/map (cleaner syntax)
- customData contains reactive configuration
- No propDefaults/propInfo (inferred by roundabout)
- Build-time only (not loaded in browser)

### 3. Enhancement Class (be-[project-name].js)

**Purpose:** Implement enhancement behavior using modern patterns

**Structure:**
```javascript
// @ts-check
import {emc} from './emc.mjs';

class Be[ClassName] {
    // Private field for element reference
    #enhancedElementRef;
    
    // Getter for enhanced element
    get enhancedElement() { /* ... */ }
    
    // Constructor: Initialize and setup
    constructor(enhancedElement, ctx, initVals) {
        // Store WeakRef
        // Call init
    }
    
    // Init: Setup roundabout and defaults
    async init(self, initVals) {
        // Configure roundabout
        // Set defaults via assignGingerly
    }
    
    // Action methods (copied from legacy)
    async actionMethod(self) { /* ... */ }
}

export { Be[ClassName] }
```

**Key Design Decisions:**
- No base class (standalone)
- WeakRef prevents memory leaks
- Constructor pattern (enhancedElement, ctx, initVals)
- Roundabout integration in init
- assignGingerly for property assignment
- No static config (moved to emc.mjs)

### 4. Emoji Shorthand ([emoji].mjs)

**Purpose:** Generate variant configuration for emoji syntax

**Structure:**
```javascript
import myJSON from './emc.json' with {type: 'json'};

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

**Key Design Decisions:**
- Extends base configuration
- Only overrides enhKey and base
- Minimal duplication

## Data Flow

### Build Time
```
emc.mjs ──[node]──> emc.json
   │
   └──> [emoji].mjs ──[node]──> [emoji].json
```

### Runtime
```
HTML Attribute
    │
    ▼
be-hive (mount observer)
    │
    ▼
emc.json (configuration)
    │
    ▼
Enhancement Class Constructor
    │
    ▼
init() method
    │
    ├──> roundabout (reactive properties)
    │
    └──> assignGingerly (property assignment)
         │
         ▼
    Action Methods
```

## Conversion Process Design

### Phase 1: Preparation (Steps 1-2)
- Migrate types to new submodule
- Archive legacy implementation
- **Rationale:** Preserve original, establish clean slate

### Phase 2: Configuration (Steps 3-5)
- Update package.json
- Configure imports.html
- Establish coding standards
- **Rationale:** Set up infrastructure before code changes

### Phase 3: Types (Step 6)
- Modernize type definitions
- **Rationale:** Types inform implementation

### Phase 4: Build System (Steps 7-8)
- Create emc.mjs
- Configure VS Code
- **Rationale:** Build system generates runtime config

### Phase 5: Implementation (Steps 9-10)
- Create modern enhancement class
- Create emoji shorthand (optional)
- **Rationale:** Implement using new architecture

## Error Handling

### Build Errors
- Validate JSON output from .mjs files
- Check for missing required fields
- Verify TypeScript types

### Runtime Errors
- WeakRef.deref() returns undefined → throw 404
- Missing properties → roundabout handles reactivity
- Action method errors → propagate naturally

## Testing Strategy

### Unit Tests
- Test action methods in isolation
- Verify property reactivity
- Check event handlers

### Integration Tests
- Test full enhancement lifecycle
- Verify attribute parsing
- Check emoji shorthand equivalence

### Build Tests
- Verify JSON generation
- Check TypeScript compilation
- Validate configuration structure

## Performance Considerations

### Build Time
- JSON generation is fast (< 1s per file)
- No complex transformations

### Runtime
- WeakRef allows garbage collection
- Roundabout provides efficient reactivity
- No unnecessary object creation

### Memory
- WeakRef prevents memory leaks
- No circular references
- Clean teardown

## Security Considerations

- No eval or dynamic code execution
- Trusted types support (TODO in some methods)
- Attribute values sanitized by browser

## Compatibility

### Browser Support
- Modern ES modules required
- Import maps required
- WeakRef required (modern browsers)

### Backward Compatibility
- HTML usage unchanged
- Same attribute names
- Same behavior

## Migration Path

### For Users
- No changes required to HTML
- Can use either full name or emoji
- Behavior identical to legacy

### For Developers
- Follow 10-step process
- Reference ConversionInstructions.md
- Use this spec for tracking

## Alternatives Considered

### Alternative 1: Keep be-enhanced
**Rejected:** Legacy architecture has limitations, not actively maintained

### Alternative 2: Complete Rewrite
**Rejected:** Too risky, loses proven behavior

### Alternative 3: Gradual Migration
**Rejected:** Creates hybrid state, more complex

### Selected: Systematic Conversion
**Rationale:** Preserves legacy, clear process, proven pattern

## Open Questions

- Should we automate any steps?
- Should we create a CLI tool for conversion?
- How do we handle edge cases in static config?

## References

- ConversionInstructions.md (detailed steps)
- be-a-beacon (reference implementation)
- be-committed (reference implementation)
- be-decked-with (reference implementation)
- assign-gingerly README (withAttrs documentation)
- roundabout-lib (reactive properties)
