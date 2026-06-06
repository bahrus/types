import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
//import { Specifier } from "../trans-render/dss/types";
//import { AbsorbingObject, SharingObject} from '../trans-render/asmr/types';
import { StatementsResult } from "../nested-regex-groups/types";

export interface EndUserProps{
    bindingRules: StatementsResult<BindingRule>;
}

export interface AllProps extends EndUserProps{
    enhancedElement: Element & ElementEnhancementGateway;
    //bindings: Array<Binding>,
    isParsed?: boolean,
    rawStatements?: Array<string>
}

export type SignalEnhancement = 'be-value-added' | 'be-propagating' | undefined;

export interface BindingRule {
    
    localProp?: string,
    localEvent?: string,
    remoteId?: string,
    remoteProp?: string,
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


export interface Actions{
    init(self: AllProps, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
    //noAttrs(self: AP): ProPAP;
    getBindings(self: AP): ProPAP;
    hydrate(self: AP): ProPAP;
    onRawStatements(self: AP): void;
    reconcileValues(self: AP, rule: BindingRule, direction: 'rToL' | 'lToR'): void;
}

export type WithStatement = string;

export type BetweenStatement = string;

export type TriggerSource = 'local' | 'remote' | 'tie';

export interface SpecificityResult {
    val?: any,
    winner?: TriggerSource;
}
