export type EnhKey = string | symbol;

// type NoUnderscore<T extends string> = T extends `_${string}` ? never : T;

// type YesUnderscore = `_${string}`;

// export type StringWithAutocompleteOptions<TOptions> = 
//     | (string & {})
//     | TOptions;

// export type StringNotStartWithUnderscoreAutocompleteOptions<TOptions> = 
//     | (NoUnderscore<string> & {})
//     | TOptions;

// export type StringStartWithUnderscoreAutocompleteOptions<TOptions> = 
//     | (YesUnderscore & {})
//     | TOptions;

//used by mount-observer, not by assign-gingerly
type DisposeEvent = 
    | 'disconnect' 
    | 'dismount'
    // cannot polyfill
    | 'exit' // element moved outside customElementRegistry
    //reference count outside any enhancements goes to zero
    | 'dispose'

export type Spawner<T = any, Obj = Element> = {
  new (obj?: Obj, ctx?: SpawnContext<T>, initVals?: Partial<T>): T;
  canSpawn?: (obj: any, ctx?: SpawnContext<T>) => boolean;
}

export interface EnhancementConfigBase<T = any> {
    //Allow unprefixed attributes for custom elements and SVG when element tag name matches pattern
    allowUnprefixed?: string | RegExp;
    
    //keys of type symbol are used for dependency injection
    //and are used by assign-gingerly
    symlinks?: { [key: symbol]: keyof T };
    
    lifecycleKeys?: 
    | true  // Use standard names: "dispose" method, "resolved" property/event
    | {
        dispose?: string | symbol,
        resolved?: string | symbol
      }
    //used by mount-observer, not by assign-gingerly
    //impossible to polyfill, but will always be disposed
    //when oElement's reference count goes to zero
    disposeOn?: DisposeEvent | DisposeEvent[]
}

/**
 * Configuration for enhancing elements with class instances
 * Defines how to spawn and initialize enhancement classes
 */
export interface EnhancementConfig<T = any, Obj = Element> extends EnhancementConfigBase<T> {
  
  spawn: Spawner<T, Obj>;
  
  //Applicable to passing in the initVals during the spawn lifecycle event
  withAttrs?: AttrPatterns<T>;
  

  //only applicable when spawning from a DOM Element reference
  enhKey?: EnhKey;

  /**
   * Optional features to associate with the spawn class.
   * Calls assignFeatures(spawn, features) automatically on registration.
   */
  features?: FeatureConfigsMap;
    
}

export type Constructor = new (...args: any[]) => any;

export type pathString = `?.${string}`;

export type CustomElementName = string;
export type CustomElementConstructorStaticMethodName = string;

/**
 * Context passed to parser functions
 * Provides access to configuration and spawn context for advanced parsing scenarios
 */
export interface ParserContext<T = any> {
  /**
   * The attribute configuration that matched this attribute
   * Useful for parsers that need to access additional config properties
   */
  attrConfig: AttrConfig<T>;
  
  /**
   * The spawn context containing enhancement config and synthesizer element
   * Useful for parsers that need access to the enhancement or synthesizer context
   */
  spawnContext?: SpawnContext<T>;
  
  /**
   * The element being enhanced
   * Useful for parsers that need to read other attributes or element properties
   */
  element: Element;
  
  /**
   * The attribute name that was matched (resolved from template)
   * Useful for parsers that handle multiple attributes
   */
  attrName: string;
}

/**
 * Parser function signature
 * Can accept just the attribute value (simple form) or value + context (advanced form)
 */
export type ParserFunction<T = any> = 
  | ((attrValue: string | null) => any)
  | ((attrValue: string | null, context?: ParserContext<T>) => any);

export interface AttrConfig<T = unknown, TParserConfig = unknown> {
  /**
   * Type of the property value (JSON-serializable string format)
   */
  instanceOf?: 'Object' | 'String' | 'Number' | 'Boolean' | 'Array' 
              | typeof Object | typeof String | typeof Number | typeof Boolean | typeof Array;

  
  /**
   * Property name on the spawned class instance to map to
   * Use '.' to map to the root object using assignGingerly
   * Is optional.
   * If not specified, we assume it is the key without the underscore first
   * character, unless the key is _base in which case it assume mapsTo = "."
   */
  mapsTo?: 
    | '.' 
    | keyof T 
    | pathString 
    | `${pathString} +=`
    | `${pathString} =!`
    | `${pathString} -=`
  
