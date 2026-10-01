import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps{
    /** Event name(s) to listen for. A single string is accepted programmatically. */
    on: string | string[];
    /** Property name(s) to reflect to attributes. A single string is accepted programmatically. */
    props: string | string[];
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    resolved: boolean;
    initialized?: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions{
    hydrate(self: AP): ProPAP;
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
}
