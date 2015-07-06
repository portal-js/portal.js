---
layout: home
title: Extending widgets
---

Extending widgets
================

Let say you want to build widget that all behave the same.
To do that you can use the `extend({...})` function that exists on all widgets.

For instance, a REST widget will always have to fetch a remote REST ressource every `n` seconds and display simple information extracted from the response.

Lets write a RestWidget :

```javascript
(function() {

    var cache = {};

    var RestWidget = Portal.Widget({
        defaultPrefs: { every: 30000 },
        hasPrefs: true, // the widget has prefs
        template: "Hello World!",
        transformer: function(data) { return data; },
        unmount: function(container, prefs) {
            if (cache[container]) {
                clearInterval(cache[container]);
                delete cache[container];
            }
        },
        render: function(container, prefs, userId) {
            if (_.isUndefined(this.url)) {
              throw new Error('You have to specify an URL');
            }
            function redraw() {
                $.get(this.url.replace('@userId', userId), function(data) {
                    var finalData = this.transformer(data);
                    var finalTemplate = _.template(this.template);
                    var html = finalTemplate(finalData);
                    $('#' + container).html(html);
                }.bind(this));
            }
            redraw.bind(this)();
            cache[container] = setInterval(redraw.bind(this), prefs.every || 30000);
        }
    });
})();
```

So, what do we have here ?

first the `cache`, as we use a `setInterval` instruction, we need to unset it each time a widget is unmounted, and that what is doing the `unmount` function of the `RestWidget`.

Then we have the `defaultPrefs: { every: 30000 }` that will be used to poll the server every 30 seconds.
The two following field are really important.

Template is an underscore template that will be used to render HTML inside the widget (see [http://underscorejs.org/#template](http://underscorejs.org/#template)). Every variable in this template will be replaced by data coming from the server through the transformer.

The transformer is a simple function than can transform data coming from the server if needed.

Then the render function is just a scheduler that fetch an specified url (with `@userId` replaced), create a template, transform data and render the template in the widget every n seconds;

Now lets use it in an actual widget :

```javascript
(function() {

    ...

    Portal.registerWidget('932rdP6BlDwQ5gpVBc1SgxfwQuJp0vnTyxfrJzclhCqe7RifrXiwWOEW6V4kaEdb', RestWidget.extend({
        name: 'Current Amount',
        description: 'Evolution of the current amount',
        url: "/services/amount/@userId",
        template: '<a href="<%= url %>" target="_blank"><b><%= currentAmout %>€ <%= img %></b></a>',
        transformer: function(data) {
            var delta = data.currentAmout - data.previousAmount ;
            data.img = delta >= 0 ? upImg : downImg;
            return data;
        }
    }));
})();
```
