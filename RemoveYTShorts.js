// ==UserScript==
// @name         Remove YT Shorts
// @namespace    http://tampermonkey.net/
// @version      2024-06-28
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com
// @match        https://www.youtube.com/watch?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function searchAndRemove() {
        let shorts_button = document.querySelector("#items > ytd-guide-entry-renderer:nth-child(2)")

        if (shorts_button) {
            let shorts_button_internal = shorts_button.querySelector("#endpoint")

            if (shorts_button_internal && shorts_button_internal.title == 'Shorts') {
                shorts_button.remove()
            }
        }

        let shorts = null;
        if (window.location.href == 'https://www.youtube.com') {
            shorts = document.querySelectorAll("#contents > ytd-rich-section-renderer");

        } else {
            shorts = document.querySelectorAll("#contents > ytd-reel-shelf-renderer");

        }

        if (shorts == null) {
            return;
        }

        if (shorts.length == 0) {
            return;
        }

        for (let element of shorts) {
            element.remove();
        }

        console.log("Removed Shorts!");
    }

    let observer = new MutationObserver(searchAndRemove);
    observer.observe(document.body, {childList: true, subtree: true});

    searchAndRemove();
})();
