---
layout: home
title: Stores
---

About stores 
===========

A store is an object with a `save` and `load` method to handle user data like portal layout, instanciated widgets, etc ...

By default portal.js provide a REST store and a localStorage store, but you can provide your own widget store by overriding the store options of your portal instance.

A store is composed of a `load` and `save` function returning promises of array of tabs.

Store contract is the following :

```javascript
{
    save: (userId: String, tabs: Array[tab]) => Promise[Array[tab]],
    load: (userId: String) => Promise[Array[tab]]
}
```

For instance if you want to store your data in localstorage :

```javascript
Portal.bootstrap({
    userId: '123456',
    store: {
        save: function(userId, tabs) {
            var storeId = "tabsof-" + userId;
            var def = $.Deferred();
            localStorage.setItem(storeId, JSON.stringify(tabs || []));
            def.resolve(tabs);
            return def.promise();
        },
        load: function(userId) {
            var storeId = "tabsof-" + userId;
            var def = $.Deferred();
            var tabs = localStorage.getItem(storeId) || '[]';
            def.resolve(JSON.parse(tabs));
            return def.promise();
        }
    }
});
```