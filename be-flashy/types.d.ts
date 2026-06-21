import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps{
    duration: number;
    attr: string;
    css: string;
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    resolved: boolean;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
export type ProPAP = Promise<PAP>;

export interface Actions{
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
}
