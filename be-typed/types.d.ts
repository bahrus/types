import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps {
    triggerInsertPosition: InsertPosition;
    labelTextContainer: string;
    buttonContent: string;
    nudge?: boolean;
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    byob?: boolean;
    trigger: WeakRef<HTMLButtonElement>
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions{
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    addTypeBtn(self: AP): ProPAP;
    setBtnContent(self: AP): void;
    openDialog(self: AP): Promise<void>
}

export interface ITyper{
    showDialog(): void;
    dispose(): void;
}
