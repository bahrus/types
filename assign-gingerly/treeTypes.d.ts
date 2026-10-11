type tagName = string;

type RegisteredItemScopeManagerName = string;

type itemScopeManagerName = `$:{RegisteredItemScopeManagerName}`;

type Attrs = Record<string, string>;

interface HElement {
    tag: tagName;
    a: Attrs;
    c: HElement[];
}

type ElementSpecificationHeader = 
    | tagName
    | itemScopeManagerName // Phase TBD
    | {new(): HElement} 

type ElementSpecification = 
    | ElementSpecificationHeader
    | [ElementSpecificationHeader, Attrs]
    | [ElementSpecificationHeader, Attrs, ElementSpecification[]]
;