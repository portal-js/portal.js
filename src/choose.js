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

function showPopup(Registry, chooseCallback, cancelCallback) {

    if ($('#widgetChooser').length === 0) {
        $('body').append('<div id="widgetChooser"></div>');
    }

    var width = 4;
    var title = 'Nouveau widget';
    var component = undefined;
    var widgets = _.map(_.keys(Registry.registeredWidgets()), function(key) {
        return Registry.registeredWidgets()[key];
    });

    function select(e) {
        e.preventDefault();
        chooseCallback(component, width, undefined);
        window.$('#widgetChooser .modal').modal('toggle');
    }

    function _saveComponent(name) {
        return function(e) {
            e.preventDefault();
            component = name;
            var w = Registry.registeredWidgets()[name];
            $('#sizeSelector option').each(function() {
                $(this).removeAttr('selected');
            });
            width = w.defaultSize || 4;
            $('#sizeSelector [value="' + width + '"]').attr('selected', 'selected');
            if (w.resizable) {
                $('#sizeSelector select').removeAttr('disabled');
            } else {
                $('#sizeSelector select').attr('disabled', 'disabled');
            }
            $('#addWidgetButton').removeAttr('disabled');
            redraw();
        };
    }

    function _saveValue(e) {
        width = e.target.value;
    }

    function _saveTitle(e) {
        title = e.target.value;
    }

    function _filter(e) {
        widgets = _.filter(_.map(_.keys(Registry.registeredWidgets()), function(key) {
            return Registry.registeredWidgets()[key];
        }), function(widget) {
            if (e.target.value === '') return true;
            return (widget.name.toLowerCase().indexOf(e.target.value) > -1) || (widget.description.toLowerCase().indexOf(e.target.value) > -1);
        });
        redraw();
    }

    function renderTableLine(w, selected) {
        var key = w.key;
        selected = selected || 'white';
        return Elem.el('tr', { className: selected, style: { backgroundColor: selected, cursor: 'pointer' }, onclick: _saveComponent(key) },
            Elem.el('td', {},
                Elem.el('div', { className: 'row-fluid'}, [
                    Elem.el('div', { className: 'span3'}, Elem.el('p', w.name)),
                    Elem.el('div', { className: 'span9'}, Elem.el('p', { __asHtml: w.description }))
                ])
            )
        );
    }

    function redraw() {
        var innerTable = (
            Elem.el('table', { className: 'table table-striped table-hover table-condensed' },
                lines(_.chain(widgets))
            )
        );
        Elem.render(innerTable, '#widgetChooser #innertable');
    }

    function lines(wdgts) {
        //    _.map(_.keys(Registry.registeredWidgets()), function(key) {
        //    var w = Registry.registeredWidgets()[key];
        //    return renderTableLine(w);
        //})
        wdgts = wdgts || _.chain(_.keys(Registry.registeredWidgets())).map(function(key) { return Registry.registeredWidgets()[key]; });
        return wdgts.sortBy(function(i) { return i.category; }).groupBy(function(i) { return i.category }).map(function(category) {
            return [
                Elem.el('tr', { style: { backgroundColor: 'lightgrey' }}, Elem.el('td', Elem.el('b', category[0].category)))
            ].concat(_.map(category, function(w) {
                var key = w.key;
                var selected = _.isUndefined(component) ? 'white' : (key === component ? '#d9edf7' : 'white');
                return renderTableLine(w, selected);
            }));
        }).flatten().value()
    }

    var ChooseWidgetPopup = (
        Elem.el('div', { className: "modal"}, [
            Elem.el('div', { className: 'modal-header' }, [
                Elem.el('button', { className: 'close', dataDismiss: 'modal', ariaHidden: 'true' }, { __asHtml: '&times;' }),
                Elem.el('h3', 'Ajouter une application')
            ]),
            Elem.el('div', { className: 'modal-body' }, [
                Elem.el('form', { className: 'form-horizontal' }, [
                    Elem.el('div', { className: 'control-group' }, [
                        Elem.el('label', { className: 'control-label' }, 'Rechercher'),
                        Elem.el('div', { className: 'controls' },
                            Elem.el('input', { type: 'text', onkeydown: _filter, onkeyup: _filter, onkeypress: _filter }, [])
                        )
                    ])
                ]),
                Elem.el('div', { id: 'innertable' },
                    Elem.el('table', { className: 'table table-striped table-hover table-condensed' }, lines())
                )
            ]),
            Elem.el('div', { className: 'modal-footer' }, [
                Elem.el('form', { className: 'form-horizontal' }, [
                    Elem.el('div', { id: 'sizeSelector', className: 'control-group' }, [
                        Elem.el('label', { className: 'control-label' }, 'Largeur (3 à 12)'),
                        Elem.el('div', { className: 'controls' },
                            Elem.el('select', { ref: 'widthSelector', value: width, onchange: _saveValue }, [
                                Elem.el('option', { value: '3'}, '3'),
                                Elem.el('option', { value: '4', selected: 'selected' }, '4'),
                                Elem.el('option', { value: '5'}, '5'),
                                Elem.el('option', { value: '6'}, '6'),
                                Elem.el('option', { value: '7'}, '7'),
                                Elem.el('option', { value: '8'}, '8'),
                                Elem.el('option', { value: '9'}, '9'),
                                Elem.el('option', { value: '10'}, '10'),
                                Elem.el('option', { value: '11'}, '11'),
                                Elem.el('option', { value: '12'}, '12')
                            ])
                        )
                    ])
                ]),
                Elem.el('a', { className: 'btn', dataDismiss: 'modal', ariaHidden: 'true' }, 'Fermer'),
                Elem.el('a', { className: 'btn btn-primary', id: 'addWidgetButton', onclick: select }, 'Ajouter')
            ])
        ])
    );

    Elem.render(ChooseWidgetPopup, '#widgetChooser');
    $('#addWidgetButton').attr('disabled', 'disabled');
    window.$('#widgetChooser .modal').modal({ show: true });
};

module.exports = {
    show: showPopup
};
