import {IIdRefs} from '../id-referencer/types.d.ts';

/**
 * Public API properties for the chip-away custom element
 */
export interface EndUserProps {
    /**
     * Space-separated list of IDs for the select elements to mirror as chips
     */
    for: string;
}

/**
 * Full property set including internal state managed by the custom element
 */
export interface AllProps extends EndUserProps {
    splitFor: string[];
}

export type AP = AllProps;



/**
 * Runtime type for the custom element instance, including the lazily-spawned
 * `idRefs` feature.
 */
export interface RunTimeProps extends AllProps, HTMLElement {
    idRefs: IIdRefs
}

export interface Actions {
    hydrate(self: AP): void;
    temp(self: AP): void;
}
