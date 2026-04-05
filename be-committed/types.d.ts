export interface EndUserProps{
    to: string;
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

export type BAP = AllProps // & BEAllProps & RoundaboutReady;

export interface Actions{
    
    hydrate(self: BAP): ProPAP;
    init(self: BAP, initVals: PAP): Promise<void>
    // findTarget(self: this): Promise<void>;
    // handleCommit(self: this, e: KeyboardEvent): Promise<void>;
}