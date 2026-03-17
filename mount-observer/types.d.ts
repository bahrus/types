// Core types for MountObserver v2 - Polyfill Supported Scenario I

import {Spawner, EnhancementConfigBase, EnhKey} from '../assign-gingerly/types';

export type Constructor = new (...args: any[]) => any;

export type EventConstructor = {new(...args: any[]): Event};

export interface EventConfig {
    event: string | EventConstructor;
    args?: any | any[];
    eventProps?: Record<string, any>;
    oncePerMountedElement?: boolean;
}

export type DismountReason = 
    | 'media-query-failed'
    | 'root-size-failed'
    | 'intersection-failed'
    | 'connection-failed'
    | 'with-matching-failed';

export interface ConnectionCondition {
    effectiveTypeIn?: string[];
    downlinkMin?: number;
    downlinkMax?: number;
    rttMax?: number;
}

/**
 * Configuration for enhancing elements with class instances
 * Defines how to spawn and initialize enhancement classes
 */
export interface LazyEnhancementConfig<T = any, Obj = Element> extends EnhancementConfigBase<T, Obj> {
  
    // bare import specifier path
    spawn: string;
  
    enhKey: EnhKey;

    //Applicable to passing in the initVals during the spawn lifecycle event
    withAttrs?: AttrPatterns<T>;
    
}





/**
 * Configuration object for MountObserver that defines what elements to observe and how to handle them.
 * All `where*` properties form an AND condition - elements must satisfy ALL specified conditions to mount.
 * 
 * @template TKeys - String literal type for sub-observer keys when using the `with` property
 */
export interface MountConfig<TKeys extends string = string> {
    /**
     * CSS selector string to match elements.
     * Only elements matching this selector will be considered for mounting.
     * @example 'button.fancy' or 'div > p.highlight'
     */
    matching?: string;
    
    /**
     * Custom element tag name(s) that must be defined before mounting occurs.
     * Waits for customElements.whenDefined() to resolve for each specified tag.
     * Uses the customElementRegistry of the observed root node.
     * This check happens first, before any other where* conditions.
     * @example 'my-button' or ['my-button', 'my-input']
     */
    whenDefined?: string | string[];
    
    /**
     * Constructor or array of constructors to filter elements by instance type.
     * Elements must be instances of at least one of the specified constructors (OR logic for arrays).
     * @example HTMLButtonElement or [HTMLInputElement, HTMLTextAreaElement]
     */
    whereInstanceOf?: Constructor | Constructor[];
    
    /**
     * Media query string or MediaQueryList for conditional mounting based on viewport/media conditions.
     * Elements only mount when the media query matches.
     * @example '(min-width: 768px)' or '(prefers-color-scheme: dark)'
     */
    withMediaMatching?: string | MediaQueryList;
    
    /**
     * CSS selector defining a "donut hole" scope perimeter.
     * Excludes elements that are descendants of elements matching this selector.
     * Useful for preventing observation of nested scopes.
     * @example '.no-observe' to exclude elements inside .no-observe containers
     */
    withScopePerimeter?: string;
    
    /**
     * Container query string for conditional mounting based on observed root element size.
     * Elements only mount when the root node matches this size condition.
     * @example '(min-width: 500px)' to only mount when root is at least 500px wide
     */
    whereObservedRootSizeMatches?: string;
    
    /**
     * IntersectionObserver configuration for conditional mounting based on element visibility.
     * Elements only mount when they intersect with the viewport according to these options.
     * @example { rootMargin: '50px', threshold: 0.5 }
     */
    whereElementIntersectsWith?: IntersectionObserverInit;
    
    /**
     * Network connection conditions for conditional mounting.
     * Elements only mount when network conditions match the specified criteria.
     * Useful for adaptive loading based on connection quality.
     */
    whereConnectionHas?: ConnectionCondition;
    
