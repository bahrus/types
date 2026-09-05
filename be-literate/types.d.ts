/**
 * Uniform Storage Path string (e.g. "indexedDB://myDB/myFiles/{file.name}").
 * Consumed by `fifteenth`'s `set`. Kept as a local alias so this file stays standalone.
 */
export type USL = string;

export interface EndUserProps {
    readVerb: 'readAsText' | 'readAsDataURL' | 'readAsArrayBuffer' | 'readAsBinaryString';
    writeTo: USL;
}

export type FileAndContents = [File, any];

export interface AllProps extends EndUserProps {
    enhancedElement: HTMLInputElement;
    fileContents: Array<FileAndContents>;
    writtenTo: Array<USL>;
    resolved?: boolean;
    rejected?: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface Actions {
    hydrate(self: AP): ProPAP;
    storeFileContents(self: AP): ProPAP;
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
}
