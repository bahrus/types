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

    do?:
        | Function
        | (keyof TActions & string)
        | PropsToProps<Props>

}

export type Actions<TProps = any, TActions = TProps> = 
    Partial<{[key in keyof TActions & string]: LogicOp<TProps>}>
    //& Partial<{[key in `do_${keyof TActions & string}_on`]: Key<TActions> | Array<Key<TActions>> }> 
;

export type Compacts<TProps = any, TActions = TProps> = 
    //| Partial<{[key in `${keyof TProps & string}_to_${keyof TProps & string}` & string]: Operation<TProps> }>
    | Partial<{[key in `negate_${keyof TProps & string}_to_${keyof TProps & string}`]: number}>
    | Partial<{[key in `pass_length_of_${keyof TProps & string}_to_${keyof TProps & string}`]: number}>
    | Partial<{[key in `echo_${keyof TProps & string}_to_${keyof TProps & string}`]: number}>
    | Partial<{[key in `echo_${keyof TProps & string}_to_${keyof TProps & string}_after`]: keyof TProps}>
    | Partial<{[key in `when_${keyof TProps & string}_changes_call_${keyof TActions & string}`]: number}>
    | Partial<{[key in `when_${keyof TProps & string}_changes_toggle_${keyof TProps & string}`]: number}>
    | Partial<{[key in `when_${keyof TProps & string}_changes_inc_${keyof TProps & string}_by`]: number}>
    | Partial<{[key in `when_${keyof TProps & string}_changes_dispatch`]: string}> //TODO
;

export type Hitches<TProps = any, TActions = TProps> = 
    | Partial<{[key in `when_${keyof TProps & string}_emits_${keyof TProps & string}_inc_${keyof TProps & string}_by`]: number}>   
;

export type Handlers<ETProps = any, TActions = ETProps> = 
    | Partial<{[key in `${keyof ETProps & string}_to_${keyof TActions & string}_on` & string]: string }>;

    export type Positractions<TProps = any, TActions = TProps> = 
    | Array<Positraction<TProps, TActions>>;

export interface Positraction<TProps = any, TActions = TProps> extends LogicOp<TProps, TActions> {
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

export interface RAConfig<TProps = unknown, TActions = TProps, ETProps = TProps> {
    actions?: Actions<TProps,TActions>,
    compacts?: Compacts<TProps, TActions>,
    //onsets?: Onsets<TProps, TActions>,
    handlers?: Handlers<ETProps, TActions>,
    hitch?: Hitches<TProps, TActions>,
    positractions?: Positractions<TProps>,
}

export interface RoundaboutOptions<TProps = unknown, TActions = TProps, ETProps = TProps> extends RAConfig<TProps, TActions, ETProps> {
    vm?: TProps & TActions & RoundaboutReady,
    //for enhanced elements, pass in the container, referenced via $0.
    container?: EventTarget,
    propagate?: keyof TProps & string | Array<keyof TProps & string>,
    
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