import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

export interface DispatchRule {
    /** Name of the event to dispatch. */
    dispatch: string;
    /** Event on the enhanced element that triggers the dispatch.  Defaults to 'input'. */
    dispatchOn?: string;
    /** Attribute-only: comma-separated qualifiers, converted to the booleans below. */
    qualifiers?: string;
    bubbles?: boolean;
    composed?: boolean;
    cancelable?: boolean;
    replace?: boolean;
}

export interface EndUserProps {
    /**
     * Parsed from the be-dispatching / 📡 attribute.  Converted into `dispatchRules`.
     */
    crudeDispatchRules: StatementsResult<DispatchRule>;
    /**
     * The rules hydrate acts on.  Set this directly when attaching the
     * enhancement programmatically.
     */
    dispatchRules: Array<DispatchRule>;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    initialized?: boolean;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    finishParsing(self: AP): PAP;
    hydrate(self: AP): ProPAP;
}
