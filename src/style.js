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
 
module.exports = '' +
    '.dotted {'+
    '    border: dashed;'+
    '    border-color: grey;'+
    '    border-width: 1px;'+
    '}'+
    '.portal-row {}'+
    '.portal-clickable {cursor: pointer;}'+
    '.portal-widget {'+
    '    background-color: #ffffff;'+
    '    border: solid;'+
    '    border-width: 1px;'+
    '    border-color: #eee;'+
    '    margin-top: 10px;'+
    '    margin-bottom: 10px;'+
    '    box-shadow: 5px 5px 5px 0px lightgrey;' +
    '    -moz-box-shadow: 5px 5px 5px 0px lightgrey;' +
    '    -webkit-box-shadow: 5px 5px 5px 0px lightgrey;' +
    '}'+
    '.portal-widget-clicked {'+
    '    margin-top: 15px;'+
    '    margin-left: 5px!important;'+
    '    box-shadow: none;' +
    '    -moz-box-shadow: none;' +
    '    -webkit-box-shadow: none;' +
    '}'+
    '.portal-widget-bar {'+
    '    border-bottom-style: solid;'+
    '    border-bottom-color: #eee;'+
    '    border-bottom-width: 1px;'+
    '}'+
    '.portal-widget-body {'+
    '    padding: 10px;'+
    '}'+
    '/* entire container, keeps perspective */'+
    '.flip-container {'+
    '    perspective: 1000px;'+
    '    -moz-perspective: 1000px;'+
    '    -webkit-perspective: 1000px;'+
    '}'+
    '/* flip the pane when hovered */'+
    '.flip-container.flip .flipper {'+
    '    transform: rotateY(180deg);'+
    '    -moz-transform: rotateY(180deg);'+
    '    -webkit-transform: rotateY(180deg);'+
    '    -ms-transform: rotateY(0deg);'+
    '}'+
    '.flip-container.flip .back {'+
    '    -ms-transform: rotateY(0deg);'+
    '}'+
    '.flip-container.flip .front {'+
    '    -ms-transform: rotateY(180deg);'+
    '}'+
    '/* flip speed goes here */'+
    '.flipper {'+
    '    transition: 0.6s;'+
    '    -moz-transition: 0.6s;'+
    '    -webkit-transition: 0.6s;'+
    '    transform-style: preserve-3d;'+
    '    -moz-transform-style: preserve-3d;'+
    '    -webkit-transform-style: preserve-3d;'+
    '    position: relative;'+
    '}'+
    '/* hide back of pane during swap */'+
    '.front, .back {'+
    '    backface-visibility: hidden;'+
    '    -moz-backface-visibility: hidden;'+
    '    -webkit-backface-visibility: hidden;'+
    '}'+
    '.back {' +
    '    position: absolute;'+
    '    top: 0;'+
    '    left: 0;'+
    '    width: 100%;'+
    '    height: 100%;'+
    '}' +
    '/* front pane, placed above back */'+
    '.front {'+
    '    z-index: 2;'+
    '    /* for firefox 31 */'+
    '    transform: rotateY(0deg);'+
    '    -moz-transform: rotateY(0deg);'+
    '    -webkit-transform: rotateY(0deg);'+
    '}'+
    '/* back, initially hidden pane */'+
    '.back {'+
    '    transform: rotateY(180deg);'+
    '    -moz-transform: rotateY(180deg);'+
    '    -webkit-transform: rotateY(180deg);'+
    '}'+
    '.portal-pref {'+
    '    padding: 10px;'+
    '}'+
    '.portal-widget-draggedon  {'+
    '    border: solid;'+
    '    border-width: 1px;'+
    '    border-color: #00008B;'+
    '    margin-bottom: 20px;'+
    '}';
