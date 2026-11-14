/**
 * Types for navigate-gingerly: apps whose browser paths mirror their APIs' paths, rendered by an o2h-edge-like
 * worker, route by route.
 *
 * The package doesn't depend on o2h: configs, options and transforms are opaque here (`Config`, `Options`), and
 * whatever turns a config into a storable transform is passed in (PrepareTransform).
 */

/** A module export the page loads: code a JSON app can't hold (a function pipe, a manager class). */
export interface ModuleReference {
    /** A module specifier: `./pipes.js` (relative to the app's URL), `/x.js`, a full URL, or a bare (import-mapped) name */
    import: string;
    /** The export's name; `default` when omitted */
    export?: string;
}

/**
 * One route of an app.
 *
 * - **Aligned** (no `sources`): the path is the API's path. `/products/3` fetches `<api>/products/3`, as the
 *   source named `data`.
 * - **Mapped** (`sources`): the route names its sources, with `{name}` filled in from the path's parameters.
 *
 * An aligned route may also let named query parameters through (`query`), so the page's URL keeps the API's
 * structure: `/timeseries/data/X?startyear=2015&endyear=2020` fetches `<api>/timeseries/data/X?startyear=2015&endyear=2020`.
 */
export interface AppRoute<Config = unknown> {
    /**
     * The path below the app's base: literal segments and `:name` parameters, e.g. `/products/:id`. A subset of
     * URLPattern's pathname syntax. A trailing slash doesn't matter. The first route that matches wins.
     */
    pattern: string;
    /** Mapped routes: sources by name. URLs relative to the app's `api`, or absolute, with `{name}` placeholders. */
    sources?: Record<string, string>;
    /** Whether the app's layout sources are fetched too (default true) */
    layout?: boolean;
    /**
     * Aligned routes: query parameters passed from the page's URL to the API's, by the same names. Only these
     * (others are dropped), the first value of each, and only when not empty (a GET form's blank field). They're in
     * the VM too, beside the path's parameters: `?.route?.startyear`.
     */
    query?: string[];
    /** How the route's VM (`{ route, ...sources }`) renders: a builtIns.tree config */
    config: Config;
    /** The page's title: literal text, or a path into the VM (`?.data?.title`) */
    title?: string;
}

/** An app, as authored: JSON, with ModuleReferences in `options` for code. */
export interface NavigateApp<Config = unknown, Options = unknown> {
    /** The API that aligned routes (and relative source URLs) are under, e.g. `https://fakestoreapi.com` */
    api?: string;
    /** Sources fetched for every route (unless it opts out), e.g. the categories a nav shows. No placeholders. */
    layout?: Record<string, string>;
    routes: AppRoute<Config>[];
    /** Options shared by every route's transform: pipes, managers, style … */
    options?: Options;
}

/** A route, installed: its config and the app's options are a transform, named by key. */
export interface InstalledRoute {
    pattern: string;
    sources?: Record<string, string>;
    layout?: boolean;
    query?: string[];
    title?: string;
    /** The key of its transform in InstalledApp.transforms (routes with the same config share one) */
    transform: string;
}

/** An app as a worker stores it: data only, keyed by a hash of its content. */
export interface InstalledApp<Transform = unknown> {
    api?: string;
    layout?: Record<string, string>;
    routes: InstalledRoute[];
    transforms: Record<string, Transform>;
}

/** What a PrepareTransform gives back (o2h's prepareO2HTransform fits). */
export interface PreparedTransform<Transform = unknown> {
    key: string;
    transform: Transform;
    /** What couldn't be stored (code, as stand-ins) */
    lost?: unknown[];
}

/** Turns a config and options into a storable transform: o2h's prepareO2HTransform, typically. */
export type PrepareTransform<Config = unknown, Options = unknown, Transform = unknown> =
    (config: Config, options: Options | undefined) => Promise<PreparedTransform<Transform>>;

/** An app ready to install: its key (`app-` and 32 hex digits), the app, and what its transforms lost. */
export interface PreparedApp<Transform = unknown> {
    key: string;
    app: InstalledApp<Transform>;
    /** By route index: what that route's transform lost */
    lost: Record<number, unknown[]>;
}

