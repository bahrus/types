# Clarify Programmatic Way to Add Enhancements

When we define an enhancement, it is easiest to demonstrate what it does and how it works by providing simple HTML examples with the attributes used to trigger the enhancement.

These examples are skewed towards an important use case -- progressive enhancement of server rendered content.

However, currently, only a small fraction of web development centers around that paradigm.  Rather, it tends to revolve around client-side rendering, using a framework.

In such a context, putting so much emphasis on the attribute way of hooking things up is problematic.  

1.  Such frameworks are clumsy when it comes to setting attributes.
2.  The amount of object stringifying and parsing is inefficient.

So we should make an effort to showcase how to integrate with these enhancements efficiently and ergonomically in such settings.  Basically programmatically without the use of attributes.

So for example, currently the README.md for be-persistent shows the example:

```html
<input be-persistent="of value@input via sessionStorage://{autoGenId}.">
```

We should also show how to do this programmatically, without any attribute at
all. This was worked through end-to-end against `be-persistent` -- see
[BetterProgrammaticIntegration.md](../Chats/BetterProgrammaticIntegration.md)
and [Part II](../Chats/BetterProgrammaticIntegrationPartII.md) for the full
discussion, including two bugs found and fixed in `roundabout-lib` and
`assign-gingerly` along the way. What follows is the settled checklist for
making *any* enhancement compatible with all three patterns; `be-persistent`
is the reference implementation, and `demo/Programmatic/` +
`tests/Programmatic*.spec.mjs` are the runnable/tested proof.

## Three Attachment Patterns

All three start by registering the enhancement's config once, via a small,
formulaic `def.js` file the enhancement ships (see
[Ship a `def.js`](#ship-a-defjs) below):

```JS
import { defBePersistent } from 'be-persistent/def.js';
const emc = await defBePersistent(document.body); // or a shadow root's host, for a scoped registry
```

### Declarative -- via `enh.set`

```JS
oInput.enh.set.bePersistent.nudge = true;
oInput.enh.bePersistent.store = 'sessionStorage://{autoGenId}';
```

Order-independent: properties can be set via `.set` *before* `defBePersistent`
has even registered the config. `enh.set`'s Proxy creates a plain placeholder
object and defers the real spawn (via `EnhancementRegistry.whenDefined`) until
the config shows up -- see `demo/Programmatic/devHashDeclarativeOutOfSequence.html`.

### Imperative -- via `enh.get()`

```JS
const persistenceEnhancement = oInput.enh.get(emc);
persistenceEnhancement.store = 'sessionStorage://{autoGenId}';
```

Use this when the caller wants a direct reference to the instance rather than
routing every property write through the `.set` proxy.

## Making an Enhancement Compatible

An enhancement converted per
[Enhancement Conversion Instructions](./EnhancementConversionInstructions.md)
or built fresh per
[New Enhancement Instructions](./NewEnhancementInstructions.md) needs these
additional steps to support all three patterns above:

### 1. `init()` must `await roundabout(...)`

```JS
async init(self, enhancedElement, ctx, initVals){
    const {customData} = /** @type {...} */ (ctx.emc || ctx.config);
    const raOptions = { ...customData, vm: self, initialPropVals: {enhancedElement, ...customData?.defaultPropVals, ...initVals} };
    await (await import('roundabout-lib/roundabout.js')).roundabout(raOptions); // <-- await this
    self.initialized = true;
}
```

Without the `await`, `self.initialized = true` runs *before* `roundabout` has
finished converting properties to reactive accessors. It still "works" for
the declarative (attribute) path, because nothing else races it there — but
for imperative attachment, where a caller may set properties on the instance
the moment it's constructed (synchronously, before `roundabout`'s internal
`await`s resolve), `initialized` needs to be the class's own reliable signal
that setup has actually completed, since it's what every action gates on.

### 2. Read `ctx.emc`, but fall back to `ctx.config`

```JS
const {customData} = /** @type {...} */ (ctx.emc || ctx.config);
```

The declarative (mount-observer/`EMCScript`) spawn path populates `ctx.emc`
with the full parsed `emc.json`. The imperative paths (`enh.get()`/`enh.set`)
don't -- they only ever pass `ctx.config`, i.e. the bare registry item. Your
`def.js` (below) has to copy `customData` onto that registry item for
`ctx.config.customData` to exist at all; without `ctx.emc || ctx.config`, the
class would find no `customData` whatsoever when spawned imperatively, and
`roundabout` would run with no `actions`/`compacts`/`weakRef` configured.

### 3. Ship a `def.js`

```JS
// def.js
import 'assign-gingerly/object-extension.js';

export async function defBePersistent(ref){
    const {default: emc} = await import('./emc.json', {with: {type: 'json'}});
    return await push(ref, emc);
}

async function push(ref, emc){
    const {BePersistent} = await import('./be-persistent.js');
    const {enhConfig} = emc;
    enhConfig.spawn = BePersistent;
    enhConfig.customData = emc.customData; // see step 2 -- registry only stores enhConfig, not the full emc
    const registry = (ref?.customElementRegistry ?? customElements).enhancementRegistry;
    registry.push(enhConfig);
    return enhConfig;
}
```

`enh.get()`/`enh.set` can only spawn an enhancement whose config is already in
the registry -- something has to call `registry.push(...)` once, and that's
all this file does. Name the export `def<ClassName>` and keep it this
formulaic across enhancements; consumers shouldn't need to know the shape of
`emc.json` to use your enhancement programmatically.

**Don't forget `package.json`'s `exports` map** -- add `"./def.js": "./def.js"`
alongside the existing entries. It's a plain file, easy to leave out, and if
you do, `import '<pkg>/def.js'` fails to resolve for any real (non-dev-server)
consumer even though it works fine here, since this repo's dev server maps
`be-persistent/` straight to `/` and never consults `package.json` at all.

### 4. Watch for reserved property-name collisions

`roundabout-lib`'s `RoundaboutReady` interface reserves `nudge`, `rock`,
`awake`, and `covertAssignment` as its own (currently unimplemented)
convenience method names. If your enhancement's own domain model wants one of
those exact names -- `be-persistent`'s boolean `nudge` flag collided with
this -- two things are required for a value set on it *before* the enhancement
finishes spawning to survive:

- A `roundabout-lib` fix (already published, 0.0.38+) that skips defaulting
  those names when the enhancement's own `initialPropVals`/`defaultPropVals`
  already claims them.
- The property must be *monitored* by `roundabout` -- referenced by some
  action/compact condition, or, if nothing naturally references it (as with
  `nudge`), added explicitly via `customData.propagate: ['nudge']` in
  `emc.mjs`. An unmonitored property is never converted to a reactive
  accessor, so it's never protected from being overwritten by
  `initialPropVals` at the end of `roundabout()`, regardless of the above fix.

Simplest fix if you have a free choice of name: don't use `nudge`, `rock`,
`awake`, or `covertAssignment` for a domain property at all.

### 5. Test all three patterns

`tests/ProgrammaticDeclarativeInSequence.spec.mjs`,
`tests/ProgrammaticDeclarativeOutOfSequence.spec.mjs`, and
`tests/ProgrammaticImperative.spec.mjs` (plus their matching `.html` fixtures
and the `demo/Programmatic/` pages they're based on) are the reference
coverage -- clone the shape of these three for a new enhancement rather than
just the attribute-based tests.