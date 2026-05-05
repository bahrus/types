import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

export interface Specifier {
    selector?: string;
    prop?: string;
}

export interface EndUserProps{
    invokeParamSet: StatementsResult<InvokingParameters>,
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP  = Promise<PAP>

export interface Actions{
    hydrate(self: AP): ProPAP;
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>
}



export interface InvokingParameters {
    targetSpecifier: {
        hostOrPeerMethodName: string,
        targetElementId?: string,
    },
    //defaults to "click" if not specified
    localEventType: string,
}