import type { HandlerConfig, ItemscopeManager } from './types.js';

export type tagName = string;

/** An assignFrom pattern, applied to the created element with `from` set to the key's VM value */
export type Pattern = Record<string, any>;

export type RegisteredItemScopeManagerName = string;

//Phase TBD
export type itemScopeManagerName = `$:${RegisteredItemScopeManagerName}`;

// interface HElement {
//     tag: tagName;
//     //a standards for assign from
//     a: Pattern;
//     c: HElement[];
// }

export interface TBD{}

/**
 * Object header: a tag, plus (optionally) an itemscope manager attached to the element.
 * The manager is structure: it's attached once, and a different manager rebuilds the element.
 * The element's own pattern and its children's patterns resolve against the manager
 * instance (`el.ish`) rather than the raw value, so computed values are just getters.
 */
export interface ElementHeader {
    tag: tagName;
    /**
     * A registered manager name (JSON-friendly), or a class — auto-registered under
     * `Class.is ?? Class.itemscope ?? Class.name`. No `itemscope` attribute is set.
     */
    ish?: RegisteredItemScopeManagerName | ItemscopeManager;
}

export type ElementSpecificationHeader =
    | tagName
    | ElementHeader
    | itemScopeManagerName // Phase TBD
    | {new(el: Element, ctx: any): TBD} // Phase TBD

/**
 * One element: a header alone, or a tuple of header, pattern and (static) children.
 * Children resolve their patterns against the same VM value as their parent.
 */
export type ElementSpecification =
    | ElementSpecificationHeader
    | [ElementSpecificationHeader, Pattern]
    | [ElementSpecificationHeader, Pattern, ElementSpecification[]]
;

/**
 * Configuration for the builtIns.tree handler.
 */
export interface TreeConfig extends HandlerConfig {
    do: 'builtIns.tree';
    /**
     * Ordered VM key → element specification. Keys are processed in map order.
     * The `'*'` key is the default specification for VM keys the map doesn't name
     * (appended after the mapped keys, in VM key order). A `'*'` specification
     * without a pattern gets `{ textContent: '?.' }`.
     */
    map: Record<string, ElementSpecification>;
    /**
     * Name of the comment markers that delimit the tree's nodes inside the target
     * (default `'tree'`). Give each config its own name to run several trees in one target.
     */
    markerName?: string;
    /**
     * Create elements for keys whose value is null or undefined (default false:
     * such keys are skipped, and an existing element is removed).
     */
    keepNullish?: boolean;
}
