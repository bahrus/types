import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export type StreamMethod =
    | 'streamHTML'
    | 'streamReplaceWithHTML'
    | 'streamBeforeHTML'
    | 'streamPrependHTML'
    | 'streamAppendHTML'
    | 'streamAfterHTML'
    | 'streamHTMLUnsafe'
    | 'streamReplaceWithHTMLUnsafe'
    | 'streamBeforeHTMLUnsafe'
    | 'streamPrependHTMLUnsafe'
    | 'streamAppendHTMLUnsafe'
    | 'streamAfterHTMLUnsafe';

export interface EndUserProps {
    /** URL to fetch HTML content from */
    url: string;
    /** Streaming method to use for inserting content */
    method: StreamMethod;
    /** Sanitizer configuration (JSON object for Sanitizer API) */
    sanitizer: object | undefined;
    /** Whether to run scripts in the streamed content (requires bare specifier URL) */
    runScripts: boolean;
    /** Shadow root mode for declarative shadow DOM */
    shadowrootmode: 'open' | 'closed' | undefined;
    /** Base URL for resolving relative URLs in streamed content (used with shadowrootmode) */
    baseUrl: string | undefined;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element & ElementEnhancementGateway;
    resolved: boolean;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
}
