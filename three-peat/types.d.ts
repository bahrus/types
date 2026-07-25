import { ElementEnhancementGateway, SpawnContext, FromEachItemConfig } from "../assign-gingerly/types";

export interface EndUserProps{
    /**
     * Property of host to pull list from.
     * If not provided, the host itself is 
     * assumed to be iterable.
     */
    listProp?: string,
    
    /**
     * Specify id of peer element to pull list from.
     */
    src?: string;
    each: FromEachItemConfig,
    target: string,
    updateOn: string,
}