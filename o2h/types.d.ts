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
    /** Element children the container has before the tree's output (they shift residue paths) */
    elementOffset?: number;
}

/**
 * What HTML can't carry, for the client to apply with one call:
 * `assignFrom(container, residue.pattern, { at: residue.at, from: host })`.
 */
export interface O2HResidue {
    /** `#[eN]` → the element's leftover pattern (properties, events, ish) */
    pattern: Record<string, Record<string, any>>;
    /** `eN` → the element's path: element-child indices from the container */
    at: Record<string, number[]>;
}

/** A key o2h could neither render nor hand over (reported, not guessed). */
export interface O2HUnrendered {
    /** The element's path (element-child indices from the container) */
    path: number[];
    key: string;
}

export interface O2HResult {
    html: string;
    /** null when there's nothing left to do on the client */
    residue: O2HResidue | null;
    unrendered: O2HUnrendered[];
}

/** Render a builtIns.tree config against data, to HTML (plus what HTML can't carry). */
export declare function o2h(config: O2HConfig, from: any, options?: O2HOptions): O2HResult;