  /**
   * Parser to transform attribute string value
   * - Function: Inline parser function (not JSON serializable)
   *   - Simple form: (attrValue: string | null) => any
   *   - Advanced form: (attrValue: string | null, context: ParserContext) => any
   * - String: Named parser reference (JSON serializable) - looks up in scoped registry (if available) then global parser registry (e.g., 'timestamp', 'csv')
   * 
   * Parser functions can optionally accept a second parameter (ParserContext) which provides:
   * - attrConfig: The full AttrConfig object for this attribute
   * - spawnContext: The SpawnContext with enhancement config and synthesizer element
   * - element: The element being enhanced
   * - attrName: The resolved attribute name
   */
  parser?: 
    | ParserFunction<T>
    | string
  ;

  /**
   * configuration information needed by a custom parser to properly
   * parse the attribute.
   */
  parserConfig?: TParserConfig;
  
  /**
   * Default value to use when attribute is missing
   * If defined, bypasses parser when attribute is not present
   * If undefined, property is not added to initVals when attribute is missing
   */
  valIfNull?: any;
  
  /**
   * Enable caching of parsed attribute values
   * - 'shared': Cache and reuse the same parsed object (fast, but enhancements must not mutate)
   * - 'cloned': Cache and return a structural clone (safer, but slower)
   * Note: Parsers should be pure functions when using caching
   */
  parseCache?: 'shared' | 'cloned';
  
  // /**
  //  * Whether to only read the initial value (true) or continue observing changes (false)
  //  * Defaults to true (initial read only)
  //  */
  // initialOnly?: boolean;

  /**
   * Should make sure it is added to static observedAttribrutes
   */
  sourceOfTruth?: boolean;

  /**
   * Options to pass to the parser function (e.g., splitStatements behavior).
   * For named parsers like 'parse-pattern-statements', this is forwarded
   * as the options argument to the underlying parse function.
   */
  parserOptions?: any;
}

export type AttrPatterns<T = any> = {
  /**
   * Base prefix for attribute names
   */
  base?: string;

  /**
   * Configuration for the base pattern
   */
  _base?: AttrConfig<T>;
} & {
  // Provide autocomplete for all properties of T (optional)
  [K in keyof T]?: string | AttrConfig<T>;
} & {
  // Provide autocomplete for underscore-prefixed config keys
  [K in keyof T as `_${string & K}`]?: AttrConfig<T>;
} & {
  // Allow any other string keys for custom patterns
  [key: string]: string | AttrConfig<T>;
};


export interface SpawnContext<T = any, TMountContext = any> {
  config: EnhancementConfig<T>;
  mountCtx?: TMountContext;
  /**
   * Reference to the synthesizer element (be-hive, htmx-container, alpine-scope, etc.)
   * that contains the EMC script defining this enhancement.
   * Used for scoped parser registry access during attribute parsing.
   */
  synthesizerElement?: Element;
  /**
   * The full EMC configuration object that triggered this spawn.
   * Passed through so enhancement classes can access their full configuration
   * (including customData) without needing to separately import the JSON file.
   * This avoids duplicate JSON imports when using emoji shorthand aliases.
   */
  emc?: any;
}

/**
 * @deprecated Use EnhancementConfig instead
 */
export type IEnhancementRegistryItem<T = any> = EnhancementConfig<T>;

/**
 * Interface for the options passed to assignGingerly
 */
export interface IAssignGingerlyOptions {
  registry?: typeof EnhancementRegistry | EnhancementRegistry;
  bypassChecks?: boolean;
  withMethods?: string[] | Set<string>;
  aka?: Record<string, string>;
  
