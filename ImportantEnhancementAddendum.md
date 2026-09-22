# Clarify Programmatic Way to Add Enhancements

When we define an enhancement, it is easiest to demonstrate what it does and how it works by providing simple HTML examples with the attributes used to trigger the enhancement.

These examples are skewed towards an important use case -- progressive enhancement of server rendered content.

However, currently, only a small fraction of web development centers around that paradigm.  Rather, it tends to revolve around client-side rendering, using a framework.

In such a context, putting so much emphasis on the attribute way of hooking things up is problematic.  

1.  Such frameworks are clumsy when it comes to setting attributes.
2.  The amount of object stringifying and parsing is inefficient.

So we should make an effort to showcase how to integrate with these enhancements efficiently and ergonomically in such settings.  Basically programmatically without the use of attributes.

I think we should showcase two ways to do so.

So for example, currently the README.md for be-persistent shows the example:

```html
<input be-persistent="of value@input via sessionStorage://{autoGenId}.">
```

We should also show:

## Imperative Enhancement Attachment:

```JS
import {emc} from 'be-persistent/emc.json' with {type: 'json'};
import {BePersistent} from 'be-persistent/be-persistent.js';
emc.spawn = BePersistent;
const persistenceEnhancement = oInput.enh.get(emc);
persistenceEnhancement.store = 
    {
        localProp: 'value', //default
        localEvent: 'input', //default
        usl: 'sessionStorage://{autoGenId}'
    };
```

## Declarative Enhancement Attachment:

```JS
import 'be-persistent/.js';

```