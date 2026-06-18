import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps{
    on: string[];
    props: string[];
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions{
    hydrate(self: AP): ProPAP;
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
}
