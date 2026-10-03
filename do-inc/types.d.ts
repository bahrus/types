import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

export interface EndUserProps{
    /**
     * Parsed from the do-inc / ➕ attribute.  Converted into `increments`.
     */
    parsedStatements: StatementsResult<IncParameters>,
    /**
     * The rules hydrate acts on.  Set this directly when attaching the
     * enhancement programmatically:  a property name, a single rule, or an
     * array of either.  An empty array means a single rule with everything
     * inferred.  Reassigning replaces the previous listeners.
     */
    increments: Increments,
}

export type Increments = string | IncParameters | Array<string | IncParameters>;

export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    initialized?: boolean;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP  = Promise<PAP>

export interface Actions{
    onParsedStatementsChange(self: AP): PAP;
    hydrate(self: AP & Actions): ProPAP;
    handleEvent(self: AP, event: Event, incParameters: IncParameters): void;
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
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

// export interface Specifier {
//     id?: string,
//     prop?: string,
//     path?: SubPropPath,
//     evtName?: EventName,
//     as?: asOptions,
//     constVal?: any;
//     enhKey?: string;
//     ish?: boolean;
//     host?: boolean;
// }

export interface IncParameters {
    /** Property to increment.  Defaults to the name attribute, else inferred. */
    prop?: string | null,
    /** Attribute syntax for the amount (e.g. "`12`"). */
    byAmtS?: string,
    /** The amount, as a number.  Takes precedence over byAmtS.  Defaults to 1. */
    byAmtN?: number,
    /** id of a peer element to increment, instead of the host. */
    targetElementId?: string,
    /**
     * A peer element to increment, instead of the host -- the element itself,
     * or a WeakRef to it.  Either way it is only ever held weakly:  an element
     * is replaced by a WeakRef as soon as the enhancement sees it.  If the
     * element is garbage collected, the increment becomes a no-op.  Takes
     * precedence over targetElementId.
     */
    targetElement?: Element | WeakRef<Element>,
    /** Event that triggers the increment.  Defaults to the inferred event. */
    localEventType?: string,
}