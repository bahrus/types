import type { EnhancementConfig } from "../assign-gingerly/types";

/**
 * Symbol for smart value assignment
 */
export declare const value: symbol;

/**
 * Symbol for smart display assignment
 */
export declare const display: symbol;

/**
 * Enhancement class that provides smart value and display property inference
 */
export declare class Infer<TValue = any, TDisplay = any> {
    get enhancedElement(): Element;
    constructor(enhancedElement?: Element, propName?: string);
    /** Live, type-coerced read of the element's inferred value property. */
    get value(): TValue | undefined;
    set value(nv: TValue);
    get display(): TDisplay | undefined;
    set display(nv: TDisplay);
    get eventType(): string;
    /** The inferred value property name (e.g. 'value', 'checked', 'dateTime'). */
    get valueProperty(): string;
    /** Effective language: nearest `lang`/`xml:lang` ancestor (across shadow hosts), then `<html lang>`, then `navigator.language`. */
    get lang(): string | undefined;
    get defaultRemoteBindingPropName(): string;
    /**
     * EventTarget that emits an event named after the changed property.
     * Custom elements with a native propagator return that; otherwise an
     * InferencedPropagator using best-effort change detection.
     */
    getPropagator(): Promise<EventTarget>;
    setDisplay(vm: any): void;
}

/**
 * Read the inferred value property off an element and coerce it to a natural
 * JavaScript type (Date for <time>, number/boolean via JSON parse for <data>,
 * schema.org itemtype hints honored, textContent verbatim).
 */
export declare function coerceElementValue(element: Element, propName?: string): any;

/**
 * Serialize a JS value for assignment to a DOM value property: Date -> ISO string,
 * plain object/array -> JSON string, DOM-typed props (checked/valueAsNumber/valueAsDate) pass through.
 */
export declare function serializeForProperty(propName: string, nv: any): any;

/**
 * Resolve the effective language for an element: nearest `lang`/`xml:lang` ancestor
 * (crossing shadow-root hosts), then `<html lang>`, then `navigator.language`.
 */
export declare function resolveLang(element: Element): string | undefined;

/**
 * Registry item for the Infer enhancement
 */
export declare const registryItem: EnhancementConfig;

/**
 * Infer the most appropriate value property for an element
 */
export declare function inferValueProperty(element: Element): string;

/**
 * Infer the most appropriate display property for an element
 */
export declare function inferDisplayProperty(element: Element): string;

/**
 * Infer the most appropriate event type for an element
 */
export declare function inferEventType(element: Element): string;

export default registryItem;
