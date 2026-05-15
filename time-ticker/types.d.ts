import { SpawnContext } from "../assign-gingerly/types";

/**
 * Configuration/properties that the TimeTicker feature exposes
 */
export interface FeatureProps {
    /**
     * Duration in milliseconds between ticks
     */
    duration: number;

    /**
     * Whether the ticker is disabled (stops ticking when true)
     */
    disabled: boolean;
}

/**
 * Internal state (not exposed to consumers)
 */
export interface AllProps extends FeatureProps {
    host: WeakRef<Element>;
}

export type AP = AllProps;
export type PAP = Partial<AP>;

/**
 * Context passed to the feature constructor
 */
export interface FeatureSpawnContext extends SpawnContext {
    key: string;
    optIn: any;
    injection: any;
    featuresRegistry: any;
    shared?: any;
}