  /**
   * AbortSignal for cleaning up reactive subscriptions (@eachTime)
   * Required when using @eachTime symbol for reactive iteration
   * When the signal is aborted, all event listeners are automatically removed
   */
  signal?: AbortSignal;
}

/**
 * Options for assignTentatively — reversible assignment with change tracking.
 * 
 * Supports a subset of assignGingerly's path features (nested paths, +=, =!, -=)
 * with the addition of reversal tracking.
 */
export interface IAssignTentativelyOptions {
  /**
   * Object to accumulate reversal entries into.
   * If omitted, a new object is created internally.
   * Pass an existing object to accumulate reversals across multiple calls.
   * 
   * The reversal object can be passed to assignGingerly to undo all changes:
   * @example
   * const reversal = {};
   * assignTentatively(obj, { name: 'Bob' }, { reversal });
   * // Later:
   * assignGingerly(obj, reversal); // restores name to original value
   */
  reversal?: Record<string | symbol, any>;

  /**
   * Alias mappings for property and method names.
   * Same semantics as IAssignGingerlyOptions.aka — substituted before path evaluation.
   */
  aka?: Record<string, string>;
}

/**
 * Options for synchronous value resolution (getValues / getValue).
 * Extends IAssignGingerlyOptions with synchronous protocol handlers.
 */
export interface GetValuesOptions extends IAssignGingerlyOptions {
  /**
   * Synchronous protocol handlers for resolving protocol-prefixed values.
   * Each handler receives the key portion and MUST return synchronously.
   * For async protocols, use ResolveValuesOptions / resolveValues instead.
   * 
   * @example
   * protocols: {
   *     globalThis: (key) => globalThis[key],
   *     localStorage: (key) => JSON.parse(localStorage.getItem(key) || 'null')
   * }
   */
  protocols?: Record<string, (key: string) => any>;
}

/**
 * Options for async value resolution (resolveValues).
 * Same as GetValuesOptions but protocol handlers may return Promises.
 */
export interface ResolveValuesOptions extends IAssignGingerlyOptions {
  /**
   * Protocol handlers for resolving protocol-prefixed values (e.g., 'globalThis://key').
   * Each handler receives the key portion and returns the resolved value (sync or async).
   */
  protocols?: Record<string, (key: string) => any | Promise<any>>;
}

/**
 * Event dispatched when enhancement configs are registered
 */
export declare class EnhancementRegisteredEvent extends Event {
  static eventName: string;
  config: EnhancementConfig | EnhancementConfig[];
  constructor(config: EnhancementConfig | EnhancementConfig[]);
}

/**
 * Base registry class for managing enhancement configurations
 * Extends EventTarget to dispatch events when configs are registered
 */
export declare class EnhancementRegistry extends EventTarget {
  push(items: EnhancementConfig | EnhancementConfig[]): void;
  getItems(): EnhancementConfig[];
  findBySymbol(symbol: symbol | string): EnhancementConfig | undefined;
  findByEnhKey(enhKey: string | symbol): EnhancementConfig | undefined;
}

/**
 * Constructor signature for ItemScope Manager classes
 */
export type ItemscopeManager<T = any> = {
  new (element: HTMLElement, initVals?: Partial<T>): T;
}

/**
 * Configuration for ItemScope Manager registration
 */
export interface ItemscopeManagerConfig<T = any> {
  /**
   * Manager class constructor
   */
  manager: ItemscopeManager<T>;
  
  /**
   * Optional lifecycle method keys
   * - dispose: Method name to call when manager is disposed
   * - resolved: Property/event name indicating manager is ready
   */
  lifecycleKeys?: {
    dispose?: string | symbol;
    resolved?: string | symbol;
  };

  /**
   * Optional features to associate with the manager class.
   * Calls assignFeatures(manager, features) automatically on registration.
   */
  features?: FeatureConfigsMap;
}

/**
 * Registry for ItemScope Manager configurations
 * Extends EventTarget to support lazy registration via events
 */
export declare class ItemscopeRegistry extends EventTarget {
  define(name: string, config: ItemscopeManagerConfig): void;
  get(name: string): ItemscopeManagerConfig | undefined;
  whenDefined(name: string): Promise<void>;
}

