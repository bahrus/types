export interface EndUserProps {
    eventName: string;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    hydrate(self: AP): PAP;
}