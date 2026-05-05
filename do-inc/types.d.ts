import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

export interface EndUserProps{
    parsedStatements: StatementsResult<IncParameters>,
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP  = Promise<PAP>

export interface Actions{
    hydrate(self: AP & Actions): ProPAP;
    handleEvent(self: AP, event: Event, incParameters: IncParameters): void;
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
}

export type asOptions = 
    | 'number'
    | 'boolean'
    | 'string' 
    | 'object'
    | 'regexp' 
    | 'urlpattern'
    | 'boolean|number'
;

export type SubPropPath = string;
export type EventName = string;

// export interface Specifier {
//     id?: string,
//     prop?: string,
//     path?: SubPropPath,
//     evtName?: EventName,
//     as?: asOptions,
//     constVal?: any;
//     enhKey?: string;
//     ish?: boolean;
//     host?: boolean;
// }

export interface IncParameters {
    prop?: string | null,
    byAmtS?: string,
    byAmtN?: number,
    targetElementId?: string,
    localEventType?: string,
}