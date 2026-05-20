import { SpawnContext } from "../assign-gingerly/types";

/**
 * Shared context passed via getSharedContext — contains the
 * ElementInternals instance needed for form control APIs.
 */
export interface FaceUpSharedContext {
    /** The ElementInternals instance for form control APIs */
    internals: ElementInternals;
}

/**
 * Context passed to the FaceUp feature constructor
 */
export interface FeatureSpawnContext extends SpawnContext {
    key: string;
    optIn: any;
    injection: any;
    featuresRegistry: any;
    shared?: FaceUpSharedContext;
}

/**
 * Validation flags matching the ValidityStateFlags interface.
 * Used with setValidity() to indicate the type of validation error.
 */
export interface ValidationFlags {
    valueMissing?: boolean;
    typeMismatch?: boolean;
    patternMismatch?: boolean;
    tooLong?: boolean;
    tooShort?: boolean;
    rangeUnderflow?: boolean;
    rangeOverflow?: boolean;
    stepMismatch?: boolean;
    badInput?: boolean;
    customError?: boolean;
}

/**
 * Properties that the FaceUp feature exposes.
 * These allow the host custom element to participate in HTML forms
 * via the ElementInternals API.
 *
 * Because the feature is installed as a getter-only property,
 * assignGingerly merges directly into the instance. The consumer
 * simply sets properties (e.g., el.faceUp.value = x) and the
 * setters handle syncing to ElementInternals automatically.
 */
export interface FaceUpProps {
    /**
     * The current form value of the control.
     * Setting this calls setFormValue() on the internals.
     */
    value: string | File | FormData | null;

    /**
     * Internal state for form restoration (optional).
     * If provided, passed as the second argument to setFormValue().
     */
    state: string | File | FormData | null;

    /**
     * Whether the control is currently disabled.
     */
    disabled: boolean;

    /**
     * Whether the control requires a value for form submission.
     */
    required: boolean;

    /**
     * Custom validation message. Setting a non-empty string
     * marks the control as invalid with customError.
     */
    validationMessage: string;
}

/**
 * Internal state
 */
export interface AllProps extends FaceUpProps {
    /**
     * WeakRef to the host custom element
     */
    hostRef: WeakRef<HTMLElement> | null;

    /**
     * The ElementInternals instance from the host (for form control APIs)
     */
    internals: ElementInternals | null;
}

export type AP = AllProps;
export type PAP = Partial<AP>;



export interface CustomData {
    integrateWithRoundabout: boolean;
}
