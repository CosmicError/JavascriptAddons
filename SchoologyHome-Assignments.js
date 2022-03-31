// ==UserScript==
// @name         SchoologyHome-Assignments
// @namespace    http://tampermonkey.net/
// @version      1.2.4
// @description  Sort Overdue and Upcoming Assignments by class -> date
// @author       Jack
// @match        *://*.schoology.com
// @match        *://*.schoology.com/home
// @match        *://*.schoology.com/home/recent-activity
// @match        *://*.schoology.com/home/course-dashboard
// @grant        none
// ==/UserScript==


'use strict';
window.addEventListener('load', function() {
    //FUCNTIONS
    function getClass(obj) {
        return obj.querySelector("h4 > span.infotip.sCommonInfotip-processed").getAttribute("aria-label").split(" :")[0].replaceAll("&amp;", "&");
    };

    function newHeader(str, obj, x = "") {
        let a = document.createElement("div");
        let b = document.createElement("h4");
        a.setAttribute("class", "date-header  " + x + " sEventUpcoming-processed");
        b.innerText = str;
        a.appendChild(b);
        obj.appendChild(a);
        return a;
    };

    let overdueCol = document.querySelector("#overdue-submissions > div");
    let upcomingCol = document.querySelector("#right-column-inner > div.upcoming-events.upcoming-events-wrapper.sEventUpcoming-processed > div");
    let overdueAssign = [];
    let upcomingAssign = [];
    let className = [];
    let uclassName = [];
    let classElement = [];
    let uclassElement = [];

    //REMOVE HIDDEN ITEMS
    while (document.querySelectorAll(".upcoming-event.course-event.hidden").length) {
        document.querySelectorAll(".upcoming-event.course-event.hidden")[0].remove();
    };

    //ASSIGN ALL ASSIGNMENT TO PROPER LIST
    for (var i = 0; i < document.querySelectorAll(".upcoming-event.course-event").length; i++) {
        try {
            document.querySelectorAll(".upcoming-event.course-event")[i].querySelector("h4 > span > span.upcoming-time.singleday").innerText;
        } catch {
            var nSpan = document.createElement("span");
            nSpan.setAttribute("class", "upcoming-time singleday");
            nSpan.innerText = "NT";
            document.querySelectorAll(".upcoming-event.course-event")[i].querySelector("h4 > span").appendChild(nSpan);
        };
        var text = document.querySelectorAll(".upcoming-event.course-event")[i].querySelector("h4 > span > span.upcoming-time.singleday");
        if (document.querySelectorAll(".upcoming-event.course-event")[i].parentElement.parentElement.getAttribute("class") == "overdue-submissions overdue-submissions-wrapper") {
            if (document.querySelectorAll(".upcoming-event.course-event")[i].previousSibling.getAttribute("class") == "upcoming-event course-event") {
                var date = document.querySelectorAll(".upcoming-event.course-event")[i].previousSibling.querySelector("h4 > span > span.upcoming-time.singleday").innerText.split(" | ")[0];
            } else {
                date = document.querySelectorAll(".upcoming-event.course-event")[i].previousSibling.querySelector("h4").innerText;
            };
            overdueAssign.push(document.querySelectorAll(".upcoming-event.course-event")[i]);
        };
        if (document.querySelectorAll(".upcoming-event.course-event")[i].parentElement.parentElement.getAttribute("class") == "upcoming-events upcoming-events-wrapper sEventUpcoming-processed") {
            if (document.querySelectorAll(".upcoming-event.course-event")[i].previousSibling.getAttribute("class") == "date-header first today sEventUpcoming-processed"
                || document.querySelectorAll(".upcoming-event.course-event")[i].previousSibling.getAttribute("class") == "date-header first tomorrow sEventUpcoming-processed"
                || document.querySelectorAll(".upcoming-event.course-event")[i].previousSibling.getAttribute("class") == "date-header  today sEventUpcoming-processed"
                || document.querySelectorAll(".upcoming-event.course-event")[i].previousSibling.getAttribute("class") == "date-header  tomorrow sEventUpcoming-processed") {
                date = document.querySelectorAll(".upcoming-event.course-event")[i].previousSibling.querySelector("h4").innerText;
            } else {
                date = document.querySelectorAll(".upcoming-event.course-event")[i].previousSibling.querySelector("h4 > span > span.upcoming-time.singleday").innerText.split(" | ")[0];
            };
            upcomingAssign.push(document.querySelectorAll(".upcoming-event.course-event")[i]);
        };
        text.innerText = date + ' | ' + text.innerText;
    };

    //GET CLASS NAMES
    for (i = 0; i < overdueAssign.length; i++) {
        if (!className.includes(getClass(overdueAssign[i]))) {
            className.push(getClass(overdueAssign[i]));
        };
    };
    for (i = 0; i < upcomingAssign.length; i++) {
        if (!uclassName.includes(getClass(upcomingAssign[i]))) {
            uclassName.push(getClass(upcomingAssign[i]));
        };
    };

    //REMOVE OLD HEADERS
    while (overdueCol.querySelector("#overdue-submissions > div > div.date-header.sEventUpcoming-processed")) {
        overdueCol.querySelector("#overdue-submissions > div > div.date-header.sEventUpcoming-processed").remove();
    };
    if (upcomingCol.querySelector("#right-column-inner > div.upcoming-events.upcoming-events-wrapper.sEventUpcoming-processed > div > div.date-header.first.today.sEventUpcoming-processed")) {
        upcomingCol.querySelector("#right-column-inner > div.upcoming-events.upcoming-events-wrapper.sEventUpcoming-processed > div > div.date-header.first.today.sEventUpcoming-processed").remove();
    };
    if (upcomingCol.querySelector("#right-column-inner > div.upcoming-events.upcoming-events-wrapper.sEventUpcoming-processed > div > div.date-header.today.sEventUpcoming-processed")) {
        upcomingCol.querySelector("#right-column-inner > div.upcoming-events.upcoming-events-wrapper.sEventUpcoming-processed > div > div.date-header.today.sEventUpcoming-processed").remove();
    };
    while (upcomingCol.querySelector("#right-column-inner > div.upcoming-events.upcoming-events-wrapper.sEventUpcoming-processed > div > div.date-header.tomorrow.sEventUpcoming-processed")) {
        upcomingCol.querySelector("#right-column-inner > div.upcoming-events.upcoming-events-wrapper.sEventUpcoming-processed > div > div.date-header.tomorrow.sEventUpcoming-processed").remove();
    };
    if (upcomingCol.querySelector("#right-column-inner > div.upcoming-events.upcoming-events-wrapper.sEventUpcoming-processed > div > div.date-header.first.tomorrow.sEventUpcoming-processed")) {
        upcomingCol.querySelector("#right-column-inner > div.upcoming-events.upcoming-events-wrapper.sEventUpcoming-processed > div > div.date-header.first.tomorrow.sEventUpcoming-processed").remove();
    };

    //ASSIGN NEW HEADERS
    for (i = 0; i < className.length; i++) {
        classElement.push(newHeader(className[i], overdueCol));
    };
    for (i = 0; i < uclassName.length; i++) {
        uclassElement.push(newHeader(uclassName[i], upcomingCol, "tomorrow"));
    };

    //SORT ASSIGNMENT INTO NEW HEADERS BY CLASS
    for (i = 0; i < overdueAssign.length; i++) {
        if (overdueAssign[i].parentElement.parentElement.getAttribute("class") == "overdue-submissions overdue-submissions-wrapper") {
            overdueCol.insertBefore(overdueAssign[i], classElement[className.indexOf(getClass(overdueAssign[i])) + 1]);
        };
    };
    for (i = 0; i < upcomingAssign.length; i++) {
        if (upcomingAssign[i].parentElement.parentElement.getAttribute("class") == "upcoming-events upcoming-events-wrapper sEventUpcoming-processed") {
            upcomingCol.insertBefore(upcomingAssign[i], uclassElement[uclassName.indexOf(getClass(upcomingAssign[i])) + 1]);
        };
    };
});
