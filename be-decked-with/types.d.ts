
export interface EndUserProps{
    /** id of a template, searched for up through the shadow DOM realms (be-decked-with attribute) */
    path: string
    /** import-map-resolvable url of a remote html file (be-decked-with-src attribute) */
    src: string
    /** the template itself, or a WeakRef to it -- programmatic attachment only */
    template: HTMLTemplateElement | WeakRef<HTMLTemplateElement>;
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    resolved: boolean;
    initialized: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

//export type BAP = AP & BEAllProps;

export interface Actions{
    act(self: AP): PAP
    fetchRemoteTemplate(self: AP): ProPAP
    upShadowSearch(self: AP): ProPAP
    init(self: AP, enhancedElement: Element, ctx: any, initVals: PAP): Promise<void>
}
