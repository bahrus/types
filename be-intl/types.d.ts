import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps {
    /**
     * Intl.NumberFormatOptions / Intl.DateTimeFormatOptions, parsed as JSON from
     * the base attribute (`be-intl='{ ... }'`). The semantic sub-attributes below
     * are folded into a copy of this object by `onFormattingChange`; explicit JSON
     * keys win over the semantic equivalents.
     */
    format?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;

    /** `be-intl-style` — e.g. "currency", "decimal", "percent". */
    style?: string;
    /** `be-intl-currency` — ISO 4217 code, e.g. "EUR". */
    currency?: string;
    /** `be-intl-weekday` — e.g. "long", "short", "narrow". */
    weekday?: string;
    /** `be-intl-year` — e.g. "numeric", "2-digit". */
    year?: string;
    /** `be-intl-month` — e.g. "long", "short", "numeric". */
    month?: string;
    /** `be-intl-day` — e.g. "numeric", "2-digit". */
    day?: string;

    /**
     * BCP-47 locale tag. When not supplied explicitly it is the element's
     * *effective* language (`inferencer.resolveLang`: nearest `lang`/`xml:lang`
     * ancestor, crossing shadow-root hosts, then `<html lang>`, then
     * `navigator.language`), falling back to the runtime default locale.
     */
    locale?: string;

    /**
     * When true, re-derive `locale` whenever the enhanced element's own `lang`
     * attribute changes. Off by default (the legacy `observeAttr` behavior).
     * Container-`lang` changes after mount are not observed.
     */
    observeLang?: boolean;
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element & ElementEnhancementGateway;

    /**
     * The raw value pulled off the enhanced element:
     * a number for `<data>` / `<output>`, a Date for `<time>`.
     */
    value?: number | Date | string;

    intlDateFormat?: Intl.DateTimeFormat;
    intlNumberFormat?: Intl.NumberFormat;

    resolved?: boolean;

    /** Flipped true once `roundabout()` has finished its initial attribute-read pass. */
    initialized?: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
    onFormattingChange(self: AP): PAP;
    formatNumber(self: AP): void;
    formatDate(self: AP): void;
}
