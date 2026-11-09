import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

/**
 * Uniform Storage Path string (e.g. "indexedDB://myDB/myStore/{file.name}").
 * Consumed by `fifteenth`'s `set`. Kept as a local alias so this file stays standalone.
 */
export type USL = string;

/** A run of text on a line, separated from its neighbors by a wide horizontal gap. */
export interface Cell {
    text: string;
    /** Left edge, in PDF points from the left of the page. */
    x: number;
    width: number;
}

/** One visual line of a page, with its text split into cells. */
export interface Line {
    /** 1-based page number. */
    page: number;
    /** Baseline, in PDF points from the bottom of the page. */
    y: number;
    /** The cells' text, joined with a tab character. */
    text: string;
    cells: Array<Cell>;
}

export interface ExtractOptions {
    /**
     * A horizontal gap wider than this many multiples of the font height starts a new cell.
     * Default 1.
     */
    cellGap?: number;
    /**
     * Text runs whose baselines differ by no more than this fraction of the font height
     * belong to the same line. Default 0.5.
     */
    lineTolerance?: number;
}

export interface Rule {
    /** RegExp source, matched against each line's `text`. Named groups become record fields. */
    pattern: string;
    /** Extra RegExp flags (e.g. "i"). The "g" flag is always applied. */
    flags?: string;
    /** Name of the collection (in `records`) that each match adds a record to. */
    emits?: string;
    /**
     * Each match's named groups become context, inherited by records emitted later.
     * `true`: only by records that overlap the match horizontally (the same column).
     * `'document'`: by every later record.
     */
    sets?: boolean | 'document';
}

export type Fields = {[key: string]: string};

export type Records = {[collection: string]: Array<Fields>};

export interface PdfResult {
    file: File;
    numPages: number;
    lines: Array<Line>;
    /** Present when `rules` are specified. */
    records?: Records;
}

export interface EndUserProps extends ExtractOptions {
    /** Ordered rules that turn lines into records. */
    rules?: Array<Rule>;
    /**
     * Where to write each file's result. `{file.name}` (and other `{file.*}` placeholders)
     * are substituted per file. Writes `records` when `rules` are specified, `lines` otherwise.
     */
    writeTo?: USL;
    /** Override the URL of the pdf.js worker module. */
    workerSrc?: string;
}

export interface AllProps extends EndUserProps {
    enhancedElement: HTMLInputElement & ElementEnhancementGateway;
    /** Lines extracted from each selected file, before rules are applied. */
    extracted?: Array<PdfResult>;
    /** Extracted lines plus records. */
    results?: Array<PdfResult>;
    writtenTo?: Array<USL>;
    initialized?: boolean;
    resolved?: boolean;
}

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element & ElementEnhancementGateway, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
    structure(self: AP): ProPAP;
    storeResults(self: AP): ProPAP;
}
