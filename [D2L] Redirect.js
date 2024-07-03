// ==UserScript==
// @name         D2L Redirect
// @namespace    http://tampermonkey.net/
// @version      2024-06-07
// @description  try to take over the world!
// @author       You
// @match        https://d2l.kennesaw.edu/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kennesaw.edu
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    window.location.replace("https://kennesaw.view.usg.edu/d2l/home");
})();
