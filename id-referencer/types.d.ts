import { FeatureSpawnContext } from "../assign-gingerly/types";

export { FeatureSpawnContext };

/**
 * Configuration for the `IdRefs` feature, supplied via the injection's
 * `customData`.
 *
 * Note: this local variant is handed its id list directly (via
 * `idRefs.searchFor = string[]`) rather than reading a host attribute, so there is
 */
export interface IdRefsCustomData {
    /**
     * Event dispatched on the host whenever a DOM-mutation-driven pass changes
     * the resolved element set. Defaults to `'id-referencer:resolved'`.
     */
    eventType?: string;
}

/**
 * `detail` payload of the event named by {@link IdRefsCustomData.eventType}.
 */
export interface IdRefsResolvedDetail {
    /** The ordered id list currently being resolved. */
    ids: string[];
    /** The resolved, still-connected elements, in id order. */
    elements: Element[];
}

export interface IIdRefs {

    searchFor: string[];

    readonly elements: Element[];
}
