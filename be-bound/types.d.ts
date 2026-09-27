import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
//import { Specifier } from "../trans-render/dss/types";
//import { AbsorbingObject, SharingObject} from '../trans-render/asmr/types';
import { StatementsResult } from "../nested-regex-groups/types";

export interface EndUserProps{
    /**
     * Parsed from the be-bound / 🪢 attribute.  Converted into `bindings`.
     */
    bindingRules: StatementsResult<BindingRule>;
    /**
     * The binding rules hydrate acts on.  Set this directly when attaching
     * the enhancement programmatically.  An empty array means a single,
     * fully inferred binding.
     */
    bindings: Array<Partial<BindingRule>>;
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    initialized?: boolean,
    isParsed?: boolean,
    rawStatements?: Array<string>
}

export type SignalEnhancement = 'be-value-added' | 'be-propagating' | undefined;

export interface BindingRule {
    
    localProp: string,
    localEvent?: string,
    remoteId?: string,
    remoteProp: string,
    remoteEvent?: string,
    //remoteSpecifier?: Specifier,


}

// export interface Binding {
//     //new and improved
//     localAbsObj: AbsorbingObject;
//     localShareObj: SharingObject;
//     remoteAbsObj: AbsorbingObject;
//     remoteShareObj: SharingObject;
//     //remoteRef: WeakRef<Element>;
// }

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export type Directions = 'rToL' | 'lToR' | 'tie';


export interface Actions{
    init(self: AllProps, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
    //noAttrs(self: AP): ProPAP;
    getBindings(self: AP): ProPAP;
    hydrate(self: AP): ProPAP;
    onBindingRulesChange(self: AP): PAP;
    onRawStatements(self: AP): void;
    reconcileValues(self: AP, rule: Partial<BindingRule>, direction: Directions): void;
}

export type WithStatement = string;

export type BetweenStatement = string;

export type TriggerSource = 'local' | 'remote' | 'tie';

export interface SpecificityResult {
    val?: any,
    winner?: TriggerSource;
}
