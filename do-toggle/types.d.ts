import { ElementEnhancementGateway, ElementInfer } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

export interface EndUserProps{}

export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    parsedStatements: StatementsResult<TogglingParameters>;
    resolved?: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP  = Promise<PAP>

export interface Actions{
    init(self: AllProps, enhancedElement: Element, initVals: PAP): void;
    hydrate(self: AP): ProPAP;
    handleEvent(self: AP, e: Event, parsedStatement: TogglingParameters): void;
    //infer(el: Element & ElementEnhancementGateway) : Promise<ElementInfer>
}

export interface TogglingParameters {
    prop?: string | null;
    localEventType?: string;
}
