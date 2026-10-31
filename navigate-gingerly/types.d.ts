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
export type RouteLike = Pick<AppRoute, 'pattern' | 'sources' | 'layout' | 'title'>;

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
}
