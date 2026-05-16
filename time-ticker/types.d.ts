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
export interface AllFeatureProps extends FeatureProps {
    host: WeakRef<Element>;
}

export type AFP = AllFeatureProps;
export type PAFP = Partial<AFP>;

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

export interface TimeTickerElementEndUserProps<T = any> {
    /**
     * Duration in milliseconds between ticks
     */
    duration: number;

    /**
     * Whether the ticker is disabled (stops ticking when true)
     */
    disabled: boolean;

    items: T[];

    item: T;

    idx: number;
}

export interface TimeTickerElementAllProps<T = any> extends TimeTickerElementEndUserProps{

}
