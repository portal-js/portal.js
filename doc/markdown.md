---
layout: home
title: Tutorial - writing a markdown widget
---

Tutorial - Writing a markdown widget
=====================

Let's write a complete widget. 
What do we want ?

* the widget should render Markdown formatted text to the user
* the widget should provide a custom edit page to edit Markdown
* the widget should store the markdown text as preference
* the widget has preferences
* the widget preferences are modifiable by everyone
* the widget will use external JS script (showdown)
* the widget will use external CSS resources 

Now the code 

```javascript
var MarkdownWidget = Portal.Widget({
  name: "Markdown",
  description: "Display markdown formated text"  
});

Portal.registerWidget('HfJ49Gceyh4PInNPr8', MarkdownWidget);
```

that's a basic Widget with nothing rendered and just name and description available in the widget catalog.

now let's add a stupid render function 

```javascript
var MarkdownWidget = Portal.Widget({
  name: "Markdown",
  description: "Display markdown formated text" ,
  render: function(container, prefs) {
    $('#' + container).html('<h1>Hello World!</h1>');
  }
});

Portal.registerWidget('HfJ49Gceyh4PInNPr8', MarkdownWidget);
```

The widget should render a big Hello World!, but that's not really what we need.

Showdown
--------

[Showdown](https://github.com/showdownjs/showdown) is a JS lib that can render markdown formated text as html.

You can get the source here [http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js](http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js)

let's declare it as dependency of the widget 

```javascript
var MarkdownWidget = Portal.Widget({
  name: "Markdown",
  description: "Display markdown formated text" ,
  jsAssets: ['http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js'],
  render: function(container, prefs) {
    $('#' + container).html('<h1>Hello World!</h1>');
  }
});

Portal.registerWidget('HfJ49Gceyh4PInNPr8', MarkdownWidget);
```

and use it 

```javascript
var MarkdownWidget = Portal.Widget({
  name: "Markdown",
  description: "Display markdown formated text" ,
  jsAssets: ['http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js'],
  init: function() {
    this.converter = new Showdown.converter();
  },
  render: function(container, prefs) {
    var mardowntext = prefs.markdown;
    var htmltext = this.converter.makeHtml(mardowntext);
    $('#' + container).html(htmltext);
  }
});

Portal.registerWidget('HfJ49Gceyh4PInNPr8', MarkdownWidget);
```

Here the only issue is that if there is no preference in the widget, then the converter will fail, so we will add default preference for `markdown`. Also we will add property to show preference edit button and always show it even is the current user is not in admin mode

```javascript
var MarkdownWidget = Portal.Widget({
  name: "Markdown",
  description: "Display markdown formated text" ,
  hasPrefs: true,
  alwaysShowPrefs: true,
  defaultPrefs: { markdown: "# Hello World!" },
  jsAssets: ['http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js'],
  init: function() {
    this.converter = new Showdown.converter();
  },
  render: function(container, prefs) {
    var mardowntext = prefs.markdown;
    var htmltext = this.converter.makeHtml(mardowntext);
    $('#' + container).html(htmltext);
  }
});

Portal.registerWidget('HfJ49Gceyh4PInNPr8', MarkdownWidget);
```

As we want to display title in gree, we also want to add the following css style to the widget 

```css
h1 {
  color: green;
}
```

now we can use it with 

```javascript
var MarkdownWidget = Portal.Widget({
  name: "Markdown",
  description: "Display markdown formated text" ,
  hasPrefs: true,
  alwaysShowPrefs: true,
  defaultPrefs: { markdown: "# Hello World!" },
  cssAssets: ['/url/to/the/nice/css/file.css'],
  jsAssets: ['http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js'],
  init: function() {
    this.converter = new Showdown.converter();
  },
  render: function(container, prefs) {
    var mardowntext = prefs.markdown;
    var htmltext = this.converter.makeHtml(mardowntext);
    $('#' + container).html(htmltext);
  }
});

Portal.registerWidget('HfJ49Gceyh4PInNPr8', MarkdownWidget);
```

Now the last thing we want to do is to be able to edit Markdown in preferences. The rendering of the edit page is done in a `renderEdit` function. Let's write one 

```javascript
var MarkdownWidget = Portal.Widget({
  name: "Markdown",
  description: "Display markdown formated text" ,
  hasPrefs: true,
  alwaysShowPrefs: true,
  defaultPrefs: { markdown: "# Hello World!" },
  cssAssets: ['/url/to/the/nice/css/file.css'],
  jsAssets: ['http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js'],
  init: function() {
    this.converter = new Showdown.converter();
  },
  render: function(container, prefs) {
    var mardowntext = prefs.markdown;
    var htmltext = this.converter.makeHtml(mardowntext);
    $('#' + container).html(htmltext);
  },
  renderEdit: function(container, prefs, saveCallback, cancelCallback) {
    $('#' + container).html('<div>' +
      '<div class="row-fluid">' +
        '<textarea id="' + (container + '_mdtext') 
            + '"class="largeText span12">' + (prefs.markdown || '') + '</textarea>' +
      '</div>' +
      '<div class="row-fluid" style="margin-top: 10px">' +
        '<div class="btn-group pull-right">' +
          '<button type="button" id="' + (container + '_mdcancel') 
              + '" class="btn btn-small btn-danger">Cancel</button>' +
          '<button type="button" id="' + (container + '_mdok') 
              + '" class="btn btn-small btn-primary">Ok</button>' +
        '</div>' +
      '</div></div>'
    );
    $('#' + container + '_mdcancel')
        .click(cancelCallback);  // add action when clicking on cancel
    $('#' + container + '_mdok').click(function(e) { // add action when clicking on save
      e.preventDefault();
      prefs.markdown = 
        $('#' + container + '_mdtext').val(); // change value of prefs.markdown
      saveCallback(prefs); // use the saveCallback to save prefs in the store
    });
  }
});

Portal.registerWidget('HfJ49Gceyh4PInNPr8', MarkdownWidget);
```

And we're done, we have written our first widget.

Enjoy ;-)