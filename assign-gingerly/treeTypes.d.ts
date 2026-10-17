import type { GetValuesOptions, HandlerConfig, ItemscopeManager } from './types.js';

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

/** A manager reference from an object header: a registered name or a class. */
export type ManagerRef = RegisteredItemScopeManagerName | ItemscopeManager;

/** An element specification, normalized (see handlers/treeSpec.ts). */
export type NormalizedSpec = [
    header: string | ElementHeader,
    tag: string,
    ish: ManagerRef | undefined,
    pattern: Pattern | undefined,
    children: ElementSpecification[],
    repeat: RepeatSpecification | undefined,
];

// ── The tree`…` tagged template (see DX/tree.ts) ─────────────────────────────

/** Options for `each(of, options)` in a tree`…` template. */
export interface EachOptions {
    /** Path into each item identifying it across calls (a `?.` string or a paths() proxy) */
    key?: any;
    /** Rendered instead of the items when the array is empty or missing (e.g. another tree`…`) */
    empty?: ElementSpecification;
}

/**
 * Where a tree`…` error is, for editors and tools (TreeTemplateError carries it).
 * `part` / `offset` are exact: the index into the template's static strings (`strings[part]`,
 * the template literal's "quasis") and the offset within that string. The offset is in the
 * **raw** string (`strings.raw[part]`, escapes as written), so it maps straight to a source
 * position; without `raw`, it's in the cooked string. `line` / `column` are 1-based, in the
 * template as displayed with each `${…}` shown as `${…}` (as in the message).
 */
export interface TreeTemplateLocation {
    part: number;
    offset: number;
    line: number;
    column: number;
}

/** A template's static strings, as analyzeTree takes them: a TemplateStringsArray, or any string array (with `raw` for source offsets). */
export type TreeTemplateStrings = readonly string[] & { readonly raw?: readonly string[] };

/** What analyzeTree returns: the produced notation (unless there's an error), the elements, and any errors. */
export interface TreeAnalysis {
    /** The tree notation, with `TreeUnknown` stand-ins where values weren't known */
    spec?: ElementSpecification;
    /** The root element (empty if the template couldn't be parsed), for checks and completions */
    elements: TreeTemplateElement[];
    /** At most one, for now: tree`…` stops at its first error */
    errors: (Error & TreeTemplateLocation)[];
}

/** An element of an analyzed template, with locations. */
export interface TreeTemplateElement {
    tag: string;
    /** Where its `<tag` starts */
    location: TreeTemplateLocation;
    attributes: TreeTemplateAttribute[];
    /** `${…}` placed in attribute position (each(…), pattern objects) */
    directives: { hole: number; location: TreeTemplateLocation }[];
    /** Its child elements (text and `${…}` content are left out) */
    children: TreeTemplateElement[];
}

/** An attribute of an analyzed element: `name`, `.prop`, `@event` or `ish`, as written. */
export interface TreeTemplateAttribute {
    name: string;
    location: TreeTemplateLocation;
    /** The `${…}` index, when the value is a single `${…}` */
    hole?: number;
}

/** What `each()` returns: placed in an element's attribute position, it makes the element a repeat. */
export interface EachDirective {
    readonly kind: 'each';
    of: string;
    key?: string;
    empty?: ElementSpecification;
}

// ── compileTree (see handlers/compileTree.ts) ───────────────────────────────

/**
 * An element of a compiled template, as pure data: its tag, baked attributes, and baked
 * content (leading text, spec children, or microJoin text and element shells).
 */
export interface TemplateElement {
    tag: string;
    /** Baked attributes, in application order */
    attrs: [name: string, value: string][];
    content: (TemplateElement | string)[];
}

/** A repeat in a compiled template: its specification and the ids of its item templates. */
export interface CompiledRepeat {
    spec: RepeatSpecification;
    /** Template id for `each` */
    each: string;
    /** Template id for `empty`, if any */
    empty?: string;
}

/**
 * One spec node of a compiled template, nested like the spec. A clone's elements match
 * these nodes in order: a node's `children` are its element's element children (inside
 * `.content` for a `template`).
 */
export interface CompiledNode {
    /** The specification this node was compiled from */
    spec: ElementSpecification;
    tag: string;
    ish?: ManagerRef;
    /** The node's whole pattern, as normalized */
    pattern?: Pattern;
    /** The keys still to apply per instance (undefined when everything was baked) */
    dynamic?: Pattern;
    children: CompiledNode[];
    repeat?: CompiledRepeat;
}

/** One flat template: its element, the node tree to bind, and a structural signature. */
export interface CompiledTemplate {
    id: string;
    element: TemplateElement;
    node: CompiledNode;
    /** A hash of the template's markup and node shape, for validating cached or server-rendered copies */
    signature: string;
}

/** compileTree's output: one template per map key, plus one per repeat `each` / `empty`. */
export interface CompiledTree {
    /** Map keys in order (`'*'` included); each key's template id is the key itself */
    keys: string[];
    templates: Record<string, CompiledTemplate>;
}

export interface CompileTreeOptions {
    /**
     * A sample VM (what the tree's `from` will be), used to choose microJoin element shells.
     * Without one, microJoin content isn't baked.
     */
    sample?: any;
    /** Options for resolving sample values (pipes, withMethods, …), as at runtime */
    resolveOptions?: GetValuesOptions;
    /**
     * Whether a literal ` :=` attribute may be baked (e.g. per the active permission
     * profile). Refused attributes stay per-instance keys. Default: all but `on*`.
     */
    canBake?: (name: string, value: string) => boolean;
}

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
    /**
     * Experimental: create elements by cloning compiled templates, with static parts
     * (literal text and literal ` :=` attributes) baked in, instead of createElement plus
     * per-key assignment. A string works like `true` for now; it will name server-rendered
     * templates later. Treat the map's specifications as immutable (replace them to
     * change them). Rebinding is unchanged.
     */
    compile?: boolean | string;
}
