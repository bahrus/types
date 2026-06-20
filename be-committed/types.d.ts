export interface EndUserProps{
    to: string | undefined;
    nudge: boolean;
    on: string;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions{
    
    hydrate(self: AP): ProPAP;
    init(self: AP, enhancedElement: Element, initVals: PAP): Promise<void>
}