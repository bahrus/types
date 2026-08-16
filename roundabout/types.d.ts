export type Key<T = any> = keyof T & string;

export type Keysh<T = any> = Key<T> | Array<Key<T>>;

type PropsToProps<Props> = (x: Props) => (Promise<Partial<Props>> | Partial<Props>)

export interface LogicOp<Props = any, TActions = Props>{
    /**
     * Supported by trans-render
     */
    ifAllOf?: Keysh<Props>,

    ifKeyIn?: Keysh<Props>,  

    ifNoneOf?: Keysh<Props>,

    ifEquals?: Array<Key<Props>>,

    ifAtLeastOneOf?: Keysh<Props>,

    ifNotAllOf?: Keysh<Props>,

    debug?: boolean,

    delay?: number,

}

/**
 * Extends LogicOp with a `do` property for specifying which function to call.
 * Used by positractions where the function is generic and view-model-neutral.
 */
export interface LogicOpWithDo<Props = any, TActions = Props> extends LogicOp<Props, TActions>{
    do?:
        | Function
        | (keyof TActions & string)
        | PropsToProps<Props>
}

export type Actions<TProps = any, TActions = TProps> = 
    Partial<{[key in keyof TActions & string]: LogicOp<TProps>}>
    //& Partial<{[key in `do_${keyof TActions & string}_on`]: Key<TActions> | Array<Key<TActions>> }> 
;

export type Compacts<TProps = any, TActions = TProps, TEvents extends string = string> = 
    Partial<{[key in `negate_${keyof TProps & string}_to_${keyof TProps & string}`]: number}>
    | Partial<{[key in `pass_length_of_${keyof TProps & string}_to_${keyof TProps & string}`]: number}>
    | Partial<{[key in `echo_${keyof TProps & string}_to_${keyof TProps & string}`]: number}>
    | Partial<{[key in `echo_${keyof TProps & string}_to_${keyof TProps & string}_after`]: keyof TProps}>
    | Partial<{[key in `when_${keyof TProps & string}_changes_call_${keyof TActions & string}`]: number}>
    | Partial<{[key in `when_${keyof TProps & string}_changes_toggle_${keyof TProps & string}`]: number}>
    | Partial<{[key in `when_${keyof TProps & string}_changes_inc_${keyof TProps & string}_by`]: number}>
    | Partial<{[key in `when_${keyof TProps & string}_changes_dispatch`]: string}>
    | Partial<{[key in `on_${TEvents}_of_${keyof TProps & string}_inc_${keyof TProps & string}_by`]: number}>
    | Partial<{[key in `on_${TEvents}_of_${keyof TProps & string}_set_${keyof TProps & string}_to`]: any}>
    | Partial<{[key in `on_${TEvents}_of_${keyof TProps & string}_assign`]: Record<string, any>}>
    | Partial<{[key in `on_${TEvents}_of_${keyof TProps & string}_assignFromEvent`]: Record<string, any>}>
;

export type Hitches<TProps = any, TActions = TProps> = 
    | Partial<{[key in `when_${keyof TProps & string}_emits_${keyof TProps & string}_inc_${keyof TProps & string}_by`]: number}>   
;

export type Handlers<ETProps = any, TActions = ETProps> = 
    | Partial<{[key in `${keyof ETProps & string}_to_${keyof TActions & string}_on` & string]: string }>;

    export type Positractions<TProps = any, TActions = TProps> = 
    | Array<Positraction<TProps, TActions>>;

export interface Positraction<TProps = any, TActions = TProps> extends LogicOpWithDo<TProps, TActions> {
    do: 
        | Function 
        | (keyof TActions & string)
        | PropsToProps<TProps>
    ifKeyIn?: Array<keyof TProps & string>,
    ifAllOf?: Array<keyof TProps & string>,
    //ifNoneOf: Array<keyof TProps & string>,
    
    pass?: Array<(keyof TProps & string) | number | boolean | '$0' | '$0+' | `\`${string}\``>,
    assignTo?: Array<null | (keyof TProps & string)>
}

/**
 * A merge is a fully JSON-serializable reactive rule.
 * When its conditions are met, it calls assignFrom(vm, assignFrom, { from: vm })
 * to resolve RHS path strings against the vm and assign the results into the vm.
 * No method or code is required.
 */
export interface Merge<TProps = any> extends LogicOp<TProps> {
    /**
     * Pattern object whose keys are LHS assignGingerly paths and whose
     * values are RHS `?.`-prefixed path strings resolved against the vm.
     */
    assign: Record<string, any>;
}

export type Merges<TProps = any> = Array<Merge<TProps>>;

/**
 * A yield derives a value from a collection using an index or key.
 * Scenario I: Single selection by index — when the source array or index changes,
 * the target property is set to source[index].
 */
export interface YieldConfig<TProps = any> {
    /** The source array/collection property name */
    from: keyof TProps & string;
    /** The index property name (for array index lookup) */
    atIndex?: keyof TProps & string;
    /**
     * Behavior when the index is out of bounds.
     * - 'undefined' (default): set target to undefined
     * - 'clamp': reset the index to 0 (selects first item)
     */
    outOfBounds?: 'undefined' | 'clamp';
    // Future: atKey, atIndices, keyProp, etc.
}