/**
 * Main assignGingerly function
 */
export declare function assignGingerly(
  target: any,
  source: Record<string | symbol, any>,
  options?: IAssignGingerlyOptions
): any;

export default assignGingerly;

export declare class ElementEnhancementGateway{
  //TODO:  this isn't right
  enh: ElementEnhancement;
}

export interface ElementEnhancement{
  get(registryItem: EnhancementConfig | string | symbol, mountCtx?: any): any;
  dispose(registryItem: EnhancementConfig | string | symbol): void;
  whenResolved(registryItem: EnhancementConfig | string | symbol, mountCtx?: any): Promise<any>;
}

// =============================================================================
// Custom Element Features types
// =============================================================================

/**
 * Context passed to feature spawn constructors
 */
export interface FeatureSpawnContext {
    /** The feature key (e.g., 'photoTaker') */
    key: string;
    /** The SupportedFeatureConfig from static supportedFeatures */
    optIn: SupportedFeatureConfig;
    /** The FeatureConfig from assignFeatures */
    injection: FeatureConfig;
    /** The features registry reference */
    featuresRegistry: FeaturesRegistry;
    /** Shared context from the host element (via getSharedContext callback) */
    shared?: any;
}

/**
 * Configuration for a supported feature slot declared via static supportedFeatures
 */
export interface SupportedFeatureConfig {
    /**
     * Optional fallback class (or async spawner) to use if no implementation is injected.
     */
    fallbackSpawn?:
        | { new(hostElement: any, ctx: FeatureSpawnContext, initVals?: any): any }
        | (() => Promise<{ new(hostElement: any, ctx: FeatureSpawnContext, initVals?: any): any }>);

    /**
     * Optional runtime shape validation for the spawned instance.
     * Return true if the instance is valid, false to throw.
     */
    validateShape?: (spawnedInstance: any) => boolean;

    /**
     * Optional callback to provide shared context (e.g., ElementInternals, private state)
     * to the feature at construction time.
     */
    getSharedContext?: (instance: any) => any;

    /**
     * Lifecycle callbacks that this feature requires.
     * Serves as the default — the consumer can add more via FeatureConfig.callbackForwarding.
     */
    callbackForwarding?: string[];
}

/**
 * Class-level configuration for the features system.
 * Declared as `static featuresConfig` on the class.
 */
export interface FeaturesClassConfig {
    /**
     * Lifecycle method configuration.
     * true = install 'whenFeatureReady' method.
     * Object = custom method name.
     */
    lifecycleKeys?: true | {
        whenFeatureReady?: string;
    };
}

/**
 * Configuration for a feature passed to assignFeatures.
 */
export interface FeatureConfig {
    /**
     * The class to instantiate, or an async function returning one.
     */
    spawn?:
        | { new(hostElement: any, ctx: FeatureSpawnContext, initVals?: any): any }
        | (() => Promise<{ new(hostElement: any, ctx: FeatureSpawnContext, initVals?: any): any }>);

    /** Attribute patterns for parsing element attributes into initVals. */
    withAttrs?: AttrPatterns<any>;

    /** Pass-through custom configuration data (accessible via ctx.injection.customData). */
    customData?: any;

    /** Lifecycle callbacks to forward to this feature. */
    callbackForwarding?: string[];
}

export type SupportedFeaturesMap = Record<string, SupportedFeatureConfig>;
export type FeatureConfigsMap = Record<string, FeatureConfig>;

/**
 * Registry for feature configs, keyed by constructor.
 */
export declare class FeaturesRegistry {
    has(ctr: Function): boolean;
    get(ctr: Function): Map<string, FeatureConfig> | undefined;
    set(ctr: Function, key: string, config: FeatureConfig): void;
    hasKey(ctr: Function, key: string): boolean;
}

/**
 * A suggestion from one feature to another.
 */
export interface FeatureInfoSuggestion {
    from: Function;
    withAttrs?: any;
    customData?: any;
}

/**
 * Core assignFeatures function.
 */
