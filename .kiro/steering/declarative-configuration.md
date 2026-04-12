# Declarative Configuration Principle

## Overview

Move as much "code" out of JavaScript into JSON configuration as possible. JSON is faster to parse than JavaScript, and declarative configuration makes the code more maintainable and easier to understand.

## When to Apply

This principle applies when:
- Creating or configuring DOM elements with known properties
- Setting element attributes, classes, or other properties
- The logic is primarily about setting values rather than complex computation

## Pattern: Element Creation Settings

Instead of imperatively creating and configuring elements in JavaScript:

```javascript
// ❌ Imperative approach
async addDeleteBtn(self){
    // ... find or create trigger ...
    if(trigger === null){
        trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.classList.add('be-delible-trigger');
        trigger.ariaLabel = 'Delete this.';
        trigger.title = 'Delete this.';
        enhancedElement.insertAdjacentElement(triggerInsertPosition, trigger);
    }
    return { trigger: new WeakRef(trigger), byob };
}
```

Move the configuration to JSON in emc.mjs:

```javascript
// ✅ Declarative approach in emc.mjs
customData: {
    customData: {
        triggerSettings: {
            type: 'button',
            '?.classList?.add': 'be-delible-trigger',
            ariaLabel: 'Delete this.',
            title: 'Delete this.',
        },
        withMethods: ['add']
    }
}
```

Then use assignGingerly to apply the settings:

```javascript
// ✅ Simplified JavaScript
async addDeleteBtn(self) {
    // ... find or create trigger ...
    if (trigger === null) {
        trigger = document.createElement('button');
        const {triggerSettings, withMethods} = customData.customData;
        (await import('assign-gingerly/assignGingerly.js')).assignGingerly(trigger, triggerSettings, {withMethods});
        enhancedElement.insertAdjacentElement(triggerInsertPosition, trigger);
    }
    return { trigger, resolved: true, byob };
}
```

## Benefits

1. **Performance**: JSON parsing is faster than JavaScript execution
2. **Maintainability**: Configuration is centralized and easier to modify
3. **Clarity**: Declarative intent is clearer than imperative code
4. **Separation of concerns**: Configuration is separate from logic

## assignGingerly Special Syntax

The `assignGingerly` utility supports special property syntax:

- `'?.classList?.add'`: Safely calls `classList.add()` method
- `'?.classList?.remove'`: Safely calls `classList.remove()` method
- `'?.classList?.toggle'`: Safely calls `classList.toggle()` method
- Use `withMethods` option to specify which methods to enable (e.g., `{withMethods: ['add', 'remove']}`)

## WeakRef Handling

When using roundabout's `weakRef.properties` configuration:

- Properties listed in `weakRef.properties` are automatically wrapped in WeakRef by roundabout
- In your action methods, access these properties directly (roundabout unwraps them automatically)
- Return the raw element reference, not `new WeakRef(element)` - roundabout handles the wrapping

```javascript
// ✅ Correct - return raw element
return { trigger, resolved: true, byob };

// ❌ Wrong - don't manually wrap in WeakRef
return { trigger: new WeakRef(trigger), resolved: true, byob };
```

## When NOT to Apply

Don't force declarative configuration when:
- The logic involves complex conditionals or computations
- The configuration depends on runtime state that can't be known at build time
- The imperative code is actually clearer and simpler

## Reference Implementation

See [be-clonable](https://github.com/bahrus/be-clonable/blob/baseline/emc.mjs) for a complete example of this pattern in action.
