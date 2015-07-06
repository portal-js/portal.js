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
 
var _ = require('underscore');

function uuid() {
    var d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
}

function findNextPosition(arr) {
    var pos = -1;
    _.each(arr, function(item) {
        if (item.position) {
            pos = item.position;
        }
    });
    return pos + 1;
}

exports.uuid = uuid;
exports.findNextPosition = findNextPosition;
exports.ifPredicate = function(predicate, what) {
    if (_.isFunction(predicate)) {
        if (predicate() === true) {
            return what;
        } else {
            return undefined;
        }
    } else {
        if (predicate === true) {
            return what;
        } else {
            return undefined;
        }
    }
};

exports.queryParam = function(key) {
    var m, r, re;
    re = new RegExp("(?:\\?|&)" + key + "=(.*?)(?=&|$)", "gi");
    r = [];
    m = void 0;
    while ((m = re.exec(document.location.search)) != null) {
        r.push(m[1]);
    }
    if (r.length > 0) {
        return r[0];
    } else {
        return undefined;
    }
};

exports.has3d = function(document) {
    var el = document.createElement('p'),
    has3d,
    transforms = {
        'webkitTransform':'-webkit-transform',
        'OTransform':'-o-transform',
        'msTransform':'-ms-transform',
        'MozTransform':'-moz-transform',
        'transform':'transform'
    };
    // Add it to the body to get the computed style
    document.body.insertBefore(el, null);
    for(var t in transforms){
        if (transforms.hasOwnProperty(t)) {
            if (el.style[t] !== undefined) {
                el.style[t] = 'translate3d(1px,1px,1px)';
                has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
            }
        }
    }
    document.body.removeChild(el);
    return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
};
