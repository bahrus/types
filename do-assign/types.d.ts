import { ElementEnhancementGateway, SpawnContext, AddEventListenerConfig } from "../assign-gingerly/types";

export interface EndUserProps{
    /**
     * Event-binding configuration(s), parsed from the JSON value of the
     * do-assign (or 🪧) attribute.  A single config object, or an array of
     * them.  See assign-gingerly's event-binding documentation for the shape.
     */
    assignConfig: AddEventListenerConfig | AddEventListenerConfig[],

    /**
     * id of a peer element (within the same root node) to treat as the host.
     * If not provided, the host is found by searching upwards for an
     * itemscope-managed element, falling back to the shadow root host.
     */
    host?: string,
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    resolved?: boolean;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
}
