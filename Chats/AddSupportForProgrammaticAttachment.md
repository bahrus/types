# Add Support For Programmatic Attachment

## Bruce's Ask

In the do-toggle project, I [added this request](../../Chats/AddSupportForProgrammaticAttachment.md#implementation-notes), and the implementation notes suggested follow-thoughts, which makes sense to me.

Please proceed with apply similar changes to the other subfolders of the root folder identified, as well as the addendum.  Please add your implementation notes below. 
## Implementation Notes

Done for six enhancements, plus a new step 7 in the addendum. do-assign is
deliberately **not** done; see below. do-toggle already had this from the
previous round.

### What each enhancement now accepts

| Enhancement    | Id-based (unchanged)                  | New: element or `WeakRef`                     |
|----------------|---------------------------------------|-----------------------------------------------|
| do-toggle      | `targetElementId`                     | `targetElement` (previous round)              |
| do-inc         | `targetElementId`                     | `targetElement`                               |
| do-invoke      | `targetElementId`                     | `targetElement`                               |
| be-calculating | `forAttr: 'a b'` / `['a', 'b']`       | `forAttr` array entries may be elements / `WeakRef`s, mixed with ids |
| be-observing   | remote specifier `{id}`               | remote specifier `{element}`                  |
| be-bound       | `remoteId`                            | `remoteElement`                               |
| three-peat     | `src` / `target` ids                  | `src` / `target` may be an element / `WeakRef` |

In every case the element is only ever held **weakly**. A collected element
is a no-op, or contributes `undefined` to the calculation or observation. It
never throws. Each package's types and README ("Targeting an element
directly" / "Passing elements directly") document this.

### Leaks found along the way

The do-toggle pattern (weaken a copy of the stored value, deref at event
time) carried over directly to do-inc and do-invoke. The enhancements that
attach listeners *to* the remote element turned up four more ways to retain
it. All are written up in the addendum's step 7.

1. **roundabout doesn't necessarily re-run an action for a value that
   action returned.** be-calculating's `parseForAttr` returned the weakened
   `forAttr` expecting to be re-triggered, and never was, so `forArgs` was
   never produced. Fix: return the weakened value *and* keep using it in the
   same pass. be-observing, be-bound and three-peat do it this way too.

2. **roundabout's getter `deref()`s a `WeakRef` stored directly in a
   property.** This comes from its own `weakRef` config feature, in
   `makeRoundaboutReady.js` `derefStoredValue`, which runs regardless of
   mode. So three-peat's weakened `src` read back as the element, got
   re-weakened, and `hydrate` looped about 22,000 times in 2 seconds. Fix:
   three-peat remembers, via its own `WeakRef`, which element it already
   weakened. roundabout's `weakRef.properties` couldn't be used directly,
   because `src` / `target` may also be id strings, and it would call
   `new WeakRef('rankings')`, which throws.
   **Possible roundabout improvement:** only wrap object values
   (`typeof newValue === 'object'`). Then an enhancement could just list
   `src` / `target` in `weakRef.properties`.

3. **Closures registered on another object.** three-peat's `render` is
   registered on the list host (or its propagator) and closed over both the
   host and the target. So the host kept a removed target alive. It now
   reaches both through `WeakRef`s.

4. **`Infer` caches its propagator, and the propagator holds the element
   strongly.** `Infer` holds its element via a `WeakRef`, but after
   `getPropagator()` it caches an `InferencedPropagator`, whose cleanup
   closures capture the element. be-calculating stores its `Infer`s in
   `propToInfer`, and be-observing's `ObservationHandler`, which is kept
   alive by the *other* remotes' propagators, holds them too. So both
   retained removed remotes, **including remotes found by id**. This was a
   pre-existing leak, not just an element-ref one. Fix: get the propagator
   from a throwaway `Infer`. The element keeps its own propagator alive
   through the listeners and setter hooks the propagator installs on it.
   **Possible assign-gingerly improvement:** have `InferencedPropagator`
   capture the element through the `Infer`'s `WeakRef`, not directly.
   `#observePolling`'s `requestAnimationFrame` loop would also keep an
   element alive forever.

Smaller fixes made along the way:

- be-bound's propagator listeners were added without the `AbortController`
  signal, so a re-hydrate stacked them. They now get the signal.
- be-calculating and be-observing name a value by the element's
  `data-id` / `id`. An element passed by reference may have neither, so it
  falls back to its position.

### do-assign: not done, on purpose

do-assign passes its host to assign-gingerly's `attachEventListener`, whose
listener closure captures `target` and `host` strongly. However do-assign
stored the host, the listener on the adorned element would keep it alive.
The only workarounds I found would break things:

- re-dispatching private events breaks `fromEvent` / `fromLHS`;
- a Proxy around a DOM element breaks native method calls.

So per your "definitely should not store the target with anything other
than a weak reference", I didn't offer an element `host` there. Step 7 says
so. The unblocking change would be in assign-gingerly: let
`attachEventListener` accept a `WeakRef` (or a getter) for its target / host
and `deref()` it per event.

### Tests

Each of the six enhancements has, generated from one shared template:

- `demo/Programmatic/TargetElement.html`;
- `tests/Programmatic/TargetElement.*`, which checks:
  - both forms work;
  - where observable, the stored value holds a `WeakRef`;
  - the caller's object is untouched;
- `tests/Programmatic/TargetElementGC.*`, a real garbage-collection test.
  Chromium runs with `--js-flags=--expose-gc`. The fixture sets up in a
  function scope so the page holds no reference. The test then:
  - takes its own `WeakRef` to one target and removes it from the DOM;
  - calls `gc()` across a few turns and asserts the element was collected;
  - checks that the enhancement still works for the other target, with no
    errors.

three-peat has a second GC test, `TargetElementGCDestination`, that removes
the *target* rather than the source.

For every GC test, I ran a **negative control**: the same test against a
temporarily broken version that skips the weakening (and, where relevant,
keeps the strong closure or the cached propagator). Each one failed with
"...was garbage collected, so the enhancement held no strong reference to
it". Both of be-observing's fixes (weakening, throwaway `Infer`) have their
own control.

Final runs:

| Package        | Result |
|----------------|--------|
| do-inc         | 13 passed |
| do-invoke      | 10 passed (1 pre-existing skip) |
| be-calculating | 7 passed |
| be-observing   | 11 passed |
| be-bound       | 10 passed |
| do-toggle      | 13 passed |
| three-peat     | 3 new targetElement tests pass. Its other tests still fail on the upstream assign-gingerly inferencer bug, and pass with it patched. |

The throwaway-`Infer` change touches the attribute path of be-calculating
and be-observing. So I re-ran their attribute demos:

- be-calculating's ten demos compute the same values as before, and
  recalculate correctly after an input.
- be-observing's 26 demos snapshot identically before and after (changes
  stashed), including after an input change.

### Addendum

Step 7, "Accept elements (and WeakRefs) wherever an id is accepted -- and
hold them weakly", is appended to `ImportantEnhancementAddendum.md`. It covers:

- the API shape and naming;
- the six pitfalls above, as a checklist;
- the GC test to clone;
- the rule: don't offer the feature where it can't be held weakly
  (do-assign).

I copied it into every clone whose addendum matched this one: be-bound,
be-calculating, be-dispatching, be-observing, be-switched, do-assign,
do-inc, do-invoke and do-toggle. **be-render-neutral, do-merge, per-each and
three-peat have an older addendum (no step 6) and need a pull before step 7
will appear there.**

As before, the `types.d.ts` edits (do-inc, do-invoke, be-calculating,
be-observing, be-bound, three-peat) and the addendum are in each package's
own clone of the `types` repo, and need committing / pushing from one clone
and pulling into the others.
