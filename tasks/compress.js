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

var AdmZip = require('adm-zip');
var fs = require('fs');
var colors = require('colors');
var mkdirp = require('mkdirp');

zipFileName = 'target/portaljs.zip';

var zip = new AdmZip();

zip.addLocalFile("dist/portal.js");
zip.addLocalFile("dist/portal.min.js");
zip.addLocalFile("dist/portal.min.map");

mkdirp('target', function(err) {
  console.log('Writing to ' + zipFileName.red);
  zip.writeZip(zipFileName);
});
