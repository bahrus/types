import { StatementsResult } from "../nested-regex-groups/types";
import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface RemoteSpecifier {
    id?: string;
    prop?: string;
    path?: string;
    evtName?: string;
    as?: 'number' | 'boolean' | 'string' | 'object';
}

export interface DataPropsParameters {
    remoteSpecifiers: Array<RemoteSpecifier>;
}

export interface EndUserProps {
    parsedStatements: StatementsResult<DataPropsParameters>;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
}
