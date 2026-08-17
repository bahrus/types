import {RAConfig} from '../roundabout/types.js';
import {FontFaceFeatureConfig} from '../font-face-feature/types.js';
import {CustomData as TSCD} from '../truth-sourcer/types.js';
import {CustomData as FUCD} from '../face-up/types.js';
import {AttrPatterns} from '../assign-gingerly/types.js';

export interface ElMakerConfig<AllProps = any, TActions = AllProps> {
    assignFeatures: {
        roundabout?: {
            spawn?: string,
            customData: {
                raConfig: RAConfig<AllProps, TActions, TActions>
            }
            withAttrs: AttrPatterns<AllProps>
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
        },
        faceUp?: {
            spawn?: string,
            customData?: FUCD
        },
        truthSourcer?: {
            spawn?: string,
            customData?: TSCD
        }
    }
} 