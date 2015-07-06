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
var common = require('./common');
var Registry = require('./registry');
var ChooseWidgetPopup = require('./choose');
var Widget = require('./widget');
var Style = require('./style');
var EventBus = require('./events');

var dragTarget = undefined;
var dragSource = undefined;

var addedJsAssets = {};
var addedCssAssets = {};


var defaultOptions = {
    container: 'portal-container',
    adminMode: false,
    bindTabToHash: false,
    onTabLoad: function(tabs) {},
    showTabAtStartup: 0,
    tabsGetUrl: '@root/api/@userId',
    tabsSaveUrl: '@root/api/@userId',
    widgetsCatalog: ChooseWidgetPopup,
    singleMode: false,
    displayAddRow: true,
    displayDeleteRow: true,
    displayAddWidget: true,
    displayMoveWidget: true,
    authorizedWidget: function(w) {return true},
    unauthorizedMessage: 'Vous n\'êtes pas authorisé à utiliser cette application.'
};

exports.bootstrap = function(options) {

    if (_.isUndefined(options.userId)) {
        throw new Error('You have to provide a userId');
    }
    var opts = _.extend(_.clone(defaultOptions), options);
    var userId = opts.userId;
    _.each(_.keys(opts), function(key) {
        var val = opts[key];
        if (_.isString(val)) {
            opts[key] = val.replace('@userId', userId).replace('@root', opts.apiRootUrl);
        }
    });

    var userTabs = [];
    var currentTabId = -1;
    var portalEventBus = EventBus();

    if (_.isUndefined(opts.store) && _.isUndefined(opts.apiRootUrl)) {
        opts.store = {
            save: function(userId, tabs) {
                var storeId = "Portal.User.Tabs." + userId;
                var def = $.Deferred();
                localStorage.setItem(storeId, JSON.stringify(tabs || []));
                def.resolve(tabs);
                return def.promise();
            },
            load: function(userId) {
                var storeId = "Portal.User.Tabs." + userId;
                var def = $.Deferred();
                var tabs = localStorage.getItem(storeId) || '[{"position":0,"id":"1","title":"Home","rows":[{"position":0,"id":"11","widgets":[{"position":0,"id":"111","width":4,"name":"Clock","jsWidgetName":"Clock","preferences":{}}]}]}]';
                def.resolve(JSON.parse(tabs));
                return def.promise();
            }
        };
    }
    if (_.isUndefined(opts.store) && !_.isUndefined(opts.apiRootUrl)) {
        opts.store = {
            save: function(userId, tabs) {
                return $.ajax({
                    url: opts.tabsGetUrl,
                    type: 'POST',
                    data: JSON.stringify(tabs)
                });
            },
            load: function(userId) {
                return $.ajax({
                    url: opts.tabsGetUrl,
                    type: 'GET'
                });
            }
        };
    }

    function fetchTabs() {
        return opts.store.load(userId).then(function(data) {
            userTabs = data;
            return data;
        }).fail(function() {
            console.error("Error when loading tabs");
        });
    }

    function saveTabs() {
        return opts.store.save(userId, userTabs).then(function(data) {
            userTabs = data;
            return data;
        }).fail(function() {
            console.error("Error when saving tabs");
        });
    }


    function portalRemoveRow(rowId, opts) {
        var actualTab = _.findWhere(userTabs, { id : currentTabId });
        actualTab.rows = _.filter(actualTab.rows, function(row) {
            return row.id !== rowId;
        });
        currentTabId = actualTab.id;
        return saveTabs().then(function() {
            actualTab = _.findWhere(userTabs, { id : currentTabId });
            displayTab(actualTab, opts.container);
        });
    }

    function portalAddRow(tabId, opts) {
        var actualTab = _.findWhere(userTabs, { id : tabId });
        var id = common.uuid();
        var newRow = {
            id: id,
            title: common.uuid(),
            position: common.findNextPosition(actualTab.rows),
            widgets: []
        };
        actualTab.rows.push(newRow);
        currentTabId = actualTab.id;
        return saveTabs().then(function() {
            actualTab = _.findWhere(userTabs, { id : currentTabId });
            displayTab(actualTab, opts.container);
        });
    }

    function portalAddWidget(rowId, opts) {

        function cancel() {}

        function select(name, width, title) {
            var actualTab = _.findWhere(userTabs, { id : currentTabId });
            var actualRow = _.findWhere(actualTab.rows, { id : rowId });
            var id = common.uuid();
            var widgetInstance = {
                id: id,
                position: common.findNextPosition(actualRow.widgets),
                jsWidgetName: name,
                name: title || Registry.registeredWidgets()[name].name,
                width: parseInt(width),
                preferences: Registry.registeredWidgets()[name].defaultPrefs
            };
            actualRow.widgets.push(widgetInstance);
            saveTabs().then(function() {
                actualTab = _.findWhere(userTabs, { id : currentTabId });
                displayTab(actualTab, opts.container);
            });
        }
        opts.widgetsCatalog.show(Registry, select, cancel);
    }

    function portalRemoveTab(tab) {
        userTabs = _.filter(userTabs, function(t) {
            return t.id !== tab.id;
        });
        return saveTabs().then(function() {
            fullUpdate();
        });
    }

    function portalUpdateWidgetPref(widgetId, prefs) {
        var actualTab = _.findWhere(userTabs, { id : currentTabId });
        _.each(actualTab.rows, function(r) {
            _.each(r.widgets, function(w) {
                if (w.id === widgetId) {
                    w.preferences = prefs;
                }
            });
        });
        currentTabId = actualTab.id;
        return saveTabs();
    }

    function portalRemoveWidget(widgetId, opts) {
        var actualTab = _.findWhere(userTabs, { id : currentTabId });
        _.each(actualTab.rows, function(row) {
            row.widgets = _.filter(row.widgets, function(widget) {
                return widget.id !== widgetId;
            });
        });
        currentTabId = actualTab.id;
        return saveTabs().then(function() {
            actualTab = _.findWhere(userTabs, { id : currentTabId });
            displayTab(actualTab, opts.container);
        });
    }

    function WidgetBar(admin, title, widget, opts, widgetDivId, prefDivId, frameId, row, component) {
        function _showPrefs(e) {
            e.preventDefault();

            var prefs = widget.preferences;

            // TODO : handle old browser without css transform

            function cancel() {
                $('[data-frame="' + frameId + '"] .flip-container').removeClass('flip');
                $('[data-frame="' + frameId + '"] .front .portal-widget').css('minHeight', 0);
                component.unmount(prefDivId, _.clone(prefs), userId);
                $('#' + widgetDivId).html('');
                component.willMount(widgetDivId, _.clone(prefs), userId);
                component.render(widgetDivId, _.clone(prefs), userId);
                component.mounted(widgetDivId, _.clone(prefs), userId);
            }

            function save(prefs) {
                $('[data-frame="' + frameId + '"] .flip-container').removeClass('flip');
                $('[data-frame="' + frameId + '"] .front .portal-widget').css('minHeight', 0);
                portalUpdateWidgetPref(widget.id, prefs);
                component.unmount(prefDivId, _.clone(prefs), userId);
                $('#' + widgetDivId).html('');
                component.willMount(widgetDivId, _.clone(prefs), userId);
                component.render(widgetDivId, _.clone(prefs), userId);
                component.mounted(widgetDivId, _.clone(prefs), userId);
            }

            component.unmount(widgetDivId, _.clone(prefs), userId);
            $('#' + prefDivId).html('');
            component.willMount(prefDivId, _.clone(prefs), userId);
            component.renderEdit(prefDivId, _.clone(prefs), save, cancel, userId);
            component.mounted(prefDivId, _.clone(prefs), userId);

            $('[data-frame="' + frameId + '"] .front .portal-widget').css('minHeight', $('#' + prefDivId).outerHeight());
            $('[data-frame="' + frameId + '"] .flip-container').addClass('flip');

        }

        function _removeWidget(e) {
            e.preventDefault();
            portalRemoveWidget(widget.id, opts);
        }

        function _drag(e) {
            dragSource = {
                row: row,
                widget: widget
            };
        }

        function _dragend(e) {
            var arr1 = _.sortBy(dragSource.row.widgets, function(w) { return w.position; });
            var arr2 = _.sortBy(dragTarget.row.widgets, function(w) { return w.position; });
            var count = 0;
            var idx1 = 0;
            _.each(arr1, function(w) {
                if (w.id === dragSource.widget.id) {
                    idx1 = count;
                }
                count++;
            });
            count = 0;
            var idx2 = 0;
            _.each(arr2, function(w) {
                if (dragTarget.widget && w.id === dragTarget.widget.id) {
                    idx2 = count;
                }
                if (!dragTarget.widget) {
                    idx2 = count + 1;
                }
                count++;
            });
            arr1.splice(idx1, 1);
            if (dragSource.row.id === dragTarget.row.id) {
                arr2.splice(idx1, 1);
                arr2.splice(idx2, 0, dragSource.widget);
                arr1.splice(idx2, 0, dragSource.widget);
            } else {
                arr2.splice(idx2, 0, dragSource.widget);
            }
            var index = 0;
            _.each(arr1, function(w) {
                w.position = index;
                index++;
            });
            index = 0;
            _.each(arr2, function(w) {
                w.position = index;
                index++;
            });
            dragSource.row.widgets = arr1;
            dragTarget.row.widgets = arr2;

            dragSource = undefined;
            dragTarget = undefined;

            var actualTab = _.findWhere(userTabs, { id: currentTabId });
            currentTabId = actualTab.id;

            saveTabs().then(function(){
                actualTab = _.findWhere(userTabs, { id : currentTabId });
                displayTab(actualTab, opts.container);
            })

        }

        return Elem.el('div', { className: 'portal-widget-bar row-fluid' }, [
            Elem.el('div', { className: 'span12', style: { paddingLeft: '10px', paddingRight: '10px', paddingTop: '8px', paddingBottom: '8px' } },
                [
                    Elem.el('span', { className: 'portal-widget-bar-title', style: { fontWeight: 'bold' } }, title), // + ' ' + widget.position),
                    Elem.el('div', { className: 'btn-group pull-right', style: { textAlign: 'right' } }, [
                        // TODO : hide if edit mode
                        common.ifPredicate((admin && component.hasPrefs) || (!admin && component.hasPrefs && component.alwaysShowPrefs), Elem.el('button', { className: 'btn btn-primary btn-mini', title: 'Préférences', onclick: _showPrefs }, Elem.el('i', { className: 'icon-cog icon-white' }, []))),
                        common.ifPredicate(admin && opts.displayMoveWidget, Elem.el('button', { className: 'btn btn-inverse btn-mini', title: 'Déplacer', draggable: 'true', ondragstart: _drag, ondragend: _dragend }, Elem.el('i', { className: 'icon-move icon-white' }, []))),
                        common.ifPredicate(admin, Elem.el('button', { className: 'btn btn-danger btn-mini', title: 'Supprimer', onclick: _removeWidget }, Elem.el('i', { className: 'icon-remove icon-white' }, [])))
                    ])
                ]
            )
        ]);
    }

    function Widget(widgetId, prefId, admin, widget, opts, row, component, bodyMode) {

        var id = _.uniqueId('frame_');

        function _select(e) {
            dragTarget = {
                row: row,
                widget: widget
            };
            $('[data-frame="' + id + '"').addClass('portal-widget-draggedon');
        }

        function _deselect(e) {
            $('[data-frame="' + id + '"').removeClass('portal-widget-draggedon');
        }




        if (bodyMode === true && !component.alwaysShowPrefs) {
            return Elem.el('div', { className: 'row-fluid', dataFrame: id },
                Elem.el('div', { className: 'span12 portal-widget' }, [
                    WidgetBar(admin, widget.name, widget, opts, widgetId, prefId, id, row, component),
                    Elem.el('div', { className: 'row-fluid' },
                        Elem.el('div', { id: widgetId, className: 'span12 portal-widget-body' }, [])
                    )
                ])
            );
        }
        if (bodyMode === true && component.alwaysShowPrefs) {
            return Elem.el('div', { className: 'row-fluid', dataFrame: id },
                Elem.el('div', {className:"flip-container"},
                    Elem.el('div', {className:'flipper'},
                        [Elem.el('div', {className:'front'},
                            Elem.el('div', { className: 'span12 portal-widget' }, [
                                WidgetBar(admin, widget.name, widget, opts, widgetId, prefId, id, row, component),
                                Elem.el('div', { className: 'row-fluid' },
                                    Elem.el('div', { id: widgetId, className: 'span12 portal-widget-body' }, [])
                                )
                            ])
                        ),
                        Elem.el('div', {className:'back'},
                            Elem.el('div', {id: prefId, className:'portal-pref'}, [])
                        )]
                    )
                )
            );
        }
        return Elem.el('div', { className: 'row-fluid', dataFrame: id, ondragover: _select, ondragenter: _select, ondragleave: _deselect },
            Elem.el('div', {className:"flip-container"},
                Elem.el('div', {className:'flipper'},
                    [Elem.el('div', {className:'front'},
                        Elem.el('div', { className: 'span12 portal-widget' }, [
                            WidgetBar(admin, widget.name, widget, opts, widgetId, prefId, id, row, component),
                            Elem.el('div', { className: 'row-fluid' },
                                Elem.el('div', { id: widgetId, className: 'span12 portal-widget-body' }, [])
                            )
                        ])
                    ),
                    Elem.el('div', {className:'back'},
                        Elem.el('div', {id: prefId, className:'portal-pref portal-widget'}, [])
                    )]
                )
            )
        );
    }

    function displayTab(tab, container) {
        var widgetsToRender = [];

        function _addRow(e) {
            e.preventDefault();
            portalAddRow(tab.id, opts);
        }

        var rows = [];
        if (opts.singleMode) {
            var id;
            if (_.isObject(opts.singleMode)) {
                if (opts.singleMode.widgetId) {
                    id = opts.singleMode.widgetId;
                } else {
                    id = common.queryParam('widgetId');
                }
            } else {
                id = common.queryParam('widgetId');
            }
            _.each(userTabs, function(t) {
                _.each(t.rows, function(r) {
                    _.each(r.widgets, function(w) {
                        if (w.id === id || w.jsWidgetName === id) {
                            var widgetId = _.uniqueId("widget_");
                            var component = _.clone(Registry.registeredWidgets()[w.jsWidgetName]);
                            widgetsToRender.push({ id: widgetId, widget: w.jsWidgetName, component: component, prefs: w.preferences, name:w.name });
                            var element = Elem.el('div', { className: 'span12' }, Widget(widgetId, false, undefined, w, opts, r, component, true));
                            rows = [
                                Elem.el('div', { className: 'row-fluid' },
                                    Elem.el('div', { className: 'span12' },
                                        Elem.el('div', { className: 'row-fluid' },
                                            element
                                        )
                                    )
                                )
                            ];
                        }
                    });
                });
            });

            if (rows.length === 0 && Registry.registeredWidgets()[id] !== undefined) {
                var widgetId = _.uniqueId("widget_");
                var component = _.clone(Registry.registeredWidgets()[id]);
                widgetsToRender.push({ id: widgetId, widget: id, component: component, prefs: component.defaultPrefs, name:component.name });
                var element = Elem.el('div', { className: 'span12' }, Widget(widgetId, false, undefined, component, opts, undefined /* row */, component, true));
                rows = [
                    Elem.el('div', { className: 'row-fluid' },
                        Elem.el('div', { className: 'span12' },
                            Elem.el('div', { className: 'row-fluid' },
                                element
                            )
                        )
                    )
                ];
            }

        } else {
            rows = _.chain(tab.rows).sortBy(function(row) { return row.position; }).map(function(row) {

                var totalWidth = 0;
                var rid = _.uniqueId('row_');

                function _removeRow(e) {
                    e.preventDefault();
                    portalRemoveRow(row.id, opts);
                }

                function _addWidget(e) {
                    e.preventDefault();
                    portalAddWidget(row.id, opts);
                }

                function _select(e) {
                    if (row.widgets.length === 0) {
                        dragTarget = {
                            row: row,
                            widget: undefined
                        };
                        $('[data-row="' + rid + '"').addClass('portal-widget-draggedon');
                    }
                }

                function _deselect(e) {
                    $('[data-row="' + rid + '"').removeClass('portal-widget-draggedon');
                }

                var back = '' ;
                if (row.widgets.length === 0) {
                    back = 'dotted';
                }

                var rowNbr = 0;
                var countWidth = 0;
                // here creation multiple lines of width 12 for each row
                var partitions = _.chain(row.widgets).sortBy(function(widget) { return widget.position; }).groupBy(function(item) {
                    if (countWidth + item.width <= 12) {
                        countWidth = countWidth + item.width;
                    } else {
                        rowNbr++;
                        countWidth = item.width;
                    }
                    return rowNbr;
                }).value();
                var insideRows = _.chain(_.keys(partitions)).sortBy(function(i) { return i; }).map(function(i) { return partitions[i]; }).map(function(arr) {
                    return Elem.el('div', { className: 'row-fluid' },
                        Elem.el('div', { className: 'span12' },
                            Elem.el('div', { className: 'row-fluid' },
                                _.chain(arr).sortBy(function(widget) { return widget.position; }).map(function(widget) {
                                    var prefId = _.uniqueId('pref_');
                                    var widgetId = _.uniqueId("widget_");
                                    var component = _.clone(Registry.registeredWidgets()[widget.jsWidgetName]); // || {function() { console.error('Widget with name ' + widget.widget + ' is not available here ...')};
                                    if (_.isUndefined(component)) {
                                        throw new Error('Component with name ' + widget.jsWidgetName + ' does not exists');
                                    }
                                    widgetsToRender.push({ prefsId: prefId, id: widgetId, widget: widget.jsWidgetName, component: component, prefs: widget.preferences, wid: widget.id });
                                    var widgetWidth = widget.width;
                                    return Elem.el('div', { className: 'span' + widgetWidth }, Widget(widgetId, prefId, opts.adminMode, widget, opts, row, component));
                                }).value().concat((function() {
                                    var total = 0;
                                    _.each(arr, function(widget) {
                                        total = total + widget.width;
                                    });
                                    if (total < 12) {
                                        var adderId = _.uniqueId('adder_');
                                        function _adderSelect(e) {
                                            dragTarget = {
                                                row: row,
                                                widget: undefined
                                            };
                                            $('[adder-id="' + adderId + '"').addClass('portal-widget-draggedon');
                                        }
                                        function _adderDeselect(e) {
                                            $('[adder-id="' + adderId + '"').removeClass('portal-widget-draggedon');
                                        }
                                        return [Elem.el('div', { adderId: adderId, ondragover: _adderSelect, ondragenter: _adderSelect, ondragleave: _adderDeselect, className: 'span' + (12 - total), style: { minHeight: '150px' } }, '')];
                                    }
                                    return [];
                                })())
                            )
                        )
                    );
                }).value();

                return Elem.el('div', { dataRow: rid, ondragover: _select, ondragenter: _select, ondragleave: _deselect, className: 'portal-row row-fluid ' + back, style: { minHeight: '100px'} },
                    [
                        (function() {
                            if (opts.adminMode) {
                                return Elem.el('div', { className: 'row-fluid'  },
                                    Elem.el('div', { className: 'btn-group btn-group-vertical', style: { position: 'absolute', marginLeft: '-35px', marginTop: '15px' } }, [
                                        Elem.predicate(opts.displayAddWidget, Elem.el('button', {
                                                onclick: _addWidget,
                                                title: 'Ajouter une application à la ligne',
                                                className: 'portal-add-widget btn btn-mini btn-primary'
                                            }, Elem.el('i', {className: 'icon-plus icon-white'}, [])
                                        )),
                                        Elem.predicate(opts.displayDeleteRow, Elem.el('button',
                                            {
                                                onclick: _removeRow,
                                                title: 'Supprimer la ligne',
                                                className: 'portal-remove-row btn btn-mini btn-danger'
                                            }, Elem.el('i', { className: 'icon-trash icon-white' }, [])
                                        ))
                                    ])
                                )
                            } else {
                                return undefined;
                            }
                        })()
                    ].concat(insideRows)
                );
            }).value();
        }

        if (opts.adminMode && opts.displayAddRow && !opts.singleMode) {
            rows = rows.concat([
                Elem.el('div', {className: 'row-fluid', style: { marginTop: '20px' }},

                    Elem.el('div', { className: 'btn-group', style: { position: 'absolute', marginLeft: '-35px', marginTop: '15px' } }, [
                        Elem.el('button',
                            {
                                onclick: _addRow,
                                title: 'Ajouter une nouvelle ligne',
                                className: 'portal-add-row btn btn-mini btn-success'
                            }, Elem.el('i', { className: 'icon-plus-sign icon-white' }, []))
                    ])
                )
            ]);
        }

        Elem.render(Elem.el('div', rows), '#' + container);

        _.each(widgetsToRender, function(widget) {
            var defer = false;
            function renderWidget() {
                if (!opts.authorizedWidget(widget)) {
                    Elem.render(
                        Elem.el('h4', {}, opts.unauthorizedMessage),
                        '#' + widget.id
                    );
                    return;
                }
                var context = {
                    editContainerId: function() { return widget.prefsId; },
                    containerId: function() { return widget.id; },
                    prefs: function() {
                        var _prefs = {};
                        _.each(userTabs, function(t) {
                            _.each(t.rows, function(r) {
                                _.each(r.widgets, function(w) {
                                    if (w.id === widget.wid) {
                                        _prefs = _.clone(w.preferences);
                                    }
                                });
                            });
                        });
                        return _prefs;
                    },
                    userId: function() { return userId; },
                    eventBus: function() { return portalEventBus; },
                    savePrefs: function(np) {
                        return portalUpdateWidgetPref(widget.wid, np);
                    },
                    adminMode: function() { return opts.adminMode; },
                    data: function() {
                        var uid = this.userId();
                        var p = this.prefs();
                        var c = this.containerId();
                        return {
                            userId: uid,
                            prefs: p,
                            containerId: c
                        };
                    }
                };
                widget.component.context = context;
                instanciatedWidgets.push({ component: widget.component, container: widget.id, prefs: _.clone(widget.prefs), userId: userId})
                widget.component.init(widget.id, _.clone(widget.prefs), userId, context.savePrefs);
                widget.component.unmount(widget.id, _.clone(widget.prefs), userId);
                widget.component.willMount(widget.id, _.clone(widget.prefs), userId);
                widget.component.render(widget.id, _.clone(widget.prefs), userId);
                widget.component.mounted(widget.id, _.clone(widget.prefs), userId);
            }
            _.each(widget.component.cssAssets, function(asset) {
                if (!addedCssAssets[asset]) {
                    addedCssAssets[asset] = true;
                    console.log("Injecting CSS dependency " + asset);
                    $('head').append('<link rel="stylesheet" media="screen" href="' + asset + '">');
                }
            });

            var jsAssetsCount = 0;

            var assetsToAdd = [];

            function renderIfAssetsFinished() {
                jsAssetsCount--;
                if (jsAssetsCount <= 0) {
                    if (assetsToAdd.length == 0) {
                        renderWidget();
                    } else {
                        var asset = assetsToAdd.shift();
                        console.log("Injecting JS dependency " + asset);
                        $.getScript(asset).done(function() {
                            console.log("Injected JS dependency" + asset);
                            renderIfAssetsFinished()
                            _.each(addedJsAssets[asset], function(f) {
                                f();
                            });
                            addedJsAssets[asset] = true;
                        }).fail(function( jqxhr, settings, exception ) {
                            console.log(exception);
                            renderIfAssetsFinished();
                            _.each(addedJsAssets[asset], function(f) {
                                f();
                            });
                            addedJsAssets[asset] = true;
                        });
                    }
                }
            }

            _.each(widget.component.jsAssets, function(asset) {
                if (_.isUndefined(addedJsAssets[asset])) {
                    addedJsAssets[asset] = [];
                    assetsToAdd.push(asset);
                    defer = true;
                } else if (_.isArray(addedJsAssets[asset])) {
                    jsAssetsCount++;
                    addedJsAssets[asset].push(renderIfAssetsFinished);
                    defer = true;
                }
            });

            if (jsAssetsCount == 0 && defer) {
                renderIfAssetsFinished();
            }

            if (!defer) {
                renderWidget();
            }
        });
    }
    var instanciatedWidgets = [];

    function fullUpdate() {
        fetchTabs().then(function(data) {
            userTabs = data;
            opts.onTabLoad(_.clone(data));
            var hash = '';
            if (opts.bindTabToHash) {
                hash = (location.hash || '#').replace('#', '');
            }
            var actualTab;
            if (hash !== '') {
                actualTab = _.findWhere(userTabs, { id: hash });
            }

            if (_.isUndefined(actualTab)) {
                if (_.isNumber(opts.showTabAtStartup)) {
                    actualTab = userTabs[opts.showTabAtStartup];
                } else if (_.isFunction(opts.showTabAtStartup)) {
                    actualTab = _.find(userTabs, opts.showTabAtStartup);
                } else if (_.isObject(opts.showTabAtStartup)) {
                    actualTab = _.findWhere(userTabs, opts.showTabAtStartup);
                }
            }

            currentTabId = actualTab.id;
            displayTab(actualTab, opts.container);
        });
    }

    $('head').append('<style>' + Style + '</styel>');
    fullUpdate();

    function cleanupInstanciatedWidgets() {
        _.each(instanciatedWidgets, function(w) {
            w.component.unmount(w.container, w.prefs, w.userId);
        });
        instanciatedWidgets = [];
    }

    function navigateToTab(tab) {
        if (opts.bindTabToHash) {
            location.hash = "#" + tab.id;
        } else {
            cleanupInstanciatedWidgets();
            var actualTab = _.findWhere(userTabs, tab);
            currentTabId = actualTab.id;
            displayTab(actualTab, opts.container);
        }
    }

    if (opts.bindTabToHash) {
        $(window).bind("hashchange", function () {
            var hash = location.hash.replace('#', '');
            cleanupInstanciatedWidgets();
            var actualTab = _.findWhere(userTabs, {id: hash});
            currentTabId = actualTab.id;
            displayTab(actualTab, opts.container);
        });
    }

    function addTab(name) {
        var id = common.uuid();
        var newTab = {
            id: id,
            title: name,
            position: common.findNextPosition(userTabs),
            rows: []
        };
        userTabs.push(newTab);
        return saveTabs().then(function() {
            navigateToTab({ id : id });
        });
    }

    return {
        currentTab: function() {
            return currentTabId;
        },
        getTabs: function() {
            return _.clone(userTabs);
        },
        navigateToTab: navigateToTab,
        removeTab: portalRemoveTab,
        addTab: addTab,
        refresh: fullUpdate
    };
};

