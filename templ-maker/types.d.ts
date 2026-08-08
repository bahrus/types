/**
 * Context passed to the TemplateMaker feature constructor
 */
export interface FeatureSpawnContext {
    key: string;
    optIn: any;
    injection: any;
    featuresRegistry: any;
    shared?: any;
}

/**
 * Tracks whether the seed DOM fragment came from a shadow root or light DOM children.
 */
export type TemplateSource = 'shadow' | 'light';

/**
 * Properties that the TemplateMaker feature exposes.
 */
export interface TemplateMakerProps {
    /**
     * The cloned DocumentFragment from the stored template.
     */
    clone: DocumentFragment | null;
}

/**
 * Internal state
 */
export interface AllProps extends TemplateMakerProps {
    /**
     * WeakRef to the host custom element
     */
    hostRef: WeakRef<Element> | null;

    /**
     * Whether the template source was shadow DOM or light DOM.
     */
    templateSource: TemplateSource | null;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
