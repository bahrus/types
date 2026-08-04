import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

export interface DispatchRule {
    dispatch: string;
    dispatchOn?: string;
    qualifiers?: string;
    bubbles?: boolean;
    composed?: boolean;
    cancelable?: boolean;
    replace?: boolean;
}

export interface EndUserProps {
    crudeDispatchRules: StatementsResult<DispatchRule>;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    dispatchRules: Array<DispatchRule>;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    finishParsing(self: AP): PAP;
    hydrate(self: AP): ProPAP;
}
