import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps {
    whenDef: string;
    whenMissing: string;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    onDefined: string[];
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    parseWhenDef(self: AP): PAP;
    onOnDefined(self: AP): ProPAP;
    hydrateOnMissing(self: AP): ProPAP;
}
