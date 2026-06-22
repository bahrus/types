import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps{
    noNudge: boolean;
    options: DirectoryPickerOptions;
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    directoryHandle: FileSystemDirectoryHandle | undefined;
    resolved: boolean;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
export type ProPAP = Promise<PAP>;

export interface Actions{
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
}
