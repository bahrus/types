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

/** What `applyRules` produces:  one array of records per `emits` collection. */
export type Records = {[collection: string]: Array<Fields>};

export interface PdfResult {
    file: File;
    numPages: number;
    lines: Array<Line>;
    /**
     * Whatever `rules`, then the `handler`, then `load` listeners produced.
     * With rules alone, a `Records` object.  A handler can return any shape.
     */
    records?: any;
}

/** A string (matched literally) or a RegExp. */
export type TextPattern = string | RegExp;

export interface Match {
    line: Line;
    match: RegExpMatchArray;
    /** Approximate horizontal extent of the match, in PDF points. */
    x0: number;
    x1: number;
}

export interface TableOptions {
    /**
     * Matched against each line's `text` (may match several times per line, one table each),
     * or the header cells' texts in order. Named groups end up in `Table.header`.
     */
    header: RegExp | Array<string | RegExp>;
    /** The table ends before the first line (restricted to the table's range) matching this. */
    until?: TextPattern;
    /** Names for the columns, in header-cell order. Defaults to the header cells' text. */
    columns?: Array<string>;
}

export interface TableColumn {
    name: string;
    x0: number;
    x1: number;
}

export interface Table {
    page: number;
    /** Baseline of the header line. */
    y: number;
    /** Named groups of the header match. */
    header: Fields;
    columns: Array<TableColumn>;
    /** Horizontal range claimed by this table (±Infinity at the page edges). */
    x0: number;
    x1: number;
    /** One object per line below the header, keyed by column name. */
    rows: Array<Fields>;
    /** `lines[i]` is the line `rows[i]` came from, restricted to this table's cells. */
    lines: Array<Line>;
}

export interface ColumnsOptions {
    /** Dividing x position(s), in PDF points. Detected (assuming two columns) if omitted. */
    gutter?: number | Array<number>;
}

export interface ValueAfterOptions {
    /** Take the value from the cell under the label, on the next line. */
    below?: boolean;
}

export interface Helpers {
    tables(lines: Array<Line>, options: TableOptions): Array<Table>;
    columnsOf(lines: Array<Line>, options?: ColumnsOptions): Array<Array<Line>>;
    valueAfter(lines: Array<Line>, label: TextPattern, options?: ValueAfterOptions): string | undefined;
    between(lines: Array<Line>, start: TextPattern | undefined, end?: TextPattern): Array<Line>;
    after(lines: Array<Line>, start: TextPattern): Array<Line>;
    matches(lines: Array<Line>, pattern: TextPattern): Array<Match>;
    applyRules(lines: Array<Line>, rules: Array<Rule>): Records;
    num(s: string | undefined | null): number | undefined;
    /** Lines (or columns of lines) as plain text for a prompt. */
    linesToText(lines: Array<Line> | Array<Array<Line>>, options?: {separator?: string}): string;
    /** 'unavailable' | 'downloadable' | 'downloading' | 'available' */
    aiAvailability(options?: {model?: any}): Promise<string>;
    /** Asks the browser's built-in model for JSON matching `options.schema`. */
    promptForRecords(input: string | Array<Line> | Array<Array<Line>>, options: PromptForRecordsOptions): Promise<any>;
    createSession(options?: CreateSessionOptions): Promise<any>;
}

export interface CreateSessionOptions {
    /** A `LanguageModel`-compatible object. Defaults to `globalThis.LanguageModel`. */
    model?: any;
    systemPrompt?: string;
    signal?: AbortSignal;
    /** 0 to 1, while the model downloads. */
    onDownloadProgress?: (fraction: number) => void;
    /**
     * Whether the (multi-GB) model download may be started, if it's not on the device yet.
     * Default true for `createSession`, false for `promptForRecords`.
     */
    allowDownload?: boolean;
}

export interface PromptForRecordsOptions extends Omit<CreateSessionOptions, 'systemPrompt'> {
    /** JSON Schema the response must match (passed as `responseConstraint`). */
    schema: object;
    /** System prompt:  what to extract, and how. */
    instructions?: string;
}

export interface HandlerArgs {
    file: File;
    numPages: number;
    lines: Array<Line>;
    /** The rules' output, if `rules` are specified. */
    records: Records | undefined;
    helpers: Helpers;
}

/**
 * Called once per file, after rules. The return value (unless undefined) becomes the
 * file's `records`.
 */
export type Handler = (args: HandlerArgs) => any;

export interface EndUserProps extends ExtractOptions {
    /** Ordered rules that turn lines into records. */
    rules?: Array<Rule>;
    /** Custom logic that turns lines into records (programmatic only). */
    handler?: Handler;
    /**
     * Where to write each file's result. `{file.name}` (and other `{file.*}` placeholders)
     * are substituted per file. Writes `records` when there are any, `lines` otherwise.
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
