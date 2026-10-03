export interface EndUserProps{
    closeOnSelect: boolean;
    eventName: string;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    resolved?: boolean;
    initialized?: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions{
    init(self: AllProps, enhancedElement: Element, ctx: any, initVals: PAP): Promise<void>;
    hydrate(self: AP): PAP | void
}
