import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface RenderingHTMLScriptElement extends HTMLScriptElement{
    renderer: (vm: any, html: any) => any,
}

export interface EndUserProps{
    vm: any,
    with: Array<string>,
}

export type Renderer = (vm: any, html: any) => any;

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    renderer: Renderer,
    absorbingObject: any
}

export type PAP = Partial<AllProps>;

export type AP = AllProps;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    getRenderer(self: AP): PAP;
    doRender(self: AP): void;
    observe(self: AP): ProPAP;
    absorb(self: AP, e?: Event): ProPAP;
}