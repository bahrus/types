import {RAConfig} from '../roundabout/types.js';

export interface ElMakerConfig<AllProps = any, TActions = AllProps> {
    assignFeatures: {
        roundabout: {
            spawn: string,
            customData: {
                raConfig: RAConfig<AllProps, TActions, TActions>
            }
        }
    }
} 