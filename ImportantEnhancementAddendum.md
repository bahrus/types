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

### 6. Document it in the README

Programmatic support that isn't documented won't get used. Add a section to
the enhancement's README.md, placed *after* the attribute-based examples. The
attribute examples are still the quickest way to show what the enhancement
does, so they come first. `be-bound` ("Programmatic attachment (no
attribute)") and `be-calculating` ("Part V Programmatic attachment (no
attribute)") are the reference wording.

The section should contain the following, in this order.

#### a. An editorial intro: when, and why, to use this

Start by positioning the two approaches rather than jumping into code:

- The attribute syntax shines for server-rendered HTML and progressive
  enhancement, where the markup alone says what the enhancement does.
- Most web development today renders on the client, with a framework (Lit,
  React, Vue, Svelte, etc.) that already has a JavaScript reference to each
  element it creates. There, programmatic attachment is the better fit.

Then give the three advantages as a numbered list with bold lead-ins. Make
each one **concrete to this enhancement**; don't just restate the generic
claim:

1. **A less clunky API.** Frameworks are awkward about setting arbitrary (let
   alone emoji) attributes. Quote a real, hairy attribute value from earlier
   in the README (be-bound uses
   `"between ?.rating?.value@change and #alternativeRating"`) and contrast it
   with the plain object/array equivalent. If a property can take something an
   attribute can't hold, such as a function or an array, say so here. That is
   often the strongest argument (be-calculating: "the calculation itself as a
   function -- no global registry, no event listener, no CSP-constrained
   inline JS").
2. **Less stringifying and parsing.** The framework serializes values to a
   string, and the enhancement parses them back apart. Name the parsing
   involved if it's notable (e.g. "parses that string back apart with regular
   expressions").
3. **Less overhead monitoring attributes.** The attribute approach relies on
   be-hive / mount-observer watching the DOM for elements that carry (or gain)
   the attribute, and for changes to its value. `def.js` just registers the
   config, and the enhancement is attached exactly when, and to exactly the
   elements, your code says. (Only claim this if it's true: confirm that
   `def.js` and what it imports don't pull in mount-observer.)

Close the intro by reassuring the reader that the two approaches produce the
**same enhancement**, with the same inference/defaulting rules, and can be
mixed in one app: attributes for server-rendered islands, programmatic
attachment inside client-rendered components.

Keep the tone matter-of-fact. The point is to help a framework user decide,
not to disparage the attribute approach.

#### b. Registration

The `def<ClassName>` snippet, with the scoped-registry comment:

```JS
import { defBeCalculating } from 'be-calculating/def.js';
const emc = await defBeCalculating(document.body); // or a shadow root's host, for a scoped registry
```

#### c. Attribute → property mapping

Tell readers which property corresponds to each attribute (or attribute
statement), so they can translate the README's earlier examples themselves.
A table works well:

- For enhancements with several attributes (be-calculating): one row per
  attribute, with the property name and any notes on accepted types.
- For enhancements with one statement-style attribute (be-bound): one row per
  statement form, with the equivalent object.

Call out anything the property accepts beyond what the attribute can express
(functions, arrays, `true`/`false`).

#### d. The two patterns, each with a short example

- `### Declarative -- via enh.set`. Include an "equivalent to `<...>`" comment
  pointing back at an attribute example. Mention that only the first property
  needs `.set`, and that this works before or after `def...` is called.
- `### Imperative -- via enh.get()`. Use `Object.assign(el.enh.get(emc), {...})`
  when setting several properties.

#### e. Gotchas that differ from the attribute path

For example, the enhancement key differs when attached programmatically.
be-calculating dispatches its event as `beCalculating`, not `🧮`, so it
recommends passing `handler` as a function instead of adding a listener. If
there are no differences, omit this.

#### f. A link to `demo/Programmatic/`

"See [demo/Programmatic](demo/Programmatic/) for runnable examples."


### 7. Accept elements (and WeakRefs) wherever an id is accepted -- and hold them weakly

Attribute syntax can only refer to other elements by id (`#search`,
`🔁-src=rankings`, ...).  A client-side framework usually already holds a
reference to the element, and the element may not have an id at all.  So
wherever the programmatic API accepts an id, also accept **the element itself,
or a `WeakRef` to it**:

```JS
button.enh.get(emc).toggles = [
    {prop: 'isOn', targetElementId: 'myLight'},             // by id, as before
    {prop: 'isOn', targetElement: kitchenLight},             // an element...
    {prop: 'isOn', targetElement: new WeakRef(porchLight)},  // ...or a WeakRef to one
];
```

Accept both forms:  requiring callers to wrap every reference in a `WeakRef`
is ceremony, while callers who already hold one shouldn't have to `deref()`
it only for the enhancement to wrap it again.  Name the property after the id
property it parallels (`targetElementId` → `targetElement`, `remoteId` →
`remoteElement`, a remote specifier's `id` → `element`), or, where the id
property's name doesn't say "id" (`src`, `target`, `forAttr`), widen that
property's type to `string | Element | WeakRef<Element>`.  Where an element
has no id to name its value by (be-calculating, be-observing), fall back to
its position.

**The enhancement must never hold such an element strongly.**  This is the
part that takes care -- and each point below was a real leak found while
rolling this out:

1.  **The stored property value counts.**  Wrapping the element only in the
    enhancement's private copy isn't enough:  roundabout stores the property
    value (the caller's array or object) on the enhancement instance.  So the
    action that reads it must write back a **copy** with each element
    replaced by a `WeakRef` (never mutating the caller's object).  Return the
    weakened copy *and* keep using it in the same pass -- don't rely on the
    returned value re-triggering the action:  roundabout doesn't necessarily
    re-run an action because of a value that same action returned (it
    didn't for be-calculating's `parseForAttr`).

2.  **A `WeakRef` stored directly in a top-level property reads back as the
    element.**  roundabout's getter `deref()`s any stored `WeakRef` (a
    side effect of its own `weakRef` config feature).  The storage *is*
    weak, but the action can't tell from reading the property that it
    already weakened it -- and naively re-weakening every pass loops forever
    (three-peat's `src` / `target`).  Remember, via a `WeakRef` of your own,
    which element you already weakened, and skip it next time.  (roundabout's
    own `weakRef.properties` can't be used for a property that may also hold
    an id:  it calls `new WeakRef('some-id')`, which throws.)  `WeakRef`s
    nested inside an array or object are *not* dereferenced by the getter.

3.  **Closures registered on another long-lived object count.**  If a
    listener registered on the list host / a propagator / a peer closes over
    the target element, that object keeps the target alive.  Have such
    closures reach elements through a `WeakRef` (three-peat's `render`).

4.  **`Infer` caches its propagator, and the propagator holds its element
    strongly.**  An `Infer` holds its own element via a `WeakRef`, but once
    `getPropagator()` has been called on it, it caches the propagator, whose
    cleanup closures capture the element.  So never keep (or make reachable
    from a long-lived handler) an `Infer` you called `getPropagator()` on.
    Get the propagator from a **throwaway** `Infer` instead
    (`await new Infer(el, prop).getPropagator()`).  The element itself keeps
    its propagator alive, via the listeners / setter hooks / observers the
    propagator installs on it.  (be-calculating and be-observing both
    retained removed remotes this way -- including remotes found *by id*.)

5.  **A collected element is a no-op, never an error.**  Everywhere a
    `WeakRef` is dereferenced (at event time, in `Infer.enhancedElement`),
    handle `undefined`:  skip the action, or contribute `undefined` as that
    element's value.

6.  **Test it with a real garbage collection.**  Only an actual collection
    proves nothing retains the element.  Each enhancement has a
    `tests/Programmatic/TargetElementGC.spec.mjs` to clone:  it launches
    Chromium with `--js-flags=--expose-gc` (which forces its own worker, so
    it's a separate spec file), uses a fixture that sets everything up inside
    a function scope (so the page itself holds no reference), takes the
    test's *own* `WeakRef` to a target, removes the target from the DOM,
    calls `gc()` across a few turns, and asserts the element was collected --
    then checks that the enhancement still works for the other targets,
    without errors.  Run it once against a deliberately broken version (skip
    the weakening) to see it fail.

**When the enhancement can't hold the target weakly, don't offer it.**
do-assign hands its host to assign-gingerly's `attachEventListener`, whose
listener closure captures the host strongly -- so do-assign doesn't accept an
element `host` until `attachEventListener` can take a `WeakRef` (or a getter)
for its target / host.
