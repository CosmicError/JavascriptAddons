// ==UserScript==
// @name         Color Code Appointment Dates
// @namespace    http://tampermonkey.net/
// @version      2025-02-07
// @description  Highlight upcoming and recent appointments to better draw attention to issues and important events
// @author       Jack V
// @match        https://kennesaw.campus.eab.com/home/staff
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eab.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/CosmicError/JavascriptAddons/refs/heads/main/%5BEAB%5D%20Color-Code%20Appoinments.js
// @updateURL    https://raw.githubusercontent.com/CosmicError/JavascriptAddons/refs/heads/main/%5BEAB%5D%20Color-Code%20Appoinments.js
// ==/UserScript==

(function () {
    const config = {
        minAppointmentTime: 15,
        maxAppointmentTime: 30,

        inpersonMainColor: "#00A36C",
        inpersonBGColor: "#f0f9f5",
        inpersonBorderWidth: 2,

        virtualMainColor: "#505AC9",
        virtualBGColor: "#f4eeff",
        virtualBorderWidth: 2,

        tomorrowEnabled: false,
        tomorrowMainColor: "#fc6a03",
        // tomorrowBGColor: "#fffeeeff",
        // tomorrowBorderWidth: 2,

        anotherDayEnabled: true,
        anotherDayMainColor: "red",
        // anotherDayBGColor: "#ffeeee",
        // anotherDayBorderWidth: 2,

        setupErrorMainColor: "red",
        setupErrorBGColor: "#ffeeee",
        setupErrorBorderWidth: 2,
    };

    class BaseAppointment {
        constructor(trElement) {
            // Reference to the <tr>
            // Example: document.querySelector("#upcoming_appointments > div.gz_table_container > table > tbody > tr")
            this.root = trElement;
            this.cells = Array.from(this.root.querySelectorAll("td"));

            let dateTimeCell = this.cells[2] || null; // date/time cell
            let dateStr = null;
            let timeStr = null;

            if (dateTimeCell) {
                const parts = dateTimeCell.innerHTML.split("<br>").map((p) => p.trim());
                if (parts.length >= 2) {
                    dateStr = parts[0];
                    timeStr = parts[1].replace("ET", "").trim();
                }
            }

            // Parse date string into a Date object
            if (dateStr) {
                const [m, d, y] = dateStr.trim().split("/").map(Number);
                this.dateObj = new Date(y, m - 1, d);
            } else {
                this.dateObj = null;
            }

            this.startTime = null;
            if (this.dateObj && timeStr) {
                const match = timeStr.match(/(\d+):(\d+)\s*([ap]m)/i);
                if (match) {
                    let [, h, min, period] = match.map((v, i) =>
                        i > 0 ? v.toLowerCase() : v
                    );
                    let hour = parseInt(h, 10);
                    const minutes = parseInt(min, 10);

                    if (period === "pm" && hour !== 12) hour += 12;
                    if (period === "am" && hour === 12) hour = 0;

                    this.startTime = new Date(
                        this.dateObj.getFullYear(),
                        this.dateObj.getMonth(),
                        this.dateObj.getDate(),
                        hour,
                        minutes
                    );
                }
            }
        }

        isToday() {
            if (!this.dateObj) return false;
            const now = new Date();
            return (
                this.dateObj.getFullYear() === now.getFullYear() &&
                this.dateObj.getMonth() === now.getMonth() &&
                this.dateObj.getDate() === now.getDate()
            );
        }

        applyStyle({ color, bold, bgColor, outline }) {
            this.root.style.color = color || '';
            this.root.style.fontWeight = bold ? 'bold' : 'normal';
            if (bgColor) this.root.style.backgroundColor = bgColor;
            if (outline) this.root.style.outline = outline;
        }
    }

    class UpcomingAppointment extends BaseAppointment {
        constructor(trElement) {
            super(trElement); // call BaseAppointmentRow constructor first

            this.student = this.cells[3]?.textContent?.trim() || null;
            this.type = this.cells[6]?.textContent?.trim() || null;
            this.duration = null; // need to set to 30 minutes default
        }

        highlight() {
            const now = new Date();

            if (!this.startTime) {
                return;
            }

            // Highlight today's upcoming appointments in green
            if (this.isToday()) {
                const diffMinutes = (this.startTime - now) / (1000 * 60); // minutes until start
                const isVirtual =
                    this.type &&
                    this.type.toLowerCase().includes("virtual") &&
                    this.type.toLowerCase().includes("teams");

                // Determine color theme
                const colorSet = isVirtual
                    ? {
                        base: config.virtualMainColor,
                        bg: config.virtualBGColor,
                        outline: `${config.virtualBorderWidth}px solid ${config.virtualMainColor}`,
                    }
                    : {
                        base: config.inpersonMainColor,
                        bg: config.inpersonBGColor,
                        outline: `${config.inpersonBorderWidth}px solid ${config.inpersonMainColor}`,
                    };

                // Within 60 minutes before start or 30 minutes after start = full highlight
                if (diffMinutes <= 60 && diffMinutes >= -30) {
                    this.applyStyle({
                        color: colorSet.base,
                        bold: true,
                        bgColor: colorSet.bg,
                        outline: colorSet.outline,
                    });
                } else {
                    this.applyStyle({
                        color: colorSet.base,
                        bold: true,
                    });
                }
                return;
            }

            if (new Date(this.dateObj.getFullYear(), this.dateObj.getMonth(), this.dateObj.getDate()).getTime() === new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() && config.tomorrowEnabled)
            {
                this.applyStyle({
                    color: config.tomorrowMainColor,
                    bold: true,
                    // bgColor: config.tomorrowBGColor,
                    // outline: `${config.tomorrowBorderWidth}px solid ${config.tomorrowMainColor}`,
                });
                return;
            }

            if (!config.anotherDayEnabled) {
                return;
            }

            this.applyStyle({
                color: config.anotherDayMainColor,
                bold: true,
                // bgColor: config.anotherDayBGColor,
                // outline: `${config.anotherDayBorderWidth}px solid ${config.anotherDayMainColor}`,
            });
        }
    }

    class RecentAppointment extends BaseAppointment {
        constructor(trElement) {
            super(trElement); // call BaseAppointmentRow constructor first

            this.student = this.cells[6]?.textContent?.trim() || null;
            this.type = null;
            this.duration = null;

            const dateTimeCell = this.cells[2]; // column index for date/time (Recent Appointments)

            if (dateTimeCell) {
                // Example cell content: "11/11/2025 <br> 3:30pm - 4:00pm ET (30m)"
                const text = dateTimeCell.textContent;
                const match = text.match(/\((\d+)m\)/);
                if (match) this.duration = parseInt(match[1], 10);
            }
        }

        highlight() {
            if (this.duration === null && this.cells[8].textContent != 'Not Yet.\n') {
                return;
            }

            if (this.duration >= config.minAppointmentTime && this.duration <= config.maxAppointmentTime && this.cells[8].textContent != 'Not Yet.\n') {
                return;
            }

            this.applyStyle({
                color: config.setupErrorMainColor,
                bold: true,
                bgColor: config.setupErrorBGColor, // red highlight background
                outline: `${config.setupErrorBorderWidth}px solid ${config.setupErrorMainColor}`,
            });
        }
    }

    function highlightAll() {
        // Upcoming table
        document
            .querySelectorAll(
                "#upcoming_appointments > div.gz_table_container > table > tbody > tr"
            )
            .forEach((tr) => {
                const row = new UpcomingAppointment(tr);
                row.highlight();
            });

        // Recent table
        document
            .querySelectorAll(
                "#recent_appointments > div.gz_table_container > table > tbody > tr"
            )
            .forEach((tr) => {
                const row = new RecentAppointment(tr);
                row.highlight();
            });
    }

    // Initial run
    highlightAll();

    const observer = new MutationObserver((mutations) => {
        // Check if appointments tables were changed
        const changed = mutations.some((m) =>
            m.target.closest?.("#upcoming_appointments, #recent_appointments")
        );

        if (changed) {
            highlightAll();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    // DEBUG
    // window.AppointmentObserver = observer;
    // window.highlightAllAppointments = highlightAll;
})();
