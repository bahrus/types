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
    
}

export type Constructor = new (...args: any[]) => any;

export type pathString = `?.${string}`;

export type CustomElementName = string;
export type CustomElementConstructorStaticMethodName = string;

export interface AttrConfig<T = any> {
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
   * - String: Named parser reference (JSON serializable) - looks up in global parser registry (e.g., 'timestamp', 'csv')
   * - Tuple: [CustomElementName, StaticMethodName] - looks up static method on custom element constructor (e.g., ['my-widget', 'parseSpecial'])
   */
  parser?: 
    | ((attrValue: string | null) => any) 
    | string 
    | [CustomElementName, CustomElementConstructorStaticMethodName]
  ;
  
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
}

export type AttrPatterns<T = any> = {
  /**
   * Base prefix for attribute names
   */
  base: string;

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
  private items;
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
  enh: ElementEnhancement;
}

export interface ElementEnhancement{
  dispose(regItem: EnhancementConfig): void;
}
