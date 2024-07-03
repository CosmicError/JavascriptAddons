// ==UserScript==
// @name         Color Code Appointment Dates
// @namespace    http://tampermonkey.net/
// @version      2024-06-13
// @description  try to take over the world!
// @author       You
// @match        https://kennesaw.campus.eab.com/home/staff
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eab.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to check if the element exists and execute code
    function appointmentColorCode() {
        let appointments = document.querySelector("#upcoming_appointments > div.gz_table_container > table > tbody");

        if (appointments) {
            // Get today's date in the format 'MM/DD/YYYY'
            let today = new Date();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
            let yyyy = today.getFullYear();
            let todayFormatted = mm + '/' + dd + '/' + yyyy;

            Array.from(appointments.children).forEach(appointment => {
                // Compare the dates and execute code if they match
                if (todayFormatted === appointment.querySelector("td:nth-child(3)").textContent.slice(0, 10)) {
                    appointment.style.color = "#00A36C";
                    appointment.style.fontWeight = "bold";
                } else {
                    appointment.style.color = "red";
                }
            });

            // Disconnect the observer after the element is found and processed
            observer.disconnect();
        }
    }

    // Create a MutationObserver to watch for changes in the DOM
    let observer = new MutationObserver(appointmentColorCode);

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check in case the element already exists
    appointmentColorCode();
})();
