import { StatementsResult } from "../nested-regex-groups/types";
import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface RemoteSpecifier {
    id?: string;
    prop?: string;
    path?: string;
    evtName?: string;
    as?: 'number' | 'boolean' | 'string' | 'object' | 'regexp' | 'urlpattern' | 'boolean|number';
    constVal?: any;
    enhKey?: string;
    ish?: boolean;
    host?: boolean;
    self?: boolean;
}

export interface ObservingParameters {
    localPropToSet?: string;
    remoteSpecifiers: Array<RemoteSpecifier>;
    punt: boolean;
    aggKey: string;
    interpolatingExpr: string;
    JSExpr: string;
    ONExpr: string;
    action?:
        | 'set'
        | 'toggle'
        | 'increment'
        | 'decrement'
        | 'set-class'
        | 'set-part';
}

export interface EndUserProps {
    parsedStatements: StatementsResult<ObservingParameters>;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    enhKey: string;
    customHandlers: Map<string, any>;
    ws: Array<any>;
    didInferring: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    seek(self: AP): ProPAP;
}
