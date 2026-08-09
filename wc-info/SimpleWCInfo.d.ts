export interface SimpleWCInfo<TProps = any, TPublicMethods = any>{
    tagName: string;
    cssParts?: {[key: string]: string};
    props?: any;
    methods?: any;
    nonAttribProps?: (keyof TProps)[];
    cssProps?: {[key: string]: string};
    slots?: {[key: string]: string};
    events?: {[key: string]: string};
    name: string,
    description: string,
    homepage: string,
    license: string,

}