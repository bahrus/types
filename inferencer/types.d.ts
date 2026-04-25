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
    constructor(enhancedElement?: Element);
    get value(): TValue | undefined;
    set value(nv: TValue);
    get display(): TDisplay | undefined;
    set display(nv: TDisplay);
    get eventType(): string;
}

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
