import { StatementsResult } from "../nested-regex-groups/types";
import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface RemoteSpecifier {
    id?: string;
    prop?: string;
    path?: string;
    evtName?: string;
    as?: 'number' | 'boolean' | 'string' | 'object' | 'regexp' | 'urlpattern' | 'boolean|number';
    constVal?: any;
    enhKey?: string;
    ish?: boolean;
    host?: boolean;
    self?: boolean;
}

export interface AggEvent {
    args: Array<any>;
    f: {[key: string]: any};
    target: Element;
    r: any;
}

export interface ObservingParameters {
    localPropToSet?: string;
    remoteSpecifiers: Array<RemoteSpecifier>;
    /**
     * Attribute syntax for the dependencies (#a and @b and ...).  Parsed into
     * remoteSpecifiers when those aren't provided.
     */
    dependencyPart?: string;
    /** The attribute parser yields the string 'true'. */
    punt: boolean | 'true';
    /**
     * Name of a registered aggregator ('&&', '+', ...), or, when attaching
     * programmatically, the aggregator function itself.
     */
    aggKey: string | ((e: AggEvent) => void);
    interpolatingExpr: string;
    JSExpr: string;
    /**
     * Attribute syntax: the inside of a JSON object ("hi": true, ":": false).
     * Programmatically, the object itself.
     */
    ONExpr: string | {[key: string]: any};
    action?:
        | 'set'
        | 'toggle'
        | 'increment'
        | 'decrement'
        | 'set-class'
        | 'set-part';
}

export interface EndUserProps {
    /**
     * Parsed from the be-observing / 🔭 attribute.  Converted into `observations`.
     */
    parsedStatements: StatementsResult<ObservingParameters>;
    /**
     * The observations seek acts on.  Set this directly when attaching the
     * enhancement programmatically.  An empty array means a single, fully
     * inferred observation.
     */
    observations: Array<Partial<ObservingParameters>>;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    initialized?: boolean;
    enhKey: string;
    customHandlers: Map<string, any>;
    ws: Array<any>;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    onParsedStatementsChange(self: AP): PAP;
    seek(self: AP): ProPAP;
}