export declare function assignFeatures(
    ctr: Function,
    features: FeatureConfigsMap,
    featuresRegistry: FeaturesRegistry
): Promise<void> | undefined;

/**
 * Captures own-properties that shadow feature getters.
 */
export declare function captureFeatureInitVals(instance: any): void;

/**
 * Suggest configuration to another feature during registration.
 */
export declare function suggestFeatureInfo(
    fromFeatureCtr: Function,
    toFeatureSymbol: symbol,
    featureInfo: { withAttrs?: any; customData?: any },
    targetClass: Function
): void;

/**
 * Retrieve suggestions made to a feature by other features.
 */
export declare function getFeatureInfoSuggestions(
    toFeatureSymbol: symbol,
    targetClass: Function
): FeatureInfoSuggestion[];

/**
 * Base class for nested feature containers.
 */
export declare class PropertyBag {
    customElementRegistry: any;
    constructor(hostElement: any, ctx?: FeatureSpawnContext, initVals?: any);
}

// =============================================================================
// assignFrom handler types
// =============================================================================

/**
 * Base configuration for an assignFrom handler invocation.
 * The `do` field identifies the handler; `resolve` maps named parameters to path strings.
 */
export interface HandlerConfig {
    /** The registered handler name */
    do: string;
    /** Named parameters to resolve against the `from` source before passing to the handler */
    resolve?: Record<string, string>;
}

/**
 * Interface for assignFrom handler classes.
 * Handlers are invoked when a LHS key ends with ' =>'.
 */
export interface AssignFromHandler {
    assign(lhsTarget: any, resolvedParams: Record<string, any>, options: any): Promise<void> | void;
}

/**
 * Constructor signature for assignFrom handler classes.
 */
export interface AssignFromHandlerConstructor {
    new (config: HandlerConfig): AssignFromHandler;
}

// =============================================================================
// Built-in handler config types
// =============================================================================

/**
 * Configuration for the builtIns.lazyLoad handler.
 */
export interface LazyLoadConfig extends HandlerConfig {
    do: 'builtIns.lazyLoad';
    resolve: {
        /** Condition to show/hide (resolved from VM) */
        if: string;
        /** Template element to clone (resolved via protocol or path) */
        instantiate: string;
        /** Insert method: 'appendChild' (default), 'prepend', or 'after' (sibling after target) */
        method?: string;
        /** If true, removes nodes when hiding instead of adding hidden attribute */
        forget?: boolean | string;
        /** Enable view transitions */
        transitional?: boolean | string;
        /** CSS class for hiding (default: 'ag-hide', only used when transitional: true) */
        hideClass?: string;
        /** Custom CSS for the hide class (default: 'display: none') */
        hideCss?: string;
        /** Optional async callback invoked after cloning, resolved from the VM */
        onInstantiated?: string;
        /** Override auto-derived marker name */
        markerName?: string;
        /** Set inert attribute on hidden elements */
        toggleInert?: boolean | string;
        /** Set disabled property on hidden form elements */
        toggleDisabled?: boolean | string;
    };
}

/**
 * Resolved parameters received by LazyLoadHandler.assign() after resolveValues processing.
 */
export interface LazyLoadResolvedParams {
    /** Condition — resolved to actual truthy/falsy value */
    if: any;
    /** Template element — resolved to HTMLTemplateElement or DocumentFragment */
    instantiate: HTMLTemplateElement | DocumentFragment;
    /** Insertion method (default: 'appendChild') */
    method?: 'appendChild' | 'prepend' | 'after';
    /** Remove nodes on hide instead of using hidden attribute */
    forget?: boolean;
    /** Enable view transitions */
    transitional?: boolean;
    /** CSS class for hiding (default: 'ag-hide', only used when transitional: true) */
    hideClass?: string;
    /** Custom CSS for the hide class (default: 'display: none') */
    hideCss?: string;
    /** Callback after clone+insert */
    onInstantiated?: (ctx: LazyLoadInstantiatedContext) => void | Promise<void>;
    /** Override auto-derived marker name */
    markerName?: string;
    /** Set inert attribute on hidden elements (removes from a11y tree + interaction) */
    toggleInert?: boolean;
    /** Set disabled property on hidden form elements */
    toggleDisabled?: boolean;
    /** Name of a pre-existing marker pair whose content should be removed on first activation.
     *  Used for SSR placeholder content (e.g., "Loading..." text) that disappears once real content loads. */
    placeholder?: string;
    /** Assignment config applied to cloned content before insertion.
     *  Same shape as manageTemplateList's fromEachItem: { assignToFragment, withOptions } or { configs: [...] } */
    assign?: {
        assignToFragment?: Record<string, any>;
        withOptions?: Record<string, any>;
        configs?: Array<{ assignToFragment?: Record<string, any>; withOptions?: Record<string, any> }>;
    };
}

