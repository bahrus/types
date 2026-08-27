import { SpawnContext } from "../assign-gingerly/types";

/**
 * Public API properties for the chip-away custom element
 */
export interface EndUserProps {
    /**
     * Space-separated list of IDs for the select elements to mirror as chips
     */
    for: string;
}

/**
 * Full property set including internal state managed by the chip-away feature
 */
export interface AllProps extends EndUserProps {
}

export type AP = AllProps;

/**
 * Runtime type for the custom element instance
 */
export interface RunTimeProps extends AllProps, HTMLElement {}

/**
 * Internal properties managed by the ChipAway feature
 */
export interface FeatureProps {
    /**
     * Space-separated list of IDs for the select elements to mirror as chips
     */
    for: string;
}

/**
 * Full feature property set including internal state
 */
export interface FeatureAllProps extends FeatureProps {
    /**
     * Weak reference to the host chip-away element
     */
    host: WeakRef<HTMLElement>;
}

export type FeatureAP = FeatureAllProps;

/**
 * Context passed to the ChipAway feature constructor
 */
export interface FeatureSpawnContext extends SpawnContext {
    key: string;
    optIn: any;
    injection: any;
    featuresRegistry: any;
    shared?: any;
}
