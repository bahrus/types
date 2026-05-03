import {RAConfig} from '../roundabout/types';
import {AttrPatterns} from '../assign-gingerly/types';

/**
 * Assign Gingerly Roundabout Config
 */
export interface AgraceConfig<TProps = unknown, TActions = TProps, ETProps = TProps, TCustomData = unknown> {
    raConfig: RAConfig<TProps, TActions, ETProps, TCustomData>,
    withAttrs?: AttrPatterns<TProps>,
    template?: string | HTMLTemplateElement,
}