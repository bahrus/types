import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

export interface EndUserProps{
    /**
     * The rules hydrate acts on.  Set this directly when attaching the
     * enhancement programmatically:  a host property name, a single rule
     * (flat or as parsed), or an array of these.  An empty array means a
     * single rule with the property from the name attribute (else inferred).
     * Reassigning replaces the previous listeners.
     */
    toggles: Toggles;
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    /**
     * Parsed from the do-toggle / ⏻ attribute.  Converted into `toggles`.
     */
    parsedStatements: StatementsResult<TogglingParameters>;
    initialized?: boolean;
    resolved?: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP  = Promise<PAP>

export interface Actions{
    init(self: AllProps, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
    onParsedStatementsChange(self: AP): PAP;
    hydrate(self: AP): ProPAP;
    handleEvent(self: AP, e: Event, parsedStatement: TogglingParameters): void;
}

/**
 * The shape the attribute is parsed into.
 */
export interface TogglingParameters {
    /** Property to toggle on the host (closest itemscope / shadow host). */
    hostProp?: string | null;
    localEventType?: string;
    targetSpecifier?: {
        /** id of a peer element to toggle. */
        targetElementId?: string;
        /** Property to toggle on the peer.  Inferred if omitted. */
        targetProp?: string;
    };
}

/**
 * Programmatic-friendly flat form of TogglingParameters.
 */
export interface FlatTogglingParameters {
    /**
     * Property to toggle -- on the peer if targetElementId is given, else on
     * the host.  Defaults to the name attribute, else inferred.
     */
    prop?: string;
    /** id of a peer element to toggle, instead of the host. */
    targetElementId?: string;
    /** Event that triggers the toggle.  Defaults to the inferred event. */
    localEventType?: string;
}

export type Toggle = string | FlatTogglingParameters | TogglingParameters;

export type Toggles = Toggle | Array<Toggle>;
