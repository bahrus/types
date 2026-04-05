
export interface EndUserProps{
    path: string
    src: string
}

export interface AllProps extends EndUserProps{
    template: HTMLTemplateElement
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export type BAP = AP & BEAllProps;

export interface Actions{
    act(self: BAP): PAP
    fetchRemoteTemplate(self: BAP): ProPAP
    upShadowSearch(self: BAP): PAP
    init(self: BAP, initVals: PAP): Promise<void>
}