import type { ElementSpecification } from 'assign-gingerly/types/treeTypes.js';

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
    /** Named unary functions usable as path segments (as for assignFrom) */
    pipes?: Record<string, (value: any) => any>;
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
     * Prepend the default style, which hides the elements marked data-pending (until the client
     * restores them), but only when scripts run (so crawlers and no-JS readers see everything):
     * `<style>@media (scripting: enabled) { [data-pending] { visibility: hidden; } }</style>`
     */
    style?: boolean;
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
}

/** Marks an element that lost something HTML can't carry (assign-gingerly's PENDING_ATTRIBUTE). */
export declare const PENDING_ATTRIBUTE: 'data-pending';

/** The opt-in default style (options.style): pending parts hidden, only when scripts run. */
export declare const PENDING_STYLE: string;

/** Render a builtIns.tree config against data, to HTML. */
export declare function o2h(config: O2HConfig, from: any, options?: O2HOptions): O2HResult;
