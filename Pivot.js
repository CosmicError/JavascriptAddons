// ==UserScript==
// @name         Pivot
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       Anonymous
// @match        https://app.pivotinteractives.com/assignments/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let allowedQuestionTypes = ["MultipleChoiceQuestion", "NumericalQuestion", "GridGraphQuestion"]
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
        // wait for the feth to finish, then convert to json
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
        // wait for the feth to finish, then convert to json
        let activityData = await webResponseActivity.json();
        let sections = activityData.sections;
        // run though all the different lab sections
        for (let i = 0; i < sections.length; i++) {
            //create new answer group for section
            console.group(sections[i].name)
            // run through all the components of the lab section
            for (let x = 0; x < sections[i].components.length; x++) {
                //check for question type and handle approprietly
                if (sections[i].components[x].componentType == allowedQuestionTypes[0]) { // Multiple Choice
                    // run through all answer choices
                    for (let y = 0; y < sections[i].components[x].choices.length; y++) {
                        // if the correct answer, then, log it to console
                        if (sections[i].components[x].choices[y].answer == true) {
                            console.log("Question "+x+"; Answer: "+multipleChoice[y]);
                        };
                    };
                } else if (sections[i].components[x].componentType == allowedQuestionTypes[1]) { // Numeric
                    // run through all the different answers for the assignment
                    for (let y = 0; y < sections[i].components[x].conditions.length; y++) {
                        // if the answer is correct
                        if (sections[i].components[x].conditions[y].isCorrect == true) {
                            // splice the correct answer approprietly
                            let answer = sections[i].components[x].conditions[y].condition;
                            if (sections[i].components[x].conditions[y].condition.includes("==")) {
                                answer = sections[i].components[x].conditions[y].condition.split("==")[1];
                            };
                            // make sure varibles exist otherwise if they dont then it will error
                            if (activityData.variables.length > 0) {
                                // replace all variables with their actual meaning
                                for (let a = 0; a < activityData.variables.length; a++) {
                                    if (answer.includes(activityData.variables[a].id)) {
                                        // Remove irrelevant characters
                                        answer = answer.replace("$", "");
                                        answer = answer.replace(activityData.variables[a].id, activityData.variables[a].name);
                                    };
                                };
                            };
                            // if the answer is specific to a certain trial, then make sure it is the trial assigned to the user
                            if (answer.includes("?")) {
                                if (answer.split("?")[0] == responseData.variables[1].value) {
                                    console.log("Question "+x+"; Answer: "+answer.split("?")[1].split(":")[0]);
                                };
                            // if the answer is not specific to a certain trial, then just print the answer as long as its correct
                            } else {
                                console.log("Question "+x+"; Answer: "+answer);
                            };
                        };
                    };
                } else if (sections[i].components[x].componentType == allowedQuestionTypes[2]) { // Graph/Table
                    // make sure the table has an answer
                    if (sections[i].components[x].answer) {
                        let answer = JSON.parse(sections[i].components[x].answer);
                        // create new question group so all tables are grouped under the same question
                        console.groupCollapsed("Question "+x+"; Table:")
                        // run through all the correct table answers
                        for (let y = 0; y < answer.columns.length; y++) {
                            let Data = answer.columns[y].data
                            // make sure the tables aren't empty, if they are then remove them if possible
                            if (Data.toString().trim() != ','.repeat(answer.columns[y].data.length-1)) {
                                // Group the table
                                console.groupCollapsed("Column "+y+" Data ["+answer.columns[y].name+" ("+answer.columns[y].units+")]");
                                console.table(Data)
                                console.groupEnd("Column "+y+" Data ["+answer.columns[y].name+" ("+answer.columns[y].units+")]");
                            };
                        };
                        // CLose question group
                        console.groupEnd("Question "+x)
                    };
                };
            };
            // CLose section group
            console.groupEnd(sections[i].name)
        };
    };
    getData();
})();
