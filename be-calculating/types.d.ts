import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { Infer } from "../inferencer/types";

export interface RemoteSpecifier {
    id?: string;
    evtName?: string;
    prop?: string;
}

export interface EndUserProps {
    /**
     * Name of a registered handler (e.g. '+', or one registered via 🧮.js),
     * or, when attaching programmatically, the handler function itself.
     */
    handler: string | ((e: Event) => void);
    eventArg: string;
    js: string;
    format: string;
    /**
     * Attribute presence (any string) or true turns on raw mode.
     */
    raw: boolean | string;
    /**
     * ID references to calculate from -- space-separated (from the for / 🧮-for
     * attribute), or an array when set programmatically.
     */
    forAttr: string | string[];
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    initialized?: boolean;
    enhKey: string;
    enhElLocalName: string;
    categorized: boolean;
    forArgs: string[];
    handlerObj: EventListenerOrEventListenerObject | Function | undefined;
    defaultEventType: string;
    remoteSpecifiers: RemoteSpecifier[];
    remSpecifierLen: number;
    isOutputEl: boolean;
    checkedRegistry: boolean;
    customHandlers: Map<string, any>;
    propToInfer: { [key: string]: Infer };
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
