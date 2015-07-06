/**
 * Copyright 2015 Portal.js
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
 
var _ = Portal.Underscore;

(function() {

    var simpleWidget = Portal.Portlé({
        name: 'Lorem Ipsum',
        hasPrefs: true,
        description: 'Lorem ipsum dolor sit amet',
        render: function(container, prefs) {
            $('#' + container).html('<span data-href="http://www.google.fr" class="portal-clickable"><h4>Lorem ipsum</h4><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed finibus urna in accumsan aliquet. Quisque est tellus, molestie ac nisi in, facilisis placerat eros. Phasellus turpis risus, luctus eget laoreet et, fermentum a nibh. Vivamus eu lorem eleifend, elementum tellus ut, volutpat metus. Ut sagittis dictum orci, eget efficitur nisl luctus nec. Etiam congue varius erat, ac cursus augue lobortis quis. In hac habitasse platea dictumst. Pellentesque lacinia ligula sollicitudin erat pulvinar gravida. Curabitur nibh ligula, ultricies id sapien eu, pellentesque eleifend dui. Fusce molestie laoreet ornare. Nunc maximus ultricies leo sed vulputate. Aenean dictum justo at iaculis accumsan. Quisque vel fermentum libero. Donec efficitur ultricies tortor sed rhoncus.</p></span>');
        }
    });

    Portal.registerWidget('LoremIpsum', simpleWidget);

})();

(function() {
    Portal.registerWidget('Iframe', Portal.Widget({
        name: 'iFrame',
        description: 'Display URL in an iframe',
        hasPrefs: true,
        alwaysShowPrefs: true,
        defaultPrefs: {
          url: 'http://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal'
        },
        render: function(container, prefs, userId) {
            var html = '' +
                '<iframe ' +
                    'class="" ' +
                    'src="' + (prefs.url || 'http://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal') + '" ' +
                    'title="" ' +
                    'allowTransparency="true" ' +
                    'frameBorder="0" ' +
                    'width="100%" ' +
                    'height="500px">' +
                    '</iframe>';
            $('#' + container).html(html);
        },
        renderEdit: function(container, prefs, save, cancel, userId) {
            $('#' + container).html('<div>' +
                '<div class="row-fluid">' +
                    'URL : <input type="text" id="' + (container + '_iframetext') + '"class="largeText span12" value="' +  prefs.url + '"/>' +
                '</div>' +
                '<div class="row-fluid" style="margin-top: 10px">' +
                '<div class="btn-group pull-right">' +
                '<button type="button" id="' + (container + '_mdcancel') + '" class="btn btn-small btn-danger">Cancel</button>' +
                '<button type="button" id="' + (container + '_mdok') + '" class="btn btn-small btn-primary">Ok</button>' +
                '</div>' +
                '</div></div>'
            );
            $('#' + container + '_mdcancel').click(cancel);
            $('#' + container + '_mdok').click(function(e) {
                prefs.url = $('#' + container + '_iframetext').val();
                save(prefs);
            });
        }
    }));
})();

(function() {

    var cache = {};

    Portal.registerWidget('Clock', Portal.Widget({
        name: 'Clock',
        description: 'A simple clock',
        jsAssets: ["http://momentjs.com/downloads/moment.min.js"],
        defaultSize: 3,
        resizable: false,
        unmount: function(container, prefs) {
            if (cache[container]) {
                clearInterval(cache[container]);
                delete cache[container];
            }
        },
        render: function(container, prefs) {
            this.context.savePrefs({poeut: 'pouet'}).then(function() {
                console.log(" => ");
                console.log(this.context.prefs());
            }.bind(this));
            function draw() {
                var date = moment().format('MMMM Do YYYY, hh:mm:ss');
                $('#' + container).html('<div style="text-align: center"><h5>' + date + '</h5></div>')
            }
            draw();
            var interval = setInterval(draw, 1000);
            cache[container] = interval;
        }
    }))
})();

(function() {

    var MarkdownWidget = Portal.Widget({
      name: "Markdown",
      description: "Display markdown formated text" ,
      hasPrefs: true,
      alwaysShowPrefs: true,
      defaultPrefs: { markdown: "# Hello World!" },
      cssAssets: ['/url/to/the/nice/css/file.css'],
      jsAssets: ['http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js'],
      unmount: function(cont) {
        console.log('unmount from ' + cont);
      },
      willMount: function() {
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
                + '"class="largeText span12" rows=10>' + (prefs.markdown || '') + '</textarea>' +
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

})();

var templateAddTab = '<li><a class="portal-add-tab" href="#"><i class="icon-plus"></i></a></li>';
var templateTabAdmin = _.template('<li>' +
'<a href="#" class="portal-remove-tab-injected" style="position: absolute" data-tab-id="<%= id %>">&times;</a>' +
'<a class="tab-selector" style="margin-left: 15px" data-tab-id="<%= id %>" href="#"><%= title %></a>' +
'</li>');
var $tabs = $('#tabs');
var $body = $('body');

function displayTabs(tabs) {
    $tabs.html('');
    _.each(tabs, function(tab) {
        $tabs.append(templateTabAdmin(tab));
    });
    $tabs.append(templateAddTab);
}

var portal = Portal.bootstrap({
    userId: '123456',
    adminMode: true,
    bindTabToHash: true,
    onTabLoad: displayTabs
});

$body.on('click', '.portal-add-tab', function(e) {
    e.preventDefault();
    var name = prompt('Name of the tab ?');
    portal.addTab(name).then(function() {
        displayTabs(portal.getTabs());
    });
});

$body.on('click', '.tab-selector', function(e) {
    e.preventDefault();
    var tabId = ''+ $(this).data('tab-id');
    portal.navigateToTab({ id: tabId });
});

$body.on('click', '.portal-remove-tab-injected', function(e) {
    e.preventDefault();
    portal.removeTab({ id: '' + $(this).data('tab-id') }).then(function() {
        displayTabs(portal.getTabs());
    });
});

Portal.globalEvents.on('konami', function() {
    console.log("Konami show !!!!");
});
