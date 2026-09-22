import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

/**
 * The programmatic shape of `store`: a bare USL string (shorthand for
 * `{usl}`, i.e. `localProp`/`localEvent` take their defaults), a single
 * {@link PersistenceRule}, or an array of them (one binder per entry).
 * This is the property JS callers set directly — e.g.
 * `persistenceEnhancement.store = 'sessionStorage://{autoGenId}'` — without
 * ever going through attribute parsing.
 */
export type PersistenceRuleConfig = string | PersistenceRule | PersistenceRule[];

export interface EndUserProps {
    /**
     * What to persist and where. Accepts a USL string, a single
     * {@link PersistenceRule}, or an array of rules — see
     * {@link PersistenceRuleConfig}. This is the property `hydrate` reads and
     * the one programmatic (attribute-free) callers should assign.
     */
    store?: PersistenceRuleConfig;
    /**
     * Opt-in flag set by the boolean `be-persistent-nudge` / `💾-nudge`
     * attribute.  When present, `hydrate` waits for every rule to finish its
     * initial storage reconciliation and then calls `assign-gingerly`'s
     * `nudge` on the enhanced element — decrementing its `disabled` counter so
     * an element that was disabled only to block edits before its persisted
     * value loaded becomes interactive.
     */
    nudge?: boolean;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element & ElementEnhancementGateway;
    resolved?: boolean;
    /**
     * Flipped to `true` at the end of `init`, once `roundabout` has finished
     * assigning every attribute-derived prop.  `hydrate` is gated on it so it
     * never runs against a half-populated view model.
     */
    initialized?: boolean;
    /**
     * Raw parse result of the base attribute (`be-persistent` / `💾`), via the
     * `parse-grouped-capture-statements` built-in parser. Exists **only** to be
     * transferred into `store` by `onPersistenceRulesChange` — nothing else
     * reads it. Programmatic callers should assign `store` directly instead of
     * this property.
     */
    persistenceRules?: StatementsResult<PersistenceRule>;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    /**
     * Compact-invoked (`when_persistenceRules_changes_call_onPersistenceRulesChange`),
     * not an action — normalizes `persistenceRules.statements` into `store`.
     */
    onPersistenceRulesChange(self: AP): PAP;
    hydrate(self: AP): ProPAP;
}

export interface PersistenceRule {
    /** Element property to read/write (e.g. `value`, `checked`, `innerHTML`). Defaults to `value`. */
    localProp?: string;
    /** DOM event that triggers a save. Defaults to `input`. */
    localEvent?: string;
    /**
     * Uniform Storage Locator describing where the value lives, e.g.
     * `sessionStorage://{autoGenId}`, `indexedDB://myDB/myStore/{autoGenId}`,
     * `cookie://{autoGenId}`, `locationHash://{autoGenId}`.
     * `{autoGenId}` is expanded at runtime to a location-independent DOM path.
     * Defaults to `sessionStorage://{autoGenId}`.
     */
    usl?: string;
}
