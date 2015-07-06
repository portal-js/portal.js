---
layout: home
title: Widget
---

How to write a widget
=====================

A widget is a small javascript application than can be rendered individually in a portal. This kind of applet is ideal for data mashups. A widget is a simple thing with user scoped preferences (a javascript object) that can be edited. A widget can be rendered in two modes :

* render mode : the normal rendering of the application
* edit mode : usually a form used to edit user preferences

at each step, the widget know where it should render itself with a `container` param (the id of the DOM node for rendering), its preferences and its current userId.

Use the function `Portal.Widget(opts)` to create a widget class. Options are :

```javascript
{
    name: 'widget', // the name of the widget as visible in default catalog
    description: 'A widget', // the description of the widget as visible in the default catalog
    defaultPrefs: {}, // default prefs of a widget
    hasPrefs: false, // if the widget has prefs
    alwaysShowPrefs: false, // if prefs are visible even for non admin
    cssAssets: [], // array of css assets urls to inject in the current page 
    jsAssets: [], // array of js assets urls to inject in the current page 
    init: function(container, prefs, userId, savePrefsCallback) {},
    unmount: function(container, prefs, userId) {},
    willMount: function(container, prefs, userId) {},
    mounted: function(container, prefs, userId) {},
    render: function(container, prefs, userId) {},
    renderEdit: function(container, preferences, savePrefsCallback, cancelCallback, userId) {}
}
```

Each widget follows a well defined lifecycle each time a widget instance (you can create multiple instance of the same widget in one portal tab) has to be rendered in the UI (of you each widget can render it's inner UI any time it wants). The UI is re-rendered for instance at bootstrap, when the current tab is switched, etc ... The lifecycle of a widget in render mode is :

- `init(container: String, prefs: Object, userId: String, savePrefsCallback: (prefs) => Promise[Array[tab]])` : called only at first tab rendering
- `unmount(container: String, prefs: Object, userId: String)`
- `willMount(container: String, prefs: Object, userId: String)`
- `render(container: String, prefs: Object, userId: String)`
- `mounted(container: String, prefs: Object, userId: String)`

When the widget is in edit mode, the lifecycle is :

- `unmount(container: String, prefs: Object, userId: String)`
- `willMount(container: String, prefs: Object, userId: String)`
- `renderEdit(container: String, prefs: Object, saveCB: function, cancelCB: function, userId: String)`
- `mounted(container: String, prefs: Object, userId: String)`

Each widget provide and `extend({ ... })` function allowing to create widget class (sub-class ?) that extends another widget classes. You can find out more about it [here](extend.html).

Each widget provide asset dependencies if you need to import external CSS or JS resources that are not in the current page.
Those properties (cssAssets and jsAssets) are arrays filled with the urls of the assets. The library will ensure that
assets are only inserted once per page.

Here is a simple example of a widget :

```javascript
Portal.registerWidget('Iframe', Portal.Widget({
    name: 'iFrame',
    description: 'Display URL in an iframe',
    hasPrefs: true,
    alwaysShowPrefs: true,
    render: function(container, prefs, userId) {
        var html = '' +
            '<iframe ' +
                'src="' + (prefs.url || 
                    'http://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal') + '" ' +
                    'frameBorder="0" width="100%" </iframe>';
        $('#' + container).html(html);
    },
    renderEdit: function(container, prefs, save, cancel, userId) {
        $('#' + container).html('' +
          '<div>' +
            '<div class="row-fluid">' +
              'URL : <input type="text" id="' + (container + '_iframetext') 
                    + '"class="largeText span12" value="' +  prefs.url + '"/>' +
            '</div>' +
            '<div class="row-fluid" style="margin-top: 10px">' +
              '<div class="btn-group pull-right">' +
                '<button type="button" id="' + (container + '_mdcancel') 
                            + '" class="btn btn-small btn-danger">Cancel</button>' +
                '<button type="button" id="' + (container + '_mdok') 
                            + '" class="btn btn-small btn-primary">Ok</button>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
        $('#' + container + '_mdcancel').click(cancel);
        $('#' + container + '_mdok').click(function(e) {
            prefs.url = $('#' + container + '_iframetext').val();
            save(prefs);
        });
    }
}));

```

You can then use the `Portal.registerWidget(uniqueId, Widget)` so the widget is available in the widget store.
You should use a generated unique ID to avoid collision of name is the widget namespace.

The widget context
-------------------

If you're not really into lifecycle functions with a lot of parameters, you can use the widget context. The widget context is available inside each widget instance using `this.context`. The API of the context is the following :

```javascript
{
    containerId: function()     // return the current container id
    containerEditId: function() // return the current container id for edit mode
    prefs: function()           // return the current prefs
    userId: function()          // return the current user id
    eventBus: function()        // return the current portal instance event bus
    savePrefs: function(prefs)  // return a function to save prefs at any time
}
```                
