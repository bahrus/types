type tagName = string;

type Pattern = Record<string, any>;

type RegisteredItemScopeManagerName = string;


//Phase TBD
type itemScopeManagerName = `$:{RegisteredItemScopeManagerName}`;

interface HElement {
    tag: tagName;
    //a standards for assign from
    a: Pattern;
    c: HElement[];
}

type ElementSpecificationHeader = 
    | tagName
    | itemScopeManagerName // Phase TBD
    | {new(): HElement} 

type ElementSpecification = 
    | ElementSpecificationHeader
    | [ElementSpecificationHeader, Pattern]
    | [ElementSpecificationHeader, Pattern, ElementSpecification[]]
;