import type { ElementSpecification } from 'assign-gingerly/types/treeTypes.js';
import type { PipeDescriptor, PipeEntries } from '../assign-gingerly/types.js';
import type { ModuleReference, NavigateApp } from '../navigate-gingerly/types.js';

/**
 * What o2h renders: a builtIns.tree config (the same JSON the client-side handler takes,
 * minus `do`). Only these keys matter to o2h; others (compile, …) are ignored.
 */
export interface O2HConfig {
    /** VM key → element specification, as for builtIns.tree */
    map: Record<string, ElementSpecification>;
    /** Render keys whose value is null / undefined (default false: they're skipped) */
    keepNullish?: boolean;
    /** Aliases for this tree's patterns (e.g. `{ _: 'textContent' }`), merged over options.aka */
    aka?: Record<string, string>;
    /** The tree's marker name (default `'tree'`), as for builtIns.tree */
    markerName?: string;
}

/** A manager class, as it can run on the server (constructed like an itemscope manager). */
export interface O2HManager {
    new (element: null, initVals: any, ctx: { rebind(): void }): any;
    onAssigned?(instance: any, value: any, ctx: any): any;
}

export interface O2HOptions {
    /** Named unary functions usable as path segments, or descriptors of them (as for assignFrom) */
    pipes?: PipeEntries;
    /** Aliases, under the config's own aka */
    aka?: Record<string, string>;
    /** Synchronous protocol handlers (`name://key` values) */
    protocols?: Record<string, (key: string) => any>;
    /**
     * Manager classes to run on the server, by registered name, so a `{ tag, ish: 'name' }`
     * element's subtree renders from the manager's getters. Without one, the subtree renders
     * from the raw value.
     */
    managers?: Record<string, O2HManager>;
    /**
     * Static HTML for `{ snippet: 'name' }` specifications, by name: written as is (trimmed).
     * The same option builtIns.tree takes, which also checks it on the client.
     */
    snippets?: Record<string, string>;
    /**
     * Prepend the default style, which hides the elements marked data-pending (until the client
     * restores them), but only when scripts run (so crawlers and no-JS readers see everything):
     * `<style>@media (scripting: enabled) { [data-pending] { visibility: hidden; } }</style>`
     */
    style?: boolean;
    /**
     * Append the data the HTML was rendered from (`from`), as JSON, right after the tree's end marker:
     * `<script type="application/json" data-tree="<markerName>">…</script>`, with `<` escaped (so the data
     * can't end the element). The client hydrates with it. By default, values JSON drops or changes (functions,
     * Dates, Maps, class instances, NaN …) are reported in `notSerializable`; `{ check: false }` skips that
     * (the check costs about 3× a plain JSON.stringify).
     */
    embed?: boolean | { check?: boolean };
}

/**
 * O2HOptions as JSON holds them (a navigate-gingerly app, before its module references are loaded):
 * pipes as data pipes or module references; managers and protocols as module references.
 */
export interface O2HAppOptions extends Omit<O2HOptions, 'pipes' | 'managers' | 'protocols'> {
    pipes?: Record<string, PipeDescriptor | ModuleReference>;
    managers?: Record<string, ModuleReference>;
    protocols?: Record<string, ModuleReference>;
}

/** A navigate-gingerly app that o2h renders: its configs are builtIns.tree configs, and its options JSON. */
export type O2HApp = NavigateApp<O2HConfig, O2HAppOptions>;

/** A value `embed` serialized differently from the original (or dropped), and where. */
export interface O2HNotSerializable {
    /** Its path in the data, as a `?.` path (`?.` for the data itself) */
    path: string;
    /** What it is, and what JSON makes of it */
    kind: string;
}

/** A key o2h couldn't render (reported, not guessed). */
export interface O2HUnrendered {
    /** The element's path (element-child indices from the tree's first element), to help find it */
    path: number[];
    key: string;
}

export interface O2HResult {
    /** Elements that lost something HTML can't carry (event bindings, properties without an attribute, managers) are marked data-pending */
    html: string;
    unrendered: O2HUnrendered[];
    /** With `embed` (and its check): the values JSON dropped or changed (empty when everything survived) */
    notSerializable?: O2HNotSerializable[];
}

/** Marks an element that lost something HTML can't carry (assign-gingerly's PENDING_ATTRIBUTE). */
export declare const PENDING_ATTRIBUTE: 'data-pending';

/** The opt-in default style (options.style): pending parts hidden, only when scripts run. */
export declare const PENDING_STYLE: string;

/** Render a builtIns.tree config against data, to HTML. */
export declare function o2h(config: O2HConfig, from: any, options?: O2HOptions): O2HResult;
