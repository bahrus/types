import { FeatureSpawnContext } from "../assign-gingerly/types";

export { FeatureSpawnContext };

/**
 * Configuration for the `IdRefs` feature, supplied via the injection's
 * `customData`.
 */
export interface IdRefsCustomData {
    /**
     * Attribute names on the host to monitor and resolve as space-delimited id
     * references. Defaults to `['for']`.
     */
    searchFor?: string[];

    /**
     * Event dispatched on the host whenever the resolved set for any monitored
     * attribute changes. Defaults to `'id-referencer:resolved'`.
     */
    eventType?: string;
}

/**
 * `detail` payload of the event named by {@link IdRefsCustomData.eventType}.
 */
export interface IdRefsResolvedDetail {
    /** The monitored attribute whose resolved set changed. */
    attr: string;
    /** The ordered id list parsed from that attribute. */
    ids: string[];
    /** The resolved, still-connected elements, in id order. */
    elements: Element[];
}
