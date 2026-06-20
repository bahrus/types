export interface EndUserProps{
    triggerInsertPosition: InsertPosition;
    buttonContent: string;
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    byob?: boolean,
    trigger: HTMLButtonElement;
    resolved: boolean,
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface Actions{
    
    addDeleteBtn(self: AP): ProPAP ;
    setBtnContent(self: AP): void;
    beDeleted(self: AP): void;
    init(self: AP & Actions, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
}