import { SpawnContext } from "../assign-gingerly/types";

/**
 * Shared context passed via getSharedContext — contains everything
 * the Reflector needs to self-activate on spawn.
 */
export interface ReflectorSharedContext {
    /** The ElementInternals instance for custom state manipulation */
    internals: ElementInternals;
    /** The EventTarget the host dispatches property change events on */
    hostPropagator: EventTarget;
}

/**
 * Context passed to the Reflector feature constructor
 */
export interface FeatureSpawnContext extends SpawnContext {
    key: string;
    optIn: any;
    injection: any;
    featuresRegistry: any;
    shared?: ReflectorSharedContext;
}

/**
 * A single custom state export rule parsed from --custom-state-exports
 */
export interface CustomStateRule {
    /** The custom state name to toggle (e.g. "disabled", "alertTypeIndicatesSuccess") */
    stateName: string;
    /** The property name to observe */
    propName: string;
    /** The condition type */
    conditionType: 'boolean' | 'equals' | 'contains' | 'endsWith' | 'modulo' | 'lessThan' | 'greaterThan' | 'lessThanOrEqual' | 'greaterThanOrEqual';
    /** The comparison value (for non-boolean conditions) */
    compareValue?: string | number;
    /** The modulo divisor (for modulo conditions) */
    moduloDivisor?: number;
}

/**
 * Properties that the Reflector feature exposes.
 * With callbackForwarding, hostPropagator is provided via getSharedContext
 * and the feature self-activates — but the setter remains for manual use cases.
 */
export interface ReflectorProps {
    /**
     * The EventTarget that the host element uses to propagate property change events.
     * Provided via getSharedContext. Also settable post-spawn for reconnection.
     */
    hostPropagator: EventTarget | null;
}

/**
 * Internal state
 */
export interface AllProps extends ReflectorProps {
    /**
     * WeakRef to the host custom element
     */
    hostRef: WeakRef<HTMLElement> | null;

    /**
     * The ElementInternals instance from the host (for custom state manipulation)
     */
    internals: ElementInternals | null;

    /**
     * Parsed custom state rules from --custom-state-exports CSS property
     */
    rules: CustomStateRule[];

    /**
     * AbortController for cleaning up event listeners
     */
    abortController: AbortController | null;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
