import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

export interface SoakUpParameters {
    propMap: string;
    sourceSpecifierString: string;
}

export interface PropMap {
    srcProp: string;
    destProp?: string;
}

export interface SoakUpRule {
    propMap: string;
    sourceSpecifierString: string;
    parsedPropMap?: PropMap[];
}

export interface EndUserProps {
    soakUpRules: StatementsResult<SoakUpParameters>;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    parsedRules: SoakUpRule[];
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    fullyParse(self: AP): PAP;
    hydrate(self: AP): ProPAP;
}
