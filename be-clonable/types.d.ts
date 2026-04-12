export interface EndUserProps{
    triggerInsertPosition: InsertPosition;
    cloneInsertPosition: InsertPosition;
    buttonContent: string;
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    byob?: boolean;
    trigger: HTMLButtonElement;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface CustomData {
    triggerSettings: {
        type: string;
        '?.classList?.add': string;
        ariaLabel: string;
        title: string;
    },
    withMethods: string[]
    
}

export interface Actions{
    addCloneBtn(self: AP): ProPAP;
    setBtnContent(self: AP): void;
    beCloned(self: AP): void;
    init(self: AP, enhancedElement: Element, initVals: PAP): Promise<void>
}
