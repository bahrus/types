import {RAConfig} from '../roundabout/types.js';
import {FontFaceFeatureConfig} from '../font-face-feature/types.js';

export interface ElMakerConfig<AllProps = any, TActions = AllProps> {
    assignFeatures: {
        roundabout?: {
            spawn?: string,
            customData: {
                raConfig: RAConfig<AllProps, TActions, TActions>
            }
        },
        fontMgr?: {
            spawn?: string,
            customData: {
                fontFaceFeatureConfig: FontFaceFeatureConfig
            }
        },
        templateMaker?: {
            spawn?: string,
            customData?: any
        }
    }
} 