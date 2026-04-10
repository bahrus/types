import { IEnhancement, BEAllProps } from '../trans-render/be/types';

export interface EndUserProps extends IEnhancement{
    triggerInsertPosition: InsertPosition;
    cloneInsertPosition?: InsertPosition;
    buttonContent: string;
}

export interface AllProps extends EndUserProps{
    byob?: boolean,
    trigger?: WeakRef<HTMLButtonElement>
}


export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export type BAP = AP & BEAllProps;


export interface Actions{
    addCloneBtn(self: BAP): ProPAP;
    setBtnContent(self: BAP): void;
    beCloned(self: BAP): void;
}