/**
 * Configuration for the builtIns.lazyLoadSwitch handler.
 */
export interface LazyLoadSwitchConfig extends HandlerConfig {
    do: 'builtIns.lazyLoadSwitch';
    resolve: {
        /** Left-hand side of comparison (resolved from VM) */
        lhs: string;
        /** Comparison operator (default: '===') */
        op?: '===' | '!==' | '==' | '!=' | '<' | '>' | '<=' | '>=';
        /** Right-hand side of comparison (resolved from VM or literal) */
        rhs: string;
        /** Template element to clone (resolved via protocol or path) */
        instantiate: string;
        /** Insert method: 'appendChild' (default), 'prepend', or 'after' */
        method?: string;
        /** If true, removes nodes when hiding instead of adding hidden attribute */
        forget?: boolean | string;
        /** Enable view transitions */
        transitional?: boolean | string;
        /** CSS class for hiding (default: 'ag-hide', only used when transitional: true) */
        hideClass?: string;
        /** Custom CSS for the hide class (default: 'display: none') */
        hideCss?: string;
        /** Optional async callback invoked after cloning, resolved from the VM */
        onInstantiated?: string;
    };
}

/**
 * Resolved parameters received by LazyLoadSwitchHandler.assign() after resolveValues processing.
 */
export interface LazyLoadSwitchResolvedParams extends Omit<LazyLoadResolvedParams, 'if'> {
    /** Left-hand side — resolved to actual value */
    lhs: any;
    /** Comparison operator (default: '===') */
    op?: '===' | '!==' | '==' | '!=' | '<' | '>' | '<=' | '>=';
    /** Right-hand side — resolved to actual value */
    rhs: any;
}

/**
 * Resolved parameters received by ManageTemplateListHandler.assign().
 */
export interface ManageTemplateListResolvedParams {
    /** The iterable to loop over (resolved from VM) */
    forEach: Iterable<any>;
    /** Template element to clone per item */
    instantiate: HTMLTemplateElement | DocumentFragment;
    /** Insertion method (default: 'appendChild') */
    method?: 'appendChild' | 'prepend' | 'after';
    /** Remove nodes on hide instead of using hidden attribute */
    forget?: boolean;
    /** Override auto-derived marker name */
    markerName?: string;
    /** Wait for async rendering before DOM commit */
    waitForSettled?: boolean | { idleMs?: number; timeout?: number };
    /** Yield to browser every N items to prevent jank (default: undefined = no yielding) */
    yieldEvery?: number;
}

/**
 * Context passed to onInstantiated callbacks after template cloning.
 */
export interface LazyLoadInstantiatedContext {
    /** The inserted child nodes */
    nodes: Node[];
    /** The target element containing the markers */
    target: Element;
    /** The full handler config */
    config: any;
    /** The resolved parameters */
    resolvedParams: Record<string, any>;
}

/**
 * The LazyLoadHandler class (exported for subclassing).
 */
export declare class LazyLoadHandler implements AssignFromHandler {
    config: any;
    constructor(config: any);
    assign(lhsTarget: any, resolvedParams: Record<string, any>, options?: any): Promise<void>;
    protected onCloneInserted(nodes: Node[], lhsTarget: Element, resolvedParams: Record<string, any>): Promise<void>;
}
