


## Reference Implementations

- **[scratch-box](https://github.com/bahrus/scratch-box)** — A visual, form-associated custom element with a declarative shadow DOM template and zero custom element JavaScript. Demonstrates `cede` script definition from a static `root.html` and JSON feature configuration.

- **[plus-minus](https://github.com/bahrus/plus-minus)** -- Expand / Collapse component - More robust examples of dynamic DOM manipulation with the help of roundabout configuration.  Also demonstrates use of the DX libraries to get typing intellisense help.

## Step 4

Add the following additional dependencies in package.json:

```json
{
...
  "dependencies": {
    ...
    "be-hive": "0.1.16",
    "imp-h": "0.0.5",
    "mount-observer": "0.1.50"
  }
}
```

## Step 5

Add the additional mappings to import.html

```json
    "be-hive/": "/node_modules/be-hive/",
    "imp-h/": "/node_modules/imp-h/",
    "mount-observer/": "/node_modules/mount-observer/",
```

## Step 6

Create an html file that provides the shadowDOM content.

It can contain other stuff outside the start / end markers. 

<details>
    <summary>For example:</summary>

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>plus-minus</title>
</head>
<body>
    <plus-minus>
        <template shadowrootmode="open"><?start><?start>
            <style adopt>
                div, section {
                    display: inline;
                }
                button {
                    background-color: transparent;
                    background-repeat: no-repeat;
                    border: none;
                    cursor: pointer;
                    overflow: hidden;
                    outline: none;
                    margin: 0;
                    padding: 0;
                    position: relative;
                    top: 2px;
                }
                :host{
                    margin: 0;
                    padding: 0;
                    display: inline;
                }
            </style>
            <section>
                <button disabled type=button name=expand part="collapsed expand button" aria-label="Show Details">
                    <svg width="16px" height="16px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-plus-square">
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                </button>
                <button disabled type=button name=collapse part="expanded collapse button" aria-label="Hide Details" hidden>
                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
                        <g>
                            <line fill="none" stroke="#000000" stroke-width="4" stroke-miterlimit="10" x1="14" y1="31" x2="50" y2="31"/>
                        </g>
                        <rect x="1" y="1" fill="none" stroke="#000000" stroke-width="6" stroke-miterlimit="10" width="62" height="62"/>
                    </svg>
                </button>
            </section>
        <?end><?end></template>
    </plus-minus>
</body>
</html>
```

</details>

If using element enhancement / custom attribute libraries, include the be-hive folder:

<details>
    <summary>For example:</summary>

```html
<html>
<head>
    <title>scratch-box</title>
    <link rel=stylesheet href="https://fonts.googleapis.com/css?family=Indie+Flower">
</head>
<body>
    <scratch-box>
        <template shadowrootmode=open><?start><?start>
            <style adopt>
                :host[hidden]{
                    display:none;
                }
                :host{
                    display:block;
                    background-color: HSL(250, 22%, 41%);
                    padding: 1vw;
                }
                :has(input[disabled]){
                    opacity: 0.5;
                }
                .checkbox-wrapper {
                    position: relative;

                    margin: .5em 1em;
                    font-size: 3em;
                    color: #eee;
                    font-family: Indie Flower;
                }

                svg { 
                    width: 1em;
                    height: 1em;
                    position: absolute;
                    left: 0.5em; 
                    top: .3em;
                    border: 2px solid #eee;
                }

                label {
                    display: block;
                    padding: .25em .5em .25em 2em;
                    position: relative;
                    cursor: pointer;
                }

                input[type="checkbox"] {
                    opacity: 0;
                    position: absolute;
                    left: .75em;
                    top: .75em;
                }

                label svg path {
                    transition: stroke-dashoffset .4s linear;
                }

                input[type="checkbox"]:checked ~ label svg {
                    border-color: #111;
                }

                input[type="checkbox"]:checked ~ label svg path {
                    stroke-dashoffset: 0;
                    stroke: currentColor;
                }

                input[type="checkbox"] ~ label svg path {
                    stroke: #eee;
                }

                input[type="checkbox"]:checked ~ label {
                    color: #111;
                    text-decoration: line-through;
                }

                input[type="checkbox"]:focus ~ label {
                    outline: 2px solid black;
                }
            </style>
            <form class="checkbox-wrapper">
                <!--  length of the path is 270px -->
                <input 🪢 name=value type="checkbox" id="option"/>
                <link itemprop=value>
                <label for="option">
                    <slot name="labelTxt">scratch-box</slot>
                    <svg viewBox="0 0 60 40" aria-hidden="true" focusable="false"><path d="M21,2 C13.4580219,4.16027394 1.62349378,18.3117469 3,19 C9.03653312,22.0182666 25.2482171,10.3758914 30,8 C32.9363621,6.53181896 41.321398,1.67860195 39,4 C36.1186011,6.8813989 3.11316157,27.1131616 5,29 C10.3223659,34.3223659 30.6434647,19.7426141 35,18 C41.2281047,15.5087581 46.3445303,13.6554697 46,14 C42.8258073,17.1741927 36.9154967,19.650702 33,22 C30.3136243,23.6118254 17,31.162498 17,34 C17,40.4724865 54,12.4064021 54,17 C54,23.7416728 34,27.2286213 34,37" stroke-width="4" fill="none" stroke-dasharray="270" stroke-dashoffset="270" ></path></svg>
                </label>
            </form>
            
            <be-hive>
                <script type=emc-parser 
                        src="be-hive/parsers/parse-grouped-capture-statements.js" 
                        parser-name=parse-grouped-capture-statements></script>
                <script type=emc 
                        src="be-bound/🪢.json" 
                        wait-for-parsers=parse-grouped-capture-statements></script>
            </be-hive>
        <?end><?end></template>
    </scratch-box>
</body>
</html>

```

Key details:

- `shadowrootmode=open` gives the element a declarative shadow DOM that the browser attaches before any script runs.
- The internal checkbox is named `value` and carries the `🪢` emoji attribute. That marks it for the `be-bound` enhancement so the host `value` property and the inner checkbox `checked` state stay in sync.
- `<link itemprop=value>` lets the `faceUp` feature expose the element as a form-associated value without any JS wiring.
- The `<slot name="labelTxt">` lets users provide the label from light DOM via `<span slot="labelTxt">...</span>`.
- `<style adopt>` with `adopt` ensures the styles are adopted into the shadow root instead of a separate `<style>` element.

</details>

So what have in this file, within the <?start> and <?end> markers should be all HTML, css, and the only script tags should be one of the types supported by mount-observer -- emc-parser, emc, mountobserver, cede.

Ideally, this standalone html file can serve as a primitive demo of the web component itself, and it's quite acceptable to add a little script or other things outside the <?start> and <?end> markers to make the demo page more functional.

## Step 7.

Create el-maker.mjs, which generates the el-maker.json file.

<details>
    <summary>For example</summary>

```JS
//@ts-check

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import {akaMethods as m, aka, builtInEmoji} from 'assign-gingerly/DX/emojis.js';
import {paths, doAssign, set, smoothOver} from 'assign-gingerly/DX/paths.js';

/** @import {EndUserProps, AP, RuntimeProps} from './types'; */
/** @import {RoundaboutOptions} from './types/roundabout/types' */
/** @import {ElMakerConfig} from './types/el-maker/types' */

const withMethods = [m['🔍']];

const $ = (/** @type {typeof paths<RuntimeProps>} */ (/** @type {any} */(paths)))({withMethods});


/**
 * @type {RoundaboutOptions<AP>}
 */
const raConfig = {
    weakRef: {
        properties: ['expandButton', 'collapseButton'],
        logIfCollected: 'warn'
    },
    assignOptions: {
        akaMethods:{
            '🔍': m['🔍']
        },
    },
    compacts: {
        on_click_of_expandButton_assign: {
            [$.expandButton.hidden.Path]: true,
            [$.collapseButton.hidden.Path]: false,
            expanded: true,
            
        },
        on_click_of_collapseButton_assign: {
            expanded: false,
            [$.expandButton.hidden.Path]: false,
            [$.collapseButton.hidden.Path]: true,
        } 
    },
    merges: smoothOver([
        {
            ifKeyIn: ['clone'],
            ...doAssign(
                set($.expandButton).to($.clone.querySelector('[name=expand]')),
                set($.collapseButton).to($.clone.querySelector('[name=collapse]')),
            )
        },
        {
            ifKeyIn: ['expanded'],
            ...doAssign(
                set($.ariaExpanded).to($.expanded),
                set($.ariaControlsElements.Each.hidden.QMEq).to([$.expanded, false, 'until-found'])
            )
        },
        {
            ifKeyIn: ['disabled'],
            ifAllOf: ['clone'],
            ...doAssign(
                set($.expandButton.disabled).to($.disabled),
                set($.collapseButton.disabled).to($.disabled),
            )
        },

    ]),
    defaultPropVals: {
        disabled: false
    }
}

// withAttrs configuration for parsing element attributes
const withAttrs = {
    base: 'user-counter',
    count: '${base}-count',
    _count: {
        instanceOf: 'Number',
        valIfNull: 0,
    },
    username: '${base}-username',
};

/** @type {ElMakerConfig<AP>} */
const features = {
    assignFeatures: {
        roundabout: {
            customData: {
                raConfig,
            },
            withAttrs
        },
        templateMaker: {}
    }
}

export function render() {
    return JSON.stringify(features, null, 4);
}

const __filename = fileURLToPath(import.meta.url);
const outputFile = __filename.replace(/\.mjs$/, '.json');
writeFileSync(outputFile, render(), 'utf8');
```

</details>

Some non obvious scenarios:

### How can I perform an action when the escape key is pressed somewhere on the document?

Answer:

From the side-burger example.

```JS
const raConfig = {
    ...
    compacts: {
        on_keydown_of_ownerDocument_assignFromEvent: {
            [$.escapeKeyPressed.QMEq.Path]: [['?.key', 'Escape'], true, false]
        }
    },
    merges: smoothOver([
        {
            ifKeyIn: ['expanded'],
            ...doAssign(
                ...
                set($.escapeKeyPressed).to(false)
            )
        },
        ...
        {
            ifAllOf: ['escapeKeyPressed'],
            assign: {
                expanded: false
            }
        }
    ]),
};
```

## How can I set focus after a delay?

Work is underway to improve the DX a bit, but for now:

```JS
{
    delay:10, //milliseconds
    ifAllOf: ['expanded'],
    assign: {
        set($.querySelector('a').focus()).to({}),
    }
},
```

## Step 8

Run `node el-maker.mjs` (or `npm run build-el-maker` if your `package.json` includes a watch script) to regenerate `el-maker.json`.

Create a build instruction in package.json:

```JSON
"scripts": {
...
"build-el-maker": "node --watch el-maker.mjs",
},
```

## Create the Demo Page

For example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dev</title>
    <!-- #include virtual="/imports.html" -->

    <script type=module>
        import 'be-hive/be-hive.js';
        import 'imp-h/imp-h.js';
        import 'el-maker/def.js';
    </script>
</head>
<body>
    <be-hive></be-hive>
    <plus-minus imp-h="plus-minus/root.html">
        <script type=precede data-extends=el-maker src="plus-minus/el-maker.json"></script>
    </plus-minus>

</body>
</html>
```

<details>
    <summary>How scratch-box is structured</summary>

| File | Role |
|------|------|
| `root.html` | Declarative shadow DOM template, styles, inner form, and enhancement metadata. |
| `el-maker.mjs` | Type-checked configuration generator for the ElementMaker features. |
| `el-maker.json` | Generated JSON consumed by the `cede` script. |

### The template file (`root.html`)

The host element declares its shadow root declaratively, then contains everything needed inside the shadow DOM, including styles, a form element, and a `<be-hive>` block that wires up declarative enhancements:

```html
<scratch-box>
    <template shadowrootmode=open>
        <style adopt>
            :host[hidden] { display:none; }
            :host { display:block; background-color: HSL(250, 22%, 41%); padding: 1vw; }
            /* ... remaining styles ... */
        </style>
        <form class="checkbox-wrapper">
            <input 🪢 name=value type="checkbox" id="option"/>
            <link itemprop=value>
            <label for="option">
                <slot name="labelTxt">scratch-box</slot>
                <svg viewBox="0 0 60 40" aria-hidden="true" focusable="false">
                    <path d="M21,2 ..." stroke-width="4" fill="none" stroke-dasharray="270" stroke-dashoffset="270"></path>
                </svg>
            </label>
        </form>

        <be-hive>
            <script type=emc-parser
                    src="be-hive/parsers/parse-grouped-capture-statements.js"
                    parser-name=parse-grouped-capture-statements></script>
            <script type=emc
                    src="be-bound/🪢.json"
                    wait-for-parsers=parse-grouped-capture-statements></script>
        </be-hive>
    </template>
</scratch-box>
```


Notes:

- `imp-h` observes the `imp-h` attribute and imports the declarative shadow DOM template from `root.html`.
- The `<script type=cede data-extends=el-maker>` tells the mount observer to register the host element by extending `ElementMaker` and applying the feature JSON.
- No JS class file is required because all behavior is provided by the configured ElementMaker features and the declarative shadow DOM.

### When to use this pattern

Use the declarative shadow DOM + `cede` pattern when:

- The element is primarily visual and static.
- You want server-side rendering and progressive enhancement with no client-side custom element class.
- Feature configuration (form association, attribute reflection, reactive wiring, fonts) is sufficient for all behavior.

When you need custom runtime behavior beyond the shared features, fall back to the class-based pattern in the earlier sections and add your own feature.