    /**
     * When true, inverts the default registry matching behavior.
     * Default (false): Only mount elements with the SAME customElementRegistry as the root node.
     * When true: Only mount elements with a DIFFERENT customElementRegistry than the root node.
     * Useful for cross-registry observation scenarios.
     * @example true to observe elements from other shadow DOM scopes
     */
    whereDifferentCustomElementRegistry?: boolean;
    
    /**
     * Regular expression or string pattern to match against element's localName.
     * Only elements whose localName matches this pattern will mount.
     * String values are converted to RegExp.
     * @example /^my-/ to match elements starting with 'my-'
     * @example 'button|input' to match button or input elements
     */
    whereLocalNameMatches?: string | RegExp;
    
    /**
     * Module(s) to import before mounting elements.
     * Can be a URL string, ImportSpec object, or array of either.
     * Modules are loaded based on loadingEagerness setting.
     * @example './my-component.js' or [{ url: './styles.css', type: 'css' }]
     */
    import?: string | ImportSpec | Array<string | ImportSpec>;
    
    /**
     * Handler(s) to execute when elements mount.
     * Can be:
     * - String: Name of a registered handler (e.g., 'builtIns.defineCustomElement')
     * - Function: Inline callback function
     * - Array: Multiple handlers to execute in order
     * @example 'builtIns.defineCustomElement' or (el, ctx) => { el.classList.add('mounted') }
     */
    do?: string | DoCallback | (string | DoCallback)[];
    
    /**
     * Custom JavaScript check that runs after all declarative where* conditions pass.
     * This is the final gate before mounting occurs.
     * 
     * If shouldMount returns false, the element is not mounted (no do callback, no mount event).
     * If shouldMount throws an error, it is treated as returning false and the error is logged.
     * 
     * @example (el) => currentUser.hasRole('admin')
     * @example (el) => el.dataset.apiKey && el.dataset.apiEndpoint
     */
    shouldMount?: ShouldMountCallback;
    
    /**
     * Controls when imports are loaded.
     * - 'eager': Load imports immediately when MountObserver is created
     * - 'lazy': Load imports only when first matching element is found (default)
     */
    loadingEagerness?: 'eager' | 'lazy';
    
    /**
     * Properties to assign to elements when they mount.
     * Uses assign-gingerly for safe property assignment.
     * @example { disabled: false, tabIndex: 0 }
     */
    assignOnMount?: Record<string, any>;
    
    /**
     * Properties to assign to elements when they dismount.
     * Uses assign-gingerly for safe property assignment.
     * @example { disabled: true }
     */
    assignOnDismount?: Record<string, any>;
    
    /**
     * Properties to tentatively assign on mount with automatic reversal on dismount.
     * Original values are saved and restored when element dismounts.
     * @example { hidden: false } - will restore original hidden value on dismount
     */
    stageOnMount?: Record<string, any>;
    
    /**
     * When true, enables detailed event dispatching for debugging and monitoring.
     * Provides granular lifecycle events for observation.
     */
    getPlayByPlay?: boolean;
    
    /**
     * Event(s) to emit from mounted elements.
     * Can be a single EventConfig or array of EventConfigs.
     * Allows elements to dispatch custom events when mounted.
     * @example { event: 'ready', args: { detail: 'mounted' } }
     */
    mountedElemEmits?: EventConfig | EventConfig[];
    
    /**
     * External module(s) to import MountConfig from.
     * Allows separating JSON-serializable config from non-serializable handlers.
     * Loaded configs are merged left-to-right, with inline config taking final precedence.
     * @example './config.js' or ['./base-config.js', './override-config.js']
     */
    configFrom?: string | string[];
    
    /**
     * Custom data to pass to handler classes or functions.
     * Allows handlers to receive additional context-specific information.
     * Not used by MountObserver itself, but available in MountContext.
     */
    customData?: unknown;
    
