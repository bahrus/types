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
     * A registered manager name (JSON-friendly; looked up in the `registry` option's
     * itemscopeRegistry first), or a class, attached directly and registered nowhere.
     * No `itemscope` attribute is set.
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
 * A nested tree, in place of static children: shorthand for a builtIns.tree config (minus
 * `do`) applied to the element, with the element's value as the nested tree's VM. Told
 * apart from a repeat by having `map` and no `each`. Equivalent to the pattern
 * `{ '?. =>': { do: 'builtIns.tree', ...nested } }`, minus the handler dispatch: always
 * synchronous. The nested tree's own `compile` only applies once the compiler is loaded
 * (e.g. by an enclosing `compile` tree).
 */
export type NestedTreeSpecification = Omit<TreeConfig, 'do' | 'resolve'>;

/**
 * A switch: one of several specifications, chosen from the data on every render. Goes
 * anywhere an element specification goes (a map value, a static child, a repeat's `each`
 * or `empty`, another switch's case). Told apart from a header by its `switch` key.
 *
 * The discriminant (`switch`) resolves against the switch position's value, and is
 * matched with `String(value)` against the `cases` keys; nullish or unmatched → `default`.
 * The chosen case renders against that same value. No case and no `default` (or a `null`
 * case) renders nothing, while keeping the switch's slot. The same case as last time is
 * rebound in place; a different case is rebuilt (the previous one is discarded).
 */
export interface SwitchSpecification {
    /** The discriminant: a path (`'?.phase'`, `'$parent?.mode'`, pipes too) */
    switch: string;
    cases: Record<string, ElementSpecification | null>;
    /** Rendered when the discriminant is nullish or matches no case */
    default?: ElementSpecification | null;
}

/**
 * A snippet: static HTML, named here and supplied by the `snippets` option (so markup comes from
 * code, never from a config or the data). Goes anywhere an element specification goes, and may
 * have several root elements. Parsed once into a template (and checked: no `<script>`, `on*`
 * attributes or `javascript:` URLs, plus the permission processor), cloned per instance, and
 * never visited again on later runs, except for its holes. Told apart from a header by its `snippet` key.
 */
export interface SnippetSpecification {
    /** The snippet's name in the `snippets` option */
    snippet: string;
    /**
     * What fills the snippet's holes (its `data-hole="name"` elements), by hole name. A hole the
     * spec doesn't name is left as written, fallback content included; a name the snippet doesn't
     * have is ignored. Holes resolve against the same value as the snippet's position.
     */
    holes?: Record<string, HoleSpecification>;
}

/**
 * What fills a hole: an element tuple without its header (the snippet supplies the element).
 * Text (a string, as in tuples), a pattern for the hole element, or a pattern and then children
 * (static children, a repeat or a nested tree). Content (text or children) replaces the hole's
 * fallback content; a pattern alone keeps it.
 */
export type HoleSpecification =
    | PatternOrText
    | [PatternOrText]
    | [PatternOrText, ElementSpecification[] | RepeatSpecification | NestedTreeSpecification];

/**
 * One element: a header alone, or a tuple of header, pattern, and either static
 * children, a repeat or a nested tree. Static children resolve their patterns against
 * the same value as their parent. Or a switch between specifications, or a snippet.
 */
export type ElementSpecification =
    | ElementSpecificationHeader
    | [ElementSpecificationHeader, PatternOrText]
    | [ElementSpecificationHeader, PatternOrText, ElementSpecification[] | RepeatSpecification | NestedTreeSpecification]
    | SwitchSpecification
    | SnippetSpecification
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
    nested: NestedTreeSpecification | undefined,
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

/** `choose(on, cases, fallback?)`'s cases: case key → what to render (`null`: nothing). */
export type ChooseCases = Record<string, ElementSpecification | null>;

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
    /** A nested tree in the children slot (rendered at bind time, not compiled into this template) */
    nested?: NestedTreeSpecification;
    /**
     * A switch among the static children: it has no element in the template (its case is
     * cloned from its own template and placed at bind time), so `tag` is `''`.
     */
    switch?: CompiledSwitch;
    /**
     * A snippet among the static children: it has no element in the template (its own
     * template is cloned in when the template is), so `tag` is `''`. The snippet's name.
     */
    snippet?: string;
}

/** A switch's cases, compiled: each case is its own template (or, for a nested switch, its own CompiledSwitch). */
export interface CompiledSwitch {
    spec: SwitchSpecification;
    /** Case key → template (or switch) id */
    cases: Record<string, string>;
    /** Id for `default`, if any */
    default?: string;
}

/** One flat template: its element, the node tree to bind, and a structural signature. */
export interface CompiledTemplate {
    id: string;
    element: TemplateElement;
    node: CompiledNode;
    /** A hash of the template's markup and node shape, for validating cached or server-rendered copies */
    signature: string;
}

/** compileTree's output: one template per map key, plus one per repeat `each` / `empty` and per switch case. */
export interface CompiledTree {
    /** Map keys in order (`'*'` included); each key's template id is the key itself */
    keys: string[];
    templates: Record<string, CompiledTemplate>;
    /** Switches where a template would otherwise be (a map value, a repeat's `each` / `empty`, a case), by the same ids */
    switches: Record<string, CompiledSwitch>;
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
    /**
     * Adopt existing markup (e.g. server-rendered by o2h) found between the tree's markers on
     * the first run, instead of clearing and rebuilding it: Tree pairs the spec with the existing
     * elements, attaches managers, then binds as usual (events, properties; unchanged text isn't
     * rewritten), so later runs and managers' ctx.rebind() update it in place. Any structural
     * mismatch falls back to the rebuild. Carried down to nested trees. Also removes the
     * `data-pending` marks of what it adopted.
     *
     * Experimental: `'pending'` adopts the same way, but the first run binds only the elements
     * holding a `data-pending` mark (with their contents and ancestors). The rest is trusted as
     * the server rendered it, so client data or formatting that differs from the server's shows
     * only once a later run (or a manager's ctx.rebind()) reaches it.
     */
    adopt?: boolean | 'pending';
}
