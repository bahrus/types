import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface SubmitOptions {
    onlyAfter: string,
    nudges: boolean,
    disableIfNotAllConditionsAreMet: boolean
}

export interface EndUserProps{
    baseLink: string,
    baseURL: string,
    path: string,
    headers: HeadersInit | undefined,
    updateOn: 'input' | 'change' | 'submit',
    submitOptions: SubmitOptions,
    headerFields: Array<string>
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
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    resolveBaseLink(self: AP): PAP;
    specifyDefaultBaseURL(self: AP): PAP;
    hydrate(self: AP): ProPAP;
    updateAction(self: AP): ProPAP;
    parsePath(self: AP): ProPAP;
    suggestFetch(self: AP): ProPAP;
}
