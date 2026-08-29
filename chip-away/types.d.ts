import {IIdRefs} from '../id-referencer/types.d.ts';

/**
 * Public API properties for the chip-away custom element
 */
export interface EndUserProps {
    /**
     * Space-separated list of IDs for the select elements to mirror as chips
     */
    for: string;

    /**
     * When `true`, collapse each referenced `<select>` to a **single** chip
     * whose label is a comma-delimited list of the selected option texts,
     * instead of one chip per selected option. Its delete (✕) clears every
     * selected option for that `<select>`.
     *
     * The boolean `join` attribute seeds the initial value (server-rendered
     * config); after that, set the `join` property to change it at runtime — a
     * `when_join_changes_call_hydrate` compact re-renders. Not a `sourceOfTruth`
     * attribute, so the attribute is not kept in sync with the property.
     */
    join: boolean;

    /**
     * When `true`, render chips for display only — no per-option delete (✕), no
     * per-`<select>` "clear all", and no joined-chip delete. The referenced
     * `<select>` elements are not otherwise touched.
     *
     * Same wiring as {@link join}: boolean `readonly` attribute seeds the
     * initial value, the `readonly` property is authoritative afterward, and a
     * `when_readonly_changes_call_hydrate` compact re-renders.
     */
    readonly: boolean;
}

/**
 * Full property set including internal state managed by the custom element
 */
export interface AllProps extends EndUserProps {
    /** `for` split on whitespace into an id list. */
    splitFor: string[];
}

export type AP = AllProps;



/**
 * Runtime type for the custom element instance, including the lazily-spawned
 * `idRefs` feature.
 */
export interface RunTimeProps extends AllProps, HTMLElement {
    idRefs: IIdRefs
}

export interface Actions {
    hydrate(self: AP): void;
    temp(self: AP): void;
}
