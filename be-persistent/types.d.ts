import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";
import { StatementsResult } from "../nested-regex-groups/types";

export interface EndUserProps {
    /**
     * One persistence rule per statement in the attribute value.
     * Parsed from the base attribute (`be-persistent` / `💾`) by the
     * `parse-grouped-capture-statements` built-in parser.
     */
    persistenceRules: StatementsResult<PersistenceRule>;
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
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
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
