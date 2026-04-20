import { StatementsResult } from "../nested-regex-groups/types";

export interface Specifier {
    selector?: string;
    prop?: string;
}

export interface EndUserProps{}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
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
}

export interface TogglingParameters {
    prop: string;
    localEventType?: string;
}