export type Yields<TProps = any> = {
    [K in keyof TProps & string]?: YieldConfig<TProps>;
};

export interface RAConfig<
        TProps = unknown, TActions = TProps, ETProps = TProps, 
        TCustomData = unknown, TEvents extends string = string > {
    actions?: Actions<TProps,TActions>,
    compacts?: Compacts<TProps, TActions, TEvents>,
    //onsets?: Onsets<TProps, TActions>,
    handlers?: Handlers<ETProps, TActions>,
    hitches?: Hitches<TProps, TActions>,
    positractions?: Positractions<TProps>,
    merges?: Merges<TProps>,
    yields?: Yields<TProps>,
    /**
     * Properties to explicitly monitor and propagate changes for.
     * Use this to ensure getter/setters are installed for properties
     * that aren't referenced by actions, compacts, merges, etc.
     * but still need to fire propagator events (e.g., attribute-parsed
     * properties that other features subscribe to).
     */
    propagate?: keyof TProps & string | Array<keyof TProps & string>,
    /**
     * Configure automatic WeakRef wrapping for properties
     * 
     * Properties listed here will automatically wrap values in WeakRef when set,
     * and automatically deref when accessed. This prevents memory leaks for
     * DOM elements and other objects that should be garbage collected.
     * 
     * Options:
     * - Array of property names: ['trigger', 'enhancedElement']
     * - Object with configuration: { properties: ['trigger'], logIfCollected: 'warn' }
     * 
     * When a WeakRef'd value is garbage collected, the getter returns undefined.
     * Use logIfCollected to get notified when this happens.
     */
    weakRef?: WeakRefConfig<TProps>,

    defaultPropVals?: Partial<{[key in keyof TProps & string]: unknown}>,

    customData?: TCustomData,

    initialPropVals?: Partial<{[key in keyof TProps & string]: unknown}>,
}

export interface RoundaboutOptions<TProps = unknown, TActions = TProps, ETProps = TProps> extends RAConfig<TProps, TActions, ETProps> {
    vm?: TProps & TActions & RoundaboutReady,
    //for enhanced elements, pass in the container, referenced via $0.
    container?: EventTarget,
    
    //mountObservers?: Set<IMountObserver>
    
    /**
     * Enable internal routing optimization for actions (default: false)
     * 
     * When true: Action results are batched and cascaded before firing events.
     * - Eliminates redundant action calls in diamond dependency patterns
     * - More predictable: actions run once per logical change
     * - Best for: Complex cascades, multiple properties returned from actions
     * 
     * When false: Uses traditional approach with immediate event firing.
     * - Simpler execution model, easier to debug
     * - Slightly faster for simple linear cascades
     * - Best for: Simple cascades, performance-critical paths
     * 
     * Enable if you have:
     * - Actions that return multiple properties
     * - Multiple actions monitoring the same properties
     * - Diamond dependencies (A→B, A→C, B→D, C→D)
     */
    internalRouting?: boolean,

    /**
     * Options passed to every internal assignGingerly call.
     * See IAssignGingerlyOptions in assign-gingerly for details.
     */
    assignOptions?: import('../assign-gingerly/types.js').IAssignGingerlyOptions,

    /**
     * Protocol handlers for resolving protocol-prefixed values in initialPropVals.
     * When present, roundabout uses assignFrom (with protocol resolution and "..." spread)
     * instead of plain assignGingerly for applying initial property values.
     * 
     * @example
     * protocols: {
     *     globalThis: (key) => globalThis[key],
     *     localStorage: (key) => JSON.parse(localStorage.getItem(key) || 'null')
     * }
     */
    protocols?: Record<string, (key: string) => any | Promise<any>>,
    

}

/**
 * Configuration for automatic WeakRef wrapping
 */
export interface WeakRefConfig<TProps = any> {
    /**
     * Properties to automatically wrap in WeakRef
     */
    properties: Array<keyof TProps & string>;
    
    /**
     * Logging behavior when deref returns null/undefined
     * - 'error': console.error (default)
     * - 'warn': console.warn
     * - 'silent': no logging
     * - function: custom logging function
     */
    logIfCollected?: 'error' | 'warn' | 'silent' | ((propName: string) => void);
}

export interface RoundaboutReady{
    /**
     * Allow for assigning to read only props via the "backdoor"
     * Bypasses getters / setters, sets directly to (private) memory slots
     * Doesn't do any notification
     * Allows for nested property setting
    */
    covertAssignment(obj: any): Promise<void>;

    /**
     * fires event with name matching the name of the property when the value changes (but not via covertAssignment)
     * when property is set via public interface, not (immediately) via an action method's return object
     */
    readonly propagator : EventTarget | undefined;

    /**
     * 
     * https://github.com/whatwg/dom/issues/1296
     */
    //readonly disconnectedSignal: AbortSignal

    RAController: AbortController;

    /**
     * During this time, queues/buses continue to perform "bookkeeping"
     * but doesn't process the queue until sleep property becomes falsy.
     * If truthy, can call await awake() before processing should resume
     * [TODO]
     */  
    readonly sleep?: number | undefined;

    awake(): Promise<void>;

    //make the value sleep 1 step closer to be falsy
    nudge(): void;

    //make the value of sleep 1 step further away from being falsy
    rock(): void;
}