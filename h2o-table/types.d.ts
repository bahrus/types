import { FeatureSpawnContext } from "../assign-gingerly/types";

export { FeatureSpawnContext };

/**
 * Configuration for the `H2OTable` ("HTML → Object Table") feature, supplied via
 * the injection's `customData`.
 *
 * ```js
 * customElements.assignFeatures(MyElement, {
 *     h2oTable: { customData: { itemprops: ['key', 'value'] } }
 * });
 * ```
 */
export interface CustomData {
    /**
     * The `itemprop` names to read from each light-DOM `[itemscope]` row, in
     * order. Each one becomes a key on the matching {@link DataRecord}.
     */
    itemprops: string[];
}

/**
 * One extracted row: each configured `itemprop` name mapped to the value the
 * assign-gingerly inferencer reads for that element (`<data>`/`<input type=number>`
 * → number, `<time>` → date string, form controls → `value`, anything else →
 * `textContent`). Props whose element is missing from a given row are omitted.
 */
export type DataRecord = Record<string, any>;

/**
 * The members the feature exposes on `host.h2oTable`.
 */
export interface IH2OTable {
    /**
     * The host's light-DOM `[itemscope]` rows, projected onto plain objects
     * using the configured {@link CustomData.itemprops} and then passed through
     * {@link IH2OTable.massageData}. Re-scraped from the DOM on every read —
     * there is no caching, so it always reflects the current light DOM.
     */
    readonly data: DataRecord[];

    /**
     * The configured `itemprop` names, in order.
     */
    readonly itemprops: string[];

    /**
     * Post-process hook, called by {@link IH2OTable.data} with the freshly
     * scraped rows. The base class implements this as the identity function;
     * subclasses override it to add computed columns, filter, sort, etc.
     */
    massageData(data: DataRecord[]): DataRecord[];
}

/**
 * Public prop surface — alias kept for parity with the other el-maker feature
 * type modules (`TemplateMakerProps`, `TruthSourcerProps`, …).
 */
export interface H2OTableProps extends IH2OTable {}

/**
 * Full internal state of an `H2OTable` instance.
 */
export interface AllProps extends H2OTableProps {
    /** WeakRef back to the host custom element. */
    hostRef: WeakRef<HTMLElement> | null;
    /** Resolved copy of {@link CustomData.itemprops}. */
    itemprops: string[];
}

export type AP = AllProps;
export type PAP = Partial<AP>;
