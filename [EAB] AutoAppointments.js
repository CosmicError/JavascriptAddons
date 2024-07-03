// ==UserScript==
// @name         Redirect To Staff Home / Appointments
// @namespace    http://tampermonkey.net/
// @version      2024-06-07
// @description  try to take over the world!
// @author       You
// @match        https://kennesaw.campus.eab.com/home
// @match        https://kennesaw.campus.eab.com/home/staff
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eab.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // redirect to staff page if not already there
    if (window.location.href != "https://kennesaw.campus.eab.com/home/staff") {
        window.location.replace("https://kennesaw.campus.eab.com/home/staff");
    }

    window.addEventListener('DOMContentLoaded', function () {
        document.querySelector("#ui-tab_appointments").click()
    })
})();
