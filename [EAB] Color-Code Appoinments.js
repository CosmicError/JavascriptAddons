// ==UserScript==
// @name         Color Code Appointment Dates
// @namespace    http://tampermonkey.net/
// @version      2025-02-07
// @description  try to take over the world!
// @author       You
// @match        https://kennesaw.campus.eab.com/home/staff
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eab.com
// @grant        none
// ==/UserScript==

(function() {

    const minTime = 10;
    const maxTime = 30;

    'use strict';

    function parseDate(dateStr) {
        if (!dateStr) return null;

        // Example format: "02/05/2025"
        let parts = dateStr.trim().split('/');
        if (parts.length !== 3) return null;

        let month = parseInt(parts[0], 10) - 1; // Convert MM to zero-based index
        let day = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);

        return new Date(year, month, day);
    }

    function parseTimeRange(dateObj, timeStr) {
        if (!timeStr || !dateObj) return null;

        // Remove "ET" and extra spaces
        timeStr = timeStr.replace("ET", "").trim();

        // Match time ranges (e.g., "2:22pm - 2:52pm")
        let match = timeStr.match(/(\d+):(\d+)\s*([ap]m)\s*-\s*(\d+):(\d+)\s*([ap]m)/i);
        if (!match) return null;

        let startHours = parseInt(match[1], 10);
        let startMinutes = parseInt(match[2], 10);
        let startPeriod = match[3].toLowerCase();

        let endHours = parseInt(match[4], 10);
        let endMinutes = parseInt(match[5], 10);
        let endPeriod = match[6].toLowerCase();

        // Convert start time to 24-hour format
        if (startPeriod === "pm" && startHours !== 12) startHours += 12;
        if (startPeriod === "am" && startHours === 12) startHours = 0;

        // Convert end time to 24-hour format
        if (endPeriod === "pm" && endHours !== 12) endHours += 12;
        if (endPeriod === "am" && endHours === 12) endHours = 0;

        let startTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), startHours, startMinutes, 0);
        let endTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), endHours, endMinutes, 0);

        return { startTime, endTime };
    }

    function extractDateTime(tdElement) {
        if (!tdElement) return { date: null, timeRange: null };

        // Split content by <br> and clean up whitespace
        let parts = tdElement.innerHTML.split('<br>').map(part => part.trim());

        if (parts.length < 2) return { date: null, timeRange: null }; // Ensure both date and time exist

        let dateStr = parts[0]; // First line is the date
        let timeRangeStr = parts[1].replace("ET", "").trim(); // Second line is the time, remove "ET"

        return { date: dateStr, timeRange: timeRangeStr };
    }

    function highlightRecentAppointments() {
        let recentAppointmentsContainer = document.querySelector("#recent_appointments > div.gz_table_container > table > tbody");
        if (!recentAppointmentsContainer) return;

        let now = new Date();
        now.setSeconds(0, 0); // Remove seconds for accuracy

        Array.from(recentAppointmentsContainer.children).forEach(appointment => {
            let timeCell = appointment.querySelector("td:nth-child(3)"); // Extract time column
            if (!timeCell) return;

            let { date: appointmentDate, timeRange } = extractDateTime(timeCell);
            if (!appointmentDate || !timeRange) {
                console.error("Skipping row due to invalid extraction:", timeCell.innerHTML);
                return;
            }

            let parsedDate = parseDate(appointmentDate);
            let parsedTimeRange = parseTimeRange(parsedDate, timeRange);

            if (!parsedDate || !parsedTimeRange) return;

            let { startTime, endTime } = parsedTimeRange;
            let duration = (endTime - startTime) / (1000 * 60); // Minutes

            if (duration < minTime || duration > maxTime) {
                appointment.style.color = "red";
                appointment.style.fontWeight = "bold";
            } else {
                appointment.style.color = "black";
            }
        });
    }

    function highlightUpcomingAppointments() {
        let upcomingAppointmentsContainer = document.querySelector("#upcoming_appointments > div.gz_table_container > table > tbody");
        if (!upcomingAppointmentsContainer) return;

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        let yyyy = today.getFullYear();
        let todayFormatted = `${mm}/${dd}/${yyyy}`;

        Array.from(upcomingAppointmentsContainer.children).forEach(appointment => {
            let dateCell = appointment.querySelector("td:nth-child(3)"); // Get date column
            if (!dateCell) return;

            let { date: appointmentDate } = extractDateTime(dateCell);
            if (!appointmentDate) {
                console.error("Skipping upcoming row due to invalid extraction:", dateCell.innerHTML);
                return;
            }

            if (appointmentDate === todayFormatted) {
                appointment.style.color = "#00A36C"; // Green for today
                appointment.style.fontWeight = "bold";
            } else {
                appointment.style.color = "red"; // Red for future
            }
        });
    }

    function runHighlighting() {
        highlightRecentAppointments();
        highlightUpcomingAppointments(); // Add this line back
    }

    // Create a MutationObserver to watch for DOM changes
    let observer = new MutationObserver(runHighlighting);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check
    runHighlighting();
})();
