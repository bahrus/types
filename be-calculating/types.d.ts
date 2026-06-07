import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface RemoteSpecifier {
    id?: string;
    evtName?: string;
    prop?: string;
}

export interface AbsorbingObject {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions): void;
    getValue(): Promise<any>;
}

export interface EndUserProps {
    handler: string;
    eventArg: string;
    js: string;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    enhKey: string;
    enhElLocalName: string;
    categorized: boolean;
    forAttr: string;
    forArgs: string[];
    handlerObj: EventListenerOrEventListenerObject | Function | undefined;
    defaultEventType: string;
    remoteSpecifiers: RemoteSpecifier[];
    remSpecifierLen: number;
    isOutputEl: boolean;
    checkedRegistry: boolean;
    customHandlers: Map<string, any>;
    propToAO: { [key: string]: AbsorbingObject };
    notYetParsedJS: boolean;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    categorizeEl(self: AP): PAP;
    getDefltEvtType(self: AP): PAP;
    parseForAttr(self: AP): PAP;
    parseForAttrDSS(self: AP): Promise<PAP>;
    genRemoteSpecifiers(self: AP): PAP;
    getEvtHandler(self: AP): PAP;
    seek(self: AP): Promise<PAP>;
    hydrate(self: AP): Promise<PAP>;
    parseJS(self: AP): Promise<PAP>;
}