    /**
     * Sub-observer configurations for hierarchical composition.
     * Each key-value pair defines a sub-observer that will observe the same root node as the parent.
     * Sub-observers are created when the parent's observe() method is called and automatically
     * disconnected when the parent disconnects.
     * 
     * Sub-observers operate independently with their own configurations and do not inherit
     * properties from the parent observer. Each sub-observer can have its own `with` property
     * for unlimited nesting depth.
     * 
     * @example
     * ```typescript
     * const observer = new MountObserver({
     *   matching: '.parent',
     *   with: {
     *     registry: { matching: 'my-element', do: 'builtIns.defineCustomElement' },
     *     styles: { import: './styles.css' }
     *   }
     * });
     * ```
     */
    with?: {[K in TKeys]: MountConfig};

    enHint:
}



export interface ImportSpec {
    url: string;
    type?: 'js' | 'css' | 'json' | 'html';
}

/**
 * Context object passed to mount handlers containing information about the mounted element and observer state.
 * 
 * @template TKeys - String literal type for sub-observer keys when using the `with` property
 */
export interface MountContext<TKeys extends string = string> {
    modules: any[];
    observer: IMountObserver;
    rootNode: Node;
    
    /**
     * The configuration object for this observer.
     * Contains all the settings that define what elements to observe and how to handle them.
     */
    mountConfig: MountConfig<TKeys>;
    
    /**
     * Map of sub-observers created from the `with` property in mountConfig.
     * Only present when the parent observer has sub-observers defined.
     * Keys match the keys from the `with` property, providing type-safe access to sub-observers.
     * 
     * @example
     * ```typescript
     * do: (el, ctx) => {
     *   // Access sub-observers with type safety
     *   const registryObserver = ctx.withObservers?.registry;
     *   if (registryObserver) {
     *     console.log('Registry observer:', registryObserver);
     *   }
     * }
     * ```
     */
    withObservers?: {[K in TKeys]: IMountObserver};
}



export type DoCallback<TKeys extends string = string> = (mountedElement: Element, context: MountContext<TKeys>) => void;

/**
 * Callback function that performs a final check before mounting an element.
 * Called after all declarative where* conditions have passed.
 * 
 * @param mountedElement - The element being considered for mounting
 * @param context - The mount context containing modules, observer, config, etc.
 * @returns true to allow mounting, false to prevent it
 */
export type ShouldMountCallback<TKeys extends string = string> = (mountedElement: Element, context: MountContext<TKeys>) => boolean;

// export interface DoCallbacks {
//     mount?: (mountedElement: Element, context: MountContext) => void;
//     dismount?: (mountedElement: Element, context: MountContext) => void;
//     disconnect?: (mountedElement: Element, context: MountContext) => void;
//     reconnect?: (mountedElement: Element, context: MountContext) => void;
// }

export type MountScope = 
    | 'registry'     // Observe all scopes with matching registry (new default)
    | 'registryRoot' // getRegistryRoot - finds highest node with matching customElementRegistry
    | 'self'         // this element
    | 'root'         // getRootNode()
    | 'shadow'       // shadowRoot (throws if none)
    | Element;       // custom element to observe

export interface MountObserverOptions {
    disconnectedSignal?: AbortSignal;
    scope?: MountScope;
    mose?: WeakRef<HTMLScriptElement>;
}

export interface WeakDual<T extends Object>{
    weakSet: WeakSet<T>,
    setWeak: Set<WeakRef<T>>
}

export interface WeakMapDual<T extends Object, R extends Object>{
    weakMap: WeakMap<T, R>,
    setWeak: Set<WeakRef<T>> 
}

export interface IMountObserver extends EventTarget {
    observe(observedNode: Node): Promise<void>;
    disconnect(): void;
    disconnectedSignal: AbortSignal;
    assignGingerly(config: Record<string, any> | undefined): Promise<void>;
    getNotifier(element: Element): EventTarget;
    readonly options: MountObserverOptions;
}

export interface IMountEvent extends Event {
    mountedElement: Element;
    modules: any[];
    mountConfig: MountConfig;
    mountContext: MountContext;
}

export interface IDismountEvent extends Event {
    mountedElement: Element;
    reason: DismountReason;
    mountConfig: MountConfig;
}


