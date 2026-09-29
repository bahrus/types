import { ElementEnhancementGateway, SpawnContext, FromEachItemConfig } from "../assign-gingerly/types";

export interface EndUserProps{
    /**
     * Property of host to pull list from.
     * If not provided, the host itself is 
     * assumed to be iterable.
     */
    listProp?: string,
    
    /**
     * Specify id of peer element to pull list from.
     * If not provided, the host is found by searching upwards
     * for an itemscope-managed element, falling back to the
     * shadow root host.
     * Programmatically, may also be the element itself, or a WeakRef to it.
     * Either way it is only ever held weakly:  it is stored as a WeakRef as
     * soon as the enhancement sees it (reading the property yields the element).
     */
    src?: string | Element | WeakRef<Element>;

    /**
     * Specifies how each item's values are distributed into the
     * cloned document fragment.  Parsed from JSON.
     * If not provided, each item's properties are inferred into
     * the clone's [itemprop] descendants.
     */
    each?: FromEachItemConfig,

    /**
     * id of an element (within the same root node) into which the
     * repeating cloned fragments should be placed.
     * If not provided, the fragments are appended to the children
     * of the adorned element (or, if the adorned element is a
     * template, to the template's parent element).
     * Programmatically, may also be the element itself, or a WeakRef to it.
     * Either way it is only ever held weakly:  it is stored as a WeakRef as
     * soon as the enhancement sees it (reading the property yields the element).
     */
    target?: string | Element | WeakRef<Element>,

    /**
     * Name of the event the host dispatches when the list has changed.
     * If not provided, but listProp is, the host is assumed to have
     * a propagator (one is created if it doesn't exist), which is
     * listened to for an event named after listProp.
     */
    updateOn?: string,
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    resolved?: boolean;
    initialized?: boolean;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
}
