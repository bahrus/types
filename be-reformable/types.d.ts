import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface SubmitOptions {
    onlyAfter: string,
    nudges: boolean,
    disableIfNotAllConditionsAreMet: boolean
}

export interface EndUserProps{
    /**
     * The id of a link element whose href is the base URL -- or (programmatically)
     * the link element itself, or a WeakRef to it.  An element is only ever held weakly.
     */
    baseLink: string | Element | WeakRef<Element>,
    baseURL: string,
    path: string,
    headers: HeadersInit | undefined,
    updateOn: 'input' | 'change' | 'submit',
    submitOptions: SubmitOptions,
    /**
     * Selectors ("#myHeader", "%part-name") of inputs whose values become headers --
     * or (programmatically) the input elements themselves, or WeakRefs to them.
     * Elements are only ever held weakly.
     */
    headerFields: Array<string | Element | WeakRef<Element>>
}

type BeforeToken = string;
type TokenKey = string | undefined

export interface IURLBuilder{
    readonly tokens: Array<[BeforeToken, TokenKey]>
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    updateCnt: number,
    readonly urlBuilder: IURLBuilder,
    readonly resolvedBaseURL: true,
    readonly fetchOptions: RequestInit,
    readonly isFetchReady: boolean,
    initialized?: boolean,
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    resolveBaseLink(self: AP): PAP;
    weakenHeaderFields(self: AP): PAP | undefined;
    specifyDefaultBaseURL(self: AP): PAP;
    hydrate(self: AP): ProPAP;
    updateAction(self: AP): ProPAP;
    parsePath(self: AP): ProPAP;
    suggestFetch(self: AP): ProPAP;
}
