---
layout: home
title: Widgets catalog
---

About widgets catalog
=====================

A widget catalog is an object with a single function `show` that take a select callback and cancel callback as parameter.

This object is responsible of manipulating the actual DOM the way it needs to display a widget catalog. The only thing needed is to call the two provided callbacks based on whether the user added a new widget in a row or cancel the add action.

```javascript
{
    show: function(
        selectCallback: (name, width, title) => Promise[()],
        cancelCallback: () => ()
    )
}
```

You can get a default catalog object at `Portal.ChooseWidgetPopup`.

The source can be found [here](https://github.com/portal-js/portal.js/blob/master/src/choose.js) 
