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
 
var $ = require('jquery');
var _ = require('underscore');
var Elem = require('elemjs');

module.exports = function(options) {
    var defaultOptions = {
        name: 'widget',
        description: 'A widget',
        defaultPrefs: {},
        hasPrefs: false,
        alwaysShowPrefs: false,
        cssAssets: [],  // Dependencies to inject in page
        jsAssets: [],   // Dependencies to inject in page
        resizable: true,
        defaultSize: 4,
        category: 'All',
        extend: function(def) {
            return _.extend(_.clone(this), def);
        },
        init: function(container, prefs, userId) {},
        unmount: function(container, prefs, userId) {},
        willMount: function(container, prefs, userId) {},
        mounted: function(container, prefs, userId) {},
        render: function(container, prefs, userId) {},
        renderEdit: function(container, preferences, savePrefsCallback, cancelCallback, userId) {

            var content = JSON.stringify(preferences, null, 2);

            function _saveContent(e) {
                content = e.target.value;
            }

            function _saveAndContinue(e) {
                e.preventDefault();
                savePrefsCallback(JSON.parse(content));
            }

            var view = (
                Elem.el("div", {}, [
                    Elem.el("div", { className: "row-fluid" },
                        Elem.el("textarea", { onchange: _saveContent, className: "largeText span12" }, content)
                    ),
                    Elem.el("div", {className: "row-fluid", style: { marginTop: '10px' }},
                        Elem.el("div", {className: "btn-group pull-right"}, [
                            Elem.el("button", { type: "button", onclick: cancelCallback, className: "btn btn-small btn-danger"}, "Cancel"),
                            Elem.el("button", { type: "button", onclick: _saveAndContinue, className: "btn btn-small btn-primary"}, "Ok")
                        ])
                    )
                ])
            );
            Elem.render(view, '#' + container);
        }
    };
    return _.extend(_.clone(defaultOptions), options);
};
