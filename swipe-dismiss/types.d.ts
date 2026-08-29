import { FeatureSpawnContext } from "../assign-gingerly/types";

/**
 * Public properties of the SwipeDismissFeature.
 * These can be set directly on the feature instance or initialized via attributes.
 */
export interface SwipeDismissProps {
    /** Axis along which the dismiss gesture is measured. */
    axis: 'x' | 'y';
    /**
     * Direction that counts toward dismissal.
     * 1 = right/down, -1 = left/up.
     * Set to 'both' to allow swiping in either direction (e.g. toasts/snackbars).
     */
    direction: 1 | -1 | 'both';
    /** Fraction of the panel size that triggers commit. */
    distanceThreshold: number;
    /** Velocity threshold in px/ms; a fast flick commits even under distanceThreshold. */
    velocityThreshold: number;

    /** Called on every pointermove with the current delta and fraction of the threshold. */
    onProgress: ((deltaPx: number, fraction: number) => void) | null;
    /** Called when the gesture crosses the commit threshold. */
    onCommit: (() => void) | null;
    /** Called when the gesture is released before the commit threshold. */
    onCancel: (() => void) | null;

    /** Element used for dragging */
    handle: Element;
    /** Element used to open / close */
    panel: Element;
}

/**
 * Internal state of the feature.
 */
export interface AllProps extends SwipeDismissProps {
    /** WeakRef to the host custom element. */
    hostRef: WeakRef<Element>;

    /** Live gesture progress, refreshed on every pointermove and on release. */
    progressState: {
        /** Always-positive drag magnitude along the axis, clamped to panel size. */
        deltaPx: number;
        /** `deltaPx` as a fraction of panel size (0–1). */
        fraction: number;
        /**
         * `deltaPx` signed for a screen-space `translate`: negative for a
         * left/up drawer, positive for right/down. Feed this straight into
         * `translateX()` / `translateY()` so the panel follows the finger
         * regardless of which edge it is docked to.
         */
        translatePx: number;
    };
}

export type AP = AllProps;
export type PAP = Partial<AllProps>;

export { FeatureSpawnContext };
