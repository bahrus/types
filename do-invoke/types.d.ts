import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

export interface Specifier {
    selector?: string;
    prop?: string;
}

export interface EndUserProps{
    /**
     * Parsed from the do-invoke / 🕹️ attribute.  Converted into `invocations`.
     */
    invokeParamSet: StatementsResult<InvokingParameters>,
    /**
     * The rules hydrate acts on.  Set this directly when attaching the
     * enhancement programmatically:  a method name, a single rule (flat or
     * nested), or an array of these.  An empty array means a single rule
     * with the method name from the name attribute.  Reassigning replaces the
     * previous listeners.
     */
    invocations: Invocations,
}

/**
 * Programmatic-friendly flat form of InvokingParameters.
 */
export interface FlatInvokingParameters {
    /** Method to call on the host (or on the peer, if targetElementId is given). */
    hostOrPeerMethodName?: string,
    /** id of a peer element whose method to call, instead of the host's. */
    targetElementId?: string,
    /** Event that triggers the call.  Defaults to the inferred event. */
    localEventType?: string,
}

export type Invocation = string | FlatInvokingParameters | InvokingParameters;

export type Invocations = Invocation | Array<Invocation>;

export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    initialized?: boolean;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP  = Promise<PAP>

export interface Actions{
    onInvokeParamSetChange(self: AP): PAP;
    hydrate(self: AP): ProPAP;
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>
}



export interface InvokingParameters {
    targetSpecifier: {
        hostOrPeerMethodName: string,
        targetElementId?: string,
    },
    //defaults to "click" if not specified (via the attribute); inferred otherwise
    localEventType?: string,
}