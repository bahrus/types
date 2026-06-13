import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

/**
 * Parsed specifier for referencing an element's value
 */
export interface ValueSpecifier {
    /** Element ID (without #) */
    id?: string;
    /** Property name to observe */
    prop?: string;
    /** Property path (chained accessor) */
    path?: string;
    /** Event name to listen for changes */
    evtName?: string;
    /** Attribute name (source of truth) */
    attr?: string;
    /** Constant value (backtick-delimited) */
    constVal?: string;
    /** Type casting */
    as?: 'number' | 'string' | 'boolean';
}

/**
 * A two-value comparison statement (lhs op rhs)
 */
export interface TwoValueSwitch {
    onOrOff: 'on' | 'off';
    lhsSpecifier: ValueSpecifier;
    rhsSpecifier: ValueSpecifier;
    op: 'eq' | 'equals' | 'lt' | 'gt' | 'lte' | 'gte';
    /** Required (AND) condition */
    req?: boolean;
}

/**
 * A single boolean value switch
 */
export interface SingleValSwitch {
    onOrOff: 'on' | 'off';
    specifier: ValueSpecifier;
    /** Required (AND / "only") condition */
    req?: boolean;
}

/**
 * An n-value JavaScript-evaluated switch
 */
export interface NValueSwitch {
    dependencies: ValueSpecifier[];
    registeredHandler?: string;
}

/**
 * Parsed result from the DSL attribute
 */
export interface ParsedStatements {
    twoValueSwitches?: TwoValueSwitch[];
    singleValSwitches?: SingleValSwitch[];
    nValueSwitches?: NValueSwitch[];
}

export interface EndUserProps {
    /** Type casting for comparisons */
    as?: 'number' | 'string' | 'boolean';
    /** Use view transitions */
    transitional?: boolean;
    /** Delete content when invalid instead of hiding */
    minMem?: boolean;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element & ElementEnhancementGateway;
    /** Raw parsed statements from the DSL */
    parsedStatements: StatementsResult<ParsedStatements>;
    /** The JS expression for CSP-safe evaluation */
    js?: string;
    /** Whether the JS expression has been processed */
    notProcessedJS: boolean;
    /** Hidden style rule */
    hiddenStyle: string;
    /** Whether to use boolish comparison */
    beBoolish: boolean;
    /** Simple lhs value (Part I JSON mode) */
    lhs: any;
    /** Simple rhs value (Part I JSON mode) */
    rhs: any;
    /** Computed final value (true = show content) */
    val: boolean;
    /** Echo of val for change detection */
    echoVal: boolean;
    /** Combined satisfaction of all switches */
    switchesSatisfied: boolean;
    /** Single val switches are satisfied */
    singleValSwitchesSatisfied: boolean;
    /** Single val switch veto */
    singleValSwitchNoGo: boolean;
    /** Two val switches are satisfied */
    twoValSwitchesSatisfied: boolean;
    /** Two val switch veto */
    twoValSwitchNoGo: boolean;
    /** ID ref attribute for tracking cloned content */
    idRefAttr: string;
    /** Toggle inert on hide */
    toggleInert?: boolean;
    /** EMC config reference */
    emc: any;
    resolved: boolean;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
    onTrue(self: AP): Promise<void>;
    onFalse(self: AP): Promise<void>;
    calcVal(self: AP): PAP;
    calcSwitchesSatisfied(self: AP): PAP;
    onSingleValSwitches(self: AP): Promise<void>;
    onTwoValSwitches(self: AP): Promise<void>;
    onNValSwitches(self: AP): Promise<void>;
    processJS(self: AP): ProPAP;
}
