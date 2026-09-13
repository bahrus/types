import { ElementEnhancementGateway, SpawnContext } from "../assign-gingerly/types";

export interface EndUserProps {
    /**
     * Where to fetch the replacement content from — either a literal URL
     * (typically a `gist.githubusercontent.com/.../raw/.../<file>` URL) or a
     * `fifteenth` `gist://` USL (`gist://<owner>/<id>/raw[/<sha>]/<file>`,
     * or an alias/`=<id>` form once `configureGist()` has registered the
     * `gist` protocol).
     */
    url: string;
    /** The `<?marker name="…">` this template's content replaces. */
    markerName: string;
    /**
     * CSS selector naming the parent(s) of the marker(s), so the search
     * doesn't have to `TreeWalker` the whole subtree. Optional.
     */
    forHint: string | undefined;
    /**
     * Show a link to edit the gist on GitHub right after the template.
     * Also triggered page-wide by `?gist-in-show-edit-link=true` in the URL.
     */
    showEditLink: boolean;
    /**
     * Custom Sanitizer configuration (JSON object, e.g.
     * `{"elements":["option","optgroup"]}`), same shape as pipe-in's
     * `[base]-sanitizer`. The platform's *default* sanitizer strips elements
     * like `<option>` entirely — this is the escape hatch for patching them.
     * Gated the same way pipe-in gates it: only honored when `url` is a
     * same-origin path, an import-map-resolved bare specifier, or a
     * `gist://` USL (whose real destination is always the fixed
     * `gist.githubusercontent.com` host, not attacker-steerable).
     */
    sanitizer: object | undefined;
    /**
     * `'setHTML'` (default, sanitized) or `'setHTMLUnsafe'` (no sanitizing at
     * all) — named after, and selecting between, the two real underlying
     * methods, the same way pipe-in's `[base]-method` selects one of its own
     * `streamHTML`/`streamHTMLUnsafe`/etc. `'setHTMLUnsafe'` is gated the same
     * as a custom `sanitizer` (see above). Never runs embedded `<script>`s
     * either way — `setHTML`/`setHTMLUnsafe` parse, they don't execute
     * (verified; same as plain `innerHTML`).
     */
    method: 'setHTML' | 'setHTMLUnsafe';
}

export interface AllProps extends EndUserProps {
    enhancedElement: Element & ElementEnhancementGateway;
    resolved: boolean;
}

export type AP = AllProps;
export type PAP = Partial<AP>;
export type ProPAP = Promise<PAP>;

export interface Actions {
    init(self: AP, enhancedElement: Element, ctx: SpawnContext, initVals: PAP): Promise<void>;
    hydrate(self: AP): ProPAP;
}
