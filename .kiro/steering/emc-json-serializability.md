# EMC Configuration JSON Serializability

## Core Principle

**All content in `emc.mjs` files MUST be JSON-serializable without loss of information.**

The `render()` function at the bottom of every `emc.mjs` file exports the configuration as JSON via `JSON.stringify()`. This JSON is what gets loaded at runtime by enhancement classes and the be-hive system.

## Why This Matters

1. **Runtime Loading**: Enhancement classes import `emc.json` (not `emc.mjs`) using JSON import assertions
2. **Declarative Configuration**: The JSON file is the source of truth for how enhancements are configured
3. **Portability**: JSON files can be loaded by any JavaScript environment without executing code
4. **Security**: JSON is safer than executing arbitrary JavaScript
5. **Tooling**: JSON can be validated, transformed, and analyzed by standard tools

## What IS JSON-Serializable

✅ **Allowed in emc.mjs:**
- Strings: `"hello"`
- Numbers: `42`, `3.14`
- Booleans: `true`, `false`
- null: `null`
- Arrays: `[1, 2, 3]`
- Plain objects: `{ key: "value" }`
- Nested structures: `{ items: [{ id: 1 }, { id: 2 }] }`

## What is NOT JSON-Serializable

❌ **NOT allowed in emc.mjs:**
- **Functions**: `parser: (v) => v.split(',')` ❌
- **Class constructors**: `spawn: MyClass` ❌
- **Symbols**: `Symbol('key')` ❌
- **undefined**: `value: undefined` ❌ (becomes `null` or omitted)
- **Regular expressions**: `/pattern/` ❌ (becomes `{}`)
- **Dates**: `new Date()` ❌ (becomes string)
- **WeakMap/WeakSet**: Not serializable
- **Circular references**: Will throw error

## How to Handle Non-Serializable Values

### Functions (Parsers, Handlers)

**❌ WRONG:**
```javascript
// emc.mjs
function myParser(value) {
    return value.split(',');
}

export const emc = {
    enhConfig: {
        withAttrs: {
            _base: {
                parser: myParser  // ❌ Function reference - not JSON serializable
            }
        }
    }
};
```

**✅ CORRECT:**
```javascript
// emc.mjs
export const emc = {
    enhConfig: {
        withAttrs: {
            _base: {
                parser: 'myParser'  // ✅ String reference - JSON serializable
            }
        }
    }
};

// Separate parser file: parser.js
export default function myParser(value) {
    return value.split(',');
}

// HTML: Load parser separately
<script type="emc-parser" src="./parser.js" parser-name="myParser"></script>
```

### Class Constructors (spawn)

**❌ WRONG:**
```javascript
// emc.mjs
import { MyEnhancement } from './my-enhancement.js';

export const emc = {
    enhConfig: {
        spawn: MyEnhancement  // ❌ Class reference - not JSON serializable
    }
};
```

**✅ CORRECT:**
```javascript
// emc.mjs
export const emc = {
    enhConfig: {
        spawn: 'my-enhancement/my-enhancement.js'  // ✅ Module path string
    }
};
```

### Regular Expressions

**❌ WRONG:**
```javascript
export const emc = {
    enhConfig: {
        withAttrs: {
            pattern: /^test-/  // ❌ RegExp - becomes {}
        }
    }
};
```

**✅ CORRECT:**
```javascript
export const emc = {
    enhConfig: {
        withAttrs: {
            pattern: '^test-'  // ✅ String - can be converted to RegExp at runtime
        }
    }
};
```

## Validation

Every `emc.mjs` file should end with:

```javascript
export function render() {
    return JSON.stringify(emc, null, 4);
}

console.log(render());
```

**Test your configuration:**
```bash
node emc.mjs
```

If this command:
- ✅ Outputs valid JSON → Configuration is serializable
- ❌ Throws an error → You have non-serializable values
- ❌ Outputs `{}` or `null` for a property → You have a non-serializable value that was silently dropped

## Common Mistakes

### Mistake 1: Inline Parser Functions

```javascript
// ❌ WRONG
export const emc = {
    enhConfig: {
        withAttrs: {
            _base: {
                parser: (v) => v.split(',')  // Lost in JSON.stringify()
            }
        }
    }
};
```

**Result:** The `parser` property becomes `{}` in the JSON output.

### Mistake 2: Importing Classes

```javascript
// ❌ WRONG
import { MyClass } from './my-class.js';

export const emc = {
    customData: {
        helperClass: MyClass  // Lost in JSON.stringify()
    }
};
```

**Result:** The `helperClass` property becomes `{}` in the JSON output.

### Mistake 3: Using undefined

```javascript
// ❌ WRONG
export const emc = {
    customData: {
        optionalValue: undefined  // Omitted in JSON.stringify()
    }
};
```

**Result:** The `optionalValue` property is completely omitted from the JSON output.

## Best Practices

1. **Always test serialization**: Run `node emc.mjs` to verify output
2. **Use string references**: For parsers, use string names that resolve at runtime
3. **Use module paths**: For `spawn`, use string paths to modules
4. **Document external dependencies**: If your config references parsers by name, document which parser files are required
5. **Avoid undefined**: Use `null` instead if you need to represent "no value"
6. **Keep it simple**: The simpler your config, the easier it is to serialize

## Example: Complete Valid emc.mjs

```javascript
// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/my-enhancement/types' */
/** @import {RAConfig} from './types/roundabout/types' */

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'MyEnhancement',
        spawn: 'my-enhancement/my-enhancement.js',  // ✅ String path
        withAttrs: {
            base: 'my-enhancement',
            value: '${base}-value',
            _value: {
                parser: 'myParser'  // ✅ String reference
            }
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        actions: {
            hydrate: {
                ifAllOf: ['value', 'enhancedElement']
            }
        },
        defaultPropVals: {
            enabled: true,
            count: 0
        }
    }
};

export function render() {
    return JSON.stringify(emc, null, 4);
}

console.log(render());
```

## Enforcement

This principle should be enforced by:

1. **Code review**: Check that all `emc.mjs` files only contain JSON-serializable values
2. **Testing**: Run `node emc.mjs` as part of the build process
3. **Documentation**: Reference this principle in conversion guides
4. **Linting**: Consider adding a custom lint rule to detect non-serializable values

## Dependency Version Management

**Always use specific point versions** in `package.json`, not version ranges:

✅ **CORRECT:**
```json
{
  "dependencies": {
    "be-hive": "0.1.9",
    "mount-observer": "0.0.16",
    "roundabout-lib": "0.0.2"
  }
}
```

❌ **WRONG:**
```json
{
  "dependencies": {
    "be-hive": "^0.1.9",      // ❌ Caret allows minor/patch updates
    "mount-observer": "~0.0.16", // ❌ Tilde allows patch updates
    "roundabout-lib": "*"     // ❌ Wildcard allows any version
  }
}
```

**Why specific versions?**
- **Reproducible builds**: Same versions across all environments
- **No surprises**: Prevents automatic breaking changes
- **Explicit control**: You decide when to update
- **Easier debugging**: Know exactly which version caused an issue
- **Consistent testing**: CI/CD uses same versions as development

**When to update:**
Use `npm run update` (which runs `ncu -u && npm install`) to explicitly update all dependencies to their latest versions. Review the changes and test thoroughly before committing.

## Related Documentation

- [Scoped Parser Registry](https://github.com/bahrus/mount-observer#scoped-parser-registry-for-emc-scripts)
- [EMC Scripts](https://github.com/bahrus/mount-observer#element-mount-configuration-emc-scripts)
- [Conversion Instructions](../ConversionInstructions.md)
