// ==UserScript==
// @name         VitalSource Auto Guest
// @namespace    http://tampermonkey.net/
// @version      2024-06-25
// @description  try to take over the world!
// @author       You
// @match        https://login.vitalsource.com/user/sso?brand=*.vitalsource.com&redirect_uri=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vitalsource.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    var link = null;

    function redirectWhenReady() {
        var form = document.querySelector("#update-email-form");

        if (!form) {
            return;
        }

        for (let element of form.children) {
            if (element.lang != '') {
                continue;
            }
            link = element.firstChild.href;
            break;
        }

        if (link != null) {
            observer.disconnect();
            window.location.replace(link);
        }
    }

    let observer = new MutationObserver(redirectWhenReady);
    observer.observe(document.body, {childList: true, subtree: true});

    redirectWhenReady()

})();
