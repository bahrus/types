import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export type ConsoleLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

export interface EndUserProps{
    level: ConsoleLevel;
    ignore: string[];
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions{
    hydrate(self: AP): PAP;
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
}