exports.registerWidget = Registry.registerWidget;
exports.Widget = Widget;
exports.Portlet = Widget;
exports.Portlé = Widget;
exports.Porclaid = Widget;
exports.Portelaid = Widget;
exports.Porcelet = Widget;
exports.ChooseWidgetPopup = ChooseWidgetPopup;
exports.jQuery = $;
exports.Underscore = _;
exports.Elem = Elem;
exports.EventBus = EventBus;
exports.globalEvents = EventBus();

(function() {
    var code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    var keysDown = [];
    $('body').bind('keydown', function(e) {
        keysDown.push(e.keyCode);
        if (keysDown.join('') !== code.slice(0, keysDown.length).join('')) {
            keysDown = [];
        }
        if (keysDown.length === code.length) {
            keysDown = [];
            exports.globalEvents.trigger('konami', 'show');
        }
    });
    $('body').on('click', '.portal-clickable', function(e) {
        var win = window.open($(this).data('href'), '_blank');
        win.focus();
    });
    $('body').on('mouseup', '.portal-clickable', function(e) {
        $(this).closest('.portal-widget').removeClass('portal-widget-clicked');
    });
    $('body').on('mousedown', '.portal-clickable', function(e) {
        $(this).closest('.portal-widget').addClass('portal-widget-clicked');
    });
})();
