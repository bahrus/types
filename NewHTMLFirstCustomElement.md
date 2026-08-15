


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

