export interface EndUserProps{}

export interface AllProps extends EndUserProps{
    enhancedElement: Element;
    parsedStatements: Array<IncParameters>,
    rawStatements: Array<string>,
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP  = Promise<PAP>

export interface Actions{
    hydrate(self: AP): ProPAP;
    
}

export type asOptions = 
    | 'number'
    | 'boolean'
    | 'string' 
    | 'object'
    | 'regexp' 
    | 'urlpattern'
    | 'boolean|number'
;

export type SubPropPath = string;
export type EventName = string;

export interface Specifier {
    id?: string,
    prop?: string,
    path?: SubPropPath,
    evtName?: EventName,
    as?: asOptions,
    constVal?: any;
    enhKey?: string;
    ish?: boolean;
    host?: boolean;
}

export interface IncParameters {
    targetSpecifier: Specifier,
    sourceSpecifier: Specifier,
    localEventType?: string,
}