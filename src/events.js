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

module.exports = function() {
  var callbacks = {};
  return {
    on: function(name, callback) {
      var events = callbacks[name] || (callbacks[name] = []);
      events.push(callback);
    },
    off: function(name, callback) {
      var events = callbacks[name] || [];
      callbacks[name] = _.filter(events, function(cb) {
        return cb !== callback;
      });
    },
    trigger: function(name, payload) {
      var events = callbacks[name] || [];
      _.each(events, function(callback) {
        callback(payload);
      });
      var all = callbacks['*'] || [];
      _.each(all, function(callback) {
        callback(name, payload);
      });
    }
  };
};