/** Any route, authored or installed: what matching needs. */
export type RouteLike = Pick<AppRoute, 'pattern' | 'sources' | 'layout' | 'query' | 'title'>;

/** An app, authored or installed: what matching and sources need. */
export interface AppLike<Route extends RouteLike = RouteLike> {
    api?: string;
    layout?: Record<string, string>;
    routes: Route[];
}

/** A path matched to a route. */
export interface RouteMatch<Route extends RouteLike = RouteLike> {
    route: Route;
    /** The route's index in the app */
    index: number;
    /** The path's parameters, decoded: `{ id: '3' }` for `/products/:id` */
    params: Record<string, string>;
    /** The path matched (below the app's base), as given */
    path: string;
    /** The route's query parameters (its `query` names) found in the path's query string, decoded */
    query: Record<string, string>;
}

/**
 * What mirror needs from a renderer (o2h's `o2hRenderer()` fits): preparing transforms, and, on the page, reading,
 * hydrating and (when the worker passed the VM back) rendering a route's fragment.
 */
export interface MirrorRenderer<Config = any, Options = any> {
    prepare: PrepareTransform<Config, Options>;
    /** The VM the worker embedded in the fragment */
    embedded(container: Element, config: Config): unknown;
    /** Hydrate the worker's fragment (finishing what it left pending) */
    hydrate(container: Element, config: Config, vm: unknown, options: Options | undefined): Promise<{ pending?: number } | void>;
    /** Render a VM on the page */
    render(container: Element, config: Config, vm: unknown, options: Options | undefined): Promise<unknown>;
}

/** What mirror is asked to do. */
export interface MirrorOptions<Config = any, Options = any> {
    /** The worker's base URL, e.g. `http://localhost:8787` (or a function, read on each navigation) */
    worker: string | (() => string);
    /** The app, as authored (module references allowed) */
    app: NavigateApp<Config, Options>;
    /** Where the app's JSON is, for resolving relative module references (default: the document's base URL) */
    appURL?: string | URL;
    /** Where each route's fragment goes */
    into: Element;
    renderer: MirrorRenderer<Config, Options>;
    /** The app's base path (default: the document's base URL's path, i.e. the shell's `<base href>`) */
    base?: string;
    /** Called after each navigation, rendered or failed */
    onRender?: (rendered: MirrorRendered) => void;
    /**
     * Animate in-app navigations with a view transition (where the browser has them): `true`, or a function of the
     * navigation returning `false` (no transition), `true`, or more transition types. Off by default. The first
     * render and `refresh()` aren't animated. The animation itself is the page's CSS (`view-transition-name`,
     * `:active-view-transition-type(back)`).
     */
    transition?: boolean | ((navigation: MirrorTransition) => boolean | string[]);
}

/** A navigation that may be animated. */
export interface MirrorTransition {
    /** The path rendered before (below the app's base) */
    from: string | undefined;
    /** The path being rendered */
    to: string;
    /** `back`: to an earlier history entry. `forward`: anything else (a link, Forward). Also the transition's first type. */
    direction: 'forward' | 'back';
}

/** How a navigation went. */
export interface MirrorRendered {
    /** The path below the app's base */
    path: string;
    /** `worker`: rendered there, hydrated here. `page`: the worker passed the VM back, and the page rendered it. `none`: it failed. */
    by: 'worker' | 'page' | 'none';
    /** The route's VM, when there is one */
    vm?: unknown;
    /** The route's index in the app, if one matched */
    route?: number;
    /** Milliseconds for the worker's response */
    elapsed: number;
    /** How many elements the worker left pending */
    pending: number;
    /** Why the worker passed the VM back, or why it failed */
    error?: string;
}

/** A running mirror. */
export interface Mirror {
    /** The first render (the current URL) */
    ready: Promise<MirrorRendered>;
    /** Render the current URL again (e.g. after the worker URL changes) */
    refresh(): Promise<MirrorRendered>;
    /** Stop intercepting navigations */
    stop(): void;
}
