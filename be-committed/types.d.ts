import { SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps{
    /**
     * The button to click on Enter:  its id, or (programmatically) the
     * element itself, or a WeakRef to it.  An element is only ever held weakly.
     * If omitted, the first submit button of the closest form is clicked.
     */
    to: string | Element | WeakRef<Element> | undefined;
    /**
     * Decrement the enhanced element's disabled counter once the enhancement is ready.
     */
    nudge: boolean;
    on: string;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element;
    resolved: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions{
    
    hydrate(self: AP): ProPAP;
    nudgeEnhancedElement(self: AP): Promise<void>;
    weakenTo(self: AP): PAP | undefined;
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
}
