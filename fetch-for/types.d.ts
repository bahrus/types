import { StatementsResult } from "../nested-regex-groups/types";
import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface FetchForParam {
    remoteSpecifier: {
        prop?: string;
        [key: string]: any;
    };
}

export interface FetchReadyEvent {
    url: string;
    options?: RequestInit;
}

export interface EndUserProps {
    fetchForParams: StatementsResult<FetchForParam>;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    fetchReadyEvent: FetchReadyEvent;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AllProps>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): PAP;
    doFetch(self: AP): Promise<void>;
}
