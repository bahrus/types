import { ElementEnhancementGateway, SpawnContext, IAssignGingerlyOptions } from "../assign-gingerly/types";

export interface MergeParameters {
    assign: Record<string, any>;
    on?: string;
    options?: IAssignGingerlyOptions;
}

export interface EndUserProps {
    mergeParamSets: MergeParameters | MergeParameters[];
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element & ElementEnhancementGateway;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
}
