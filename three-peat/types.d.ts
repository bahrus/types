import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps{
    /**
     * Property of host to pull list from.
     * If not provided, the host itself is 
     * assumed to be iterable.
     */
    listProp?: string,
    
    each: any,
    target: string,
    updateOn
}