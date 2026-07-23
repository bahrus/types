/**
 * Context passed to the TruthSourcer feature constructor
 */
export interface FeatureSpawnContext {
    key: string;
    optIn: any;
    injection: any;
    featuresRegistry: any;
    shared?: any;
}

/**
 * Properties that the TruthSourcer feature manages
 */
export interface TruthSourcerProps {
    /**
     * The EventTarget that the host element uses to propagate property change events.
     * TruthSourcer listens for events matching attribute names to sync property -> attribute.
     */
    hostPropagator: EventTarget | null;
}

/**
 * Internal state
 */
export interface AllProps extends TruthSourcerProps {
    /**
     * WeakRef to the host custom element
     */
    hostRef: WeakRef<HTMLElement> | null;

    /**
     * The list of observed attribute names (from static observedAttributes)
     */
    observedAttributes: string[];

    /**
     * AbortController for cleaning up event listeners
     */
    abortController: AbortController | null;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
