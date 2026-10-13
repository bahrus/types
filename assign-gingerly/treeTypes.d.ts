import type { HandlerConfig, ItemscopeManager } from './types.js';

export type tagName = string;

/** An assignFrom pattern, applied to the created element with `from` set to the key's VM value */
export type Pattern = Record<string, any>;

/**
 * The pattern slot: a pattern object, or a string as shorthand for `{ textContent: string }`
 * (a literal, or a `?.` path / reference that's resolved).
 */
export type PatternOrText = Pattern | string;

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
     * `Class.is ?? Class.name`. No `itemscope` attribute is set.
     */
    ish?: RegisteredItemScopeManagerName | ItemscopeManager;
}

export type ElementSpecificationHeader =
    | tagName
    | ElementHeader
    | itemScopeManagerName // Phase TBD
    | {new(el: Element, ctx: any): TBD} // Phase TBD

/**
 * A repeat, in place of static children: the element's content is `each`, stamped once
 * per item of the array at `of`. Inside `each`, `?.` is the item and `$parent` is the
 * object holding the array.
 */
export interface RepeatSpecification {
    /** The specification stamped once per item */
    each: ElementSpecification;
    /** Path to the array (any iterable), relative to the element's value. Default `'?.'`: the value itself */
    of?: string;
    /** Path into each item identifying it across calls (e.g. `'?.id'`, or `'?.'` for primitives). Default: the index */
    key?: string;
    /** Rendered instead of the items when the array is empty or missing */
    empty?: ElementSpecification;
}

/**
 * One element: a header alone, or a tuple of header, pattern, and either static
 * children or a repeat. Static children resolve their patterns against the same
 * value as their parent.
 */
export type ElementSpecification =
    | ElementSpecificationHeader
    | [ElementSpecificationHeader, PatternOrText]
    | [ElementSpecificationHeader, PatternOrText, ElementSpecification[] | RepeatSpecification]
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
    /**
     * Aliases for this tree's patterns, merged over `options.aka` (e.g. `{ _: 'textContent' }`).
     * Like `options.aka`, they apply to LHS keys and to RHS path segments.
     */
    aka?: Record<string, string>;
}
