/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*****************************!*\
  !*** ./src/context_menu.js ***!
  \*****************************/
//import * as $ from "jquery";

let configuration;
let openai;

//(async () => {
//    const relativePath = './.open_api_key_file';
//    const url = chrome.runtime.getURL(relativePath);
//    const response = await fetch(url);
//
//    configuration = new Configuration({
//        apiKey: key
//    });
//    openai = new OpenAIApi(configuration);
//})();


async function callApi(req, res) {
    if (!configuration.apiKey) {
        console.error("OpenAI API key not configured, please follow instructions in README.md");
        return;
    }

    const jobDescription = "ATTENTION: PLACEHOLDER";
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: generatePrompt(jobDescription),
            temperature: 0.6,
        });
        res.status(200).json({ result: completion.data.choices[0].text });
    } catch(error) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
            console.error(error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            res.status(500).json({
                error: {
                    message: 'An error occurred during your request.',
                }
            });
        }
    }
}

// Patch the job description into my resume.
function generatePrompt(jobDescription) {
}


function contextOnClick(info) {
    switch (info.menuItemId) {
        case 'selection':
            store(info.selectionText);
            break;
        case 'editable':
            break;
        default:
            // Standard context menu item function
            console.error('No action for this menu item.');
    }
}

chrome.contextMenus.onClicked.addListener(contextOnClick);

chrome.runtime.onInstalled.addListener(function () {

    let contexts = [
        'selection',
        'editable',
    ];

    for (let i = 0; i < contexts.length; i++) {
        let context = contexts[i];
        let title = "Test '" + context + "' menu item";
        chrome.contextMenus.create({
            title: title,
            contexts: [context],
            id: context,
        });
    }
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dF9tZW51LmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsK0JBQStCLHlDQUF5QztBQUN4RSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1YsNERBQTRELGNBQWM7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IscUJBQXFCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9zcmMvY29udGV4dF9tZW51LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vaW1wb3J0ICogYXMgJCBmcm9tIFwianF1ZXJ5XCI7XHJcblxyXG5sZXQgY29uZmlndXJhdGlvbjtcclxubGV0IG9wZW5haTtcclxuXHJcbi8vKGFzeW5jICgpID0+IHtcclxuLy8gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gJy4vLm9wZW5fYXBpX2tleV9maWxlJztcclxuLy8gICAgY29uc3QgdXJsID0gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKHJlbGF0aXZlUGF0aCk7XHJcbi8vICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcclxuLy9cclxuLy8gICAgY29uZmlndXJhdGlvbiA9IG5ldyBDb25maWd1cmF0aW9uKHtcclxuLy8gICAgICAgIGFwaUtleToga2V5XHJcbi8vICAgIH0pO1xyXG4vLyAgICBvcGVuYWkgPSBuZXcgT3BlbkFJQXBpKGNvbmZpZ3VyYXRpb24pO1xyXG4vL30pKCk7XHJcblxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2FsbEFwaShyZXEsIHJlcykge1xyXG4gICAgaWYgKCFjb25maWd1cmF0aW9uLmFwaUtleSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJPcGVuQUkgQVBJIGtleSBub3QgY29uZmlndXJlZCwgcGxlYXNlIGZvbGxvdyBpbnN0cnVjdGlvbnMgaW4gUkVBRE1FLm1kXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBqb2JEZXNjcmlwdGlvbiA9IFwiQVRURU5USU9OOiBQTEFDRUhPTERFUlwiO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBjb21wbGV0aW9uID0gYXdhaXQgb3BlbmFpLmNyZWF0ZUNvbXBsZXRpb24oe1xyXG4gICAgICAgICAgICBtb2RlbDogXCJ0ZXh0LWRhdmluY2ktMDAzXCIsXHJcbiAgICAgICAgICAgIHByb21wdDogZ2VuZXJhdGVQcm9tcHQoam9iRGVzY3JpcHRpb24pLFxyXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC42LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgcmVzdWx0OiBjb21wbGV0aW9uLmRhdGEuY2hvaWNlc1swXS50ZXh0IH0pO1xyXG4gICAgfSBjYXRjaChlcnJvcikge1xyXG4gICAgICAgIC8vIENvbnNpZGVyIGFkanVzdGluZyB0aGUgZXJyb3IgaGFuZGxpbmcgbG9naWMgZm9yIHlvdXIgdXNlIGNhc2VcclxuICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvci5yZXNwb25zZS5zdGF0dXMsIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzKGVycm9yLnJlc3BvbnNlLnN0YXR1cykuanNvbihlcnJvci5yZXNwb25zZS5kYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciB3aXRoIE9wZW5BSSBBUEkgcmVxdWVzdDogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgICAgICAgICAgICBlcnJvcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBbiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgeW91ciByZXF1ZXN0LicsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gUGF0Y2ggdGhlIGpvYiBkZXNjcmlwdGlvbiBpbnRvIG15IHJlc3VtZS5cclxuZnVuY3Rpb24gZ2VuZXJhdGVQcm9tcHQoam9iRGVzY3JpcHRpb24pIHtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNvbnRleHRPbkNsaWNrKGluZm8pIHtcclxuICAgIHN3aXRjaCAoaW5mby5tZW51SXRlbUlkKSB7XHJcbiAgICAgICAgY2FzZSAnc2VsZWN0aW9uJzpcclxuICAgICAgICAgICAgc3RvcmUoaW5mby5zZWxlY3Rpb25UZXh0KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnZWRpdGFibGUnOlxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvLyBTdGFuZGFyZCBjb250ZXh0IG1lbnUgaXRlbSBmdW5jdGlvblxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdObyBhY3Rpb24gZm9yIHRoaXMgbWVudSBpdGVtLicpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jaHJvbWUuY29udGV4dE1lbnVzLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihjb250ZXh0T25DbGljayk7XHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgbGV0IGNvbnRleHRzID0gW1xyXG4gICAgICAgICdzZWxlY3Rpb24nLFxyXG4gICAgICAgICdlZGl0YWJsZScsXHJcbiAgICBdO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGV4dHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgY29udGV4dCA9IGNvbnRleHRzW2ldO1xyXG4gICAgICAgIGxldCB0aXRsZSA9IFwiVGVzdCAnXCIgKyBjb250ZXh0ICsgXCInIG1lbnUgaXRlbVwiO1xyXG4gICAgICAgIGNocm9tZS5jb250ZXh0TWVudXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICBjb250ZXh0czogW2NvbnRleHRdLFxyXG4gICAgICAgICAgICBpZDogY29udGV4dCxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==