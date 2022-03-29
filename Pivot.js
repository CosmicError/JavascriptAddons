// ==UserScript==
// @name         Pivot
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       Anonymous
// @match        app.pivotinteractives.com/assignments/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let allowedQuestionTypes = ["MultipleChoiceQuestion", "NumericalQuestion"]
    let multipleChoice = ["A", "B", "C", "D", "E", "F", "G"]

    async function getData() {
        let webResponseResponse = await fetch("https://api.pivotinteractives.com/api/v3/assignments/" + document.URL.split("/")[4] + "/response?_xff=editor", {
            "headers": {
                "accept": "application/json, text/plain, * /* ",
                "accept-language": "en-US,en;q=0.9",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Opera\";v=\"84\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            "referrer": "https://app.pivotinteractives.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });
        let responseData = await webResponseResponse.json();

        let webResponseActivity = await fetch("https://api.pivotinteractives.com/api/v3/assignments/" + document.URL.split("/")[4] + "/activity?_xff=editor", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\", \"Opera\";v=\"84\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            "referrer": "https://app.pivotinteractives.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });
        let activityData = await webResponseActivity.json();
        let sections = activityData.sections;
        // run though all the different lab sections
        for (let i = 0; i < sections.length; i++) {
            // run through all the components of the lab section
            for (let x = 0; x < sections[i].components.length; x++) {
                //check for answer type and handle approprietly
                if (sections[i].components[x].componentType == allowedQuestionTypes[0]) {
                    for (let y = 0; y < sections[i].components[x].choices.length; y++) {
                        if (sections[i].components[x].choices[y].answer == true) {
                            console.log(sections[i].name+"; Question "+x+"; Answer Choice: "+multipleChoice[y]);
                        };
                    };
                } else if (sections[i].components[x].componentType == allowedQuestionTypes[1]) {
                    for (let y = 0; y < sections[i].components[x].conditions.length; y++) {
                        if (sections[i].components[x].conditions[y].isCorrect == true) {
                            let answer = sections[i].components[x].conditions[y].condition;
                            if (sections[i].components[x].conditions[y].condition.includes("==")) {
                                answer = sections[i].components[x].conditions[y].condition.split("==")[1];
                            }
                            for (let a = 0; a < activityData.variables.length; a++) {
                                if (answer.includes(activityData.variables[a].id)) {
                                    answer = answer.replace("$", "")
                                    answer = answer.replace(activityData.variables[a].id, activityData.variables[a].name)
                                }
                            }
                            if (answer.includes("?")) {
                                if (answer.split("?")[0] == responseData.variables[1].value) {
                                    console.log(sections[i].name+"; Question "+x+"; Answer: "+answer.split("?")[1].split(":")[0]);
                                }
                            } else {
                                console.log(sections[i].name+"; Question "+x+"; Answer: "+answer);
                            }
                        };
                    };
                };
            };
        };
    };
    getData();
})();
