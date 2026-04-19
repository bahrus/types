export interface Specifier {
    selector?: string;
    prop?: string;
}

export interface EndUserProps{
    invokeParamSets: Array<InvokingParameters>,
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP  = Promise<PAP>

export interface Actions{
    hydrate(self: AP): ProPAP;
    init(self: AP, enhancedElement: Element, initVals: PAP): Promise<void>
}

export interface InvokingParameters {
    targetSpecifier: {
        hostOrPeerMethodName: string,
        targetElementId?: string,
    },
    //defaults to "click" if not specified
    localEventType: string,
}