/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/context_menu.ts":
/*!*****************************!*\
  !*** ./src/context_menu.ts ***!
  \*****************************/
/***/ (function() {

//let configuration;
//let openai;
//
////(async () => {
////    const relativePath = './.open_api_key_file';
////    const url = chrome.runtime.getURL(relativePath);
////    const response = await fetch(url);
////
////    configuration = new Configuration({
////        apiKey: key
////    });
////    openai = new OpenAIApi(configuration);
////})();
//
//
//async function callApi(req, res) {
//    if (!configuration.apiKey) {
//        console.error("OpenAI API key not configured, please follow instructions in README.md");
//        return;
//    }
//
//    const jobDescription = "ATTENTION: PLACEHOLDER";
//    try {
//        const completion = await openai.createCompletion({
//            model: "text-davinci-003",
//            prompt: generatePrompt(jobDescription),
//            temperature: 0.6,
//        });
//        res.status(200).json({ result: completion.data.choices[0].text });
//    } catch(error) {
//        // Consider adjusting the error handling logic for your use case
//        if (error.response) {
//            console.error(error.response.status, error.response.data);
//            res.status(error.response.status).json(error.response.data);
//        } else {
//            console.error(`Error with OpenAI API request: ${error.message}`);
//            res.status(500).json({
//                error: {
//                    message: 'An error occurred during your request.',
//                }
//            });
//        }
//    }
//}
//
//// Patch the job description into my resume.
//function generatePrompt(jobDescription) {
//}
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function selectionOnClick(selectionText) {
    return __awaiter(this, void 0, void 0, function () {
        var tabs, _i, tabs_1, t;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, chrome.tabs.query({ title: "Craft ChatGPT Prompt Options" })];
                case 1:
                    tabs = _a.sent();
                    for (_i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
                        t = tabs_1[_i];
                        chrome.runtime.sendMessage(t.id + '', selectionText);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function contextOnClick(info) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (info.menuItemId) {
                case 'selection':
                    selectionOnClick(info.selectionText);
                    break;
                case 'editable':
                    break;
                default:
                    // Standard context menu item function
                    console.error('No action for this menu item.');
            }
            return [2 /*return*/];
        });
    });
}
chrome.contextMenus.onClicked.addListener(contextOnClick);
chrome.runtime.onInstalled.addListener(function () {
    var contexts = [
        'selection',
        'editable',
    ];
    for (var i = 0; i < contexts.length; i++) {
        var context = contexts[i];
        var title = "Test '" + context + "' menu item";
        chrome.contextMenus.create({
            title: title,
            contexts: [context],
            id: context,
        });
    }
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/context_menu.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dF9tZW51LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsaUNBQWlDLHlDQUF5QztBQUMxRSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1osOERBQThELGNBQWM7QUFDNUU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxjQUFjLDZCQUE2QiwwQkFBMEIsY0FBYyxxQkFBcUI7QUFDeEcsaUJBQWlCLG9EQUFvRCxxRUFBcUUsY0FBYztBQUN4Six1QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztBQUN4QyxtQ0FBbUMsU0FBUztBQUM1QyxtQ0FBbUMsV0FBVyxVQUFVO0FBQ3hELDBDQUEwQyxjQUFjO0FBQ3hEO0FBQ0EsOEdBQThHLE9BQU87QUFDckgsaUZBQWlGLGlCQUFpQjtBQUNsRyx5REFBeUQsZ0JBQWdCLFFBQVE7QUFDakYsK0NBQStDLGdCQUFnQixnQkFBZ0I7QUFDL0U7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQTtBQUNBLFVBQVUsWUFBWSxhQUFhLFNBQVMsVUFBVTtBQUN0RCxvQ0FBb0MsU0FBUztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFpRSx1Q0FBdUM7QUFDeEc7QUFDQTtBQUNBLGdEQUFnRCxvQkFBb0I7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixxQkFBcUI7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsQ0FBQzs7Ozs7Ozs7VUVySUQ7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2NvdmVyLWxldHRlci8uL3NyYy9jb250ZXh0X21lbnUudHMiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vbGV0IGNvbmZpZ3VyYXRpb247XG4vL2xldCBvcGVuYWk7XG4vL1xuLy8vLyhhc3luYyAoKSA9PiB7XG4vLy8vICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9ICcuLy5vcGVuX2FwaV9rZXlfZmlsZSc7XG4vLy8vICAgIGNvbnN0IHVybCA9IGNocm9tZS5ydW50aW1lLmdldFVSTChyZWxhdGl2ZVBhdGgpO1xuLy8vLyAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XG4vLy8vXG4vLy8vICAgIGNvbmZpZ3VyYXRpb24gPSBuZXcgQ29uZmlndXJhdGlvbih7XG4vLy8vICAgICAgICBhcGlLZXk6IGtleVxuLy8vLyAgICB9KTtcbi8vLy8gICAgb3BlbmFpID0gbmV3IE9wZW5BSUFwaShjb25maWd1cmF0aW9uKTtcbi8vLy99KSgpO1xuLy9cbi8vXG4vL2FzeW5jIGZ1bmN0aW9uIGNhbGxBcGkocmVxLCByZXMpIHtcbi8vICAgIGlmICghY29uZmlndXJhdGlvbi5hcGlLZXkpIHtcbi8vICAgICAgICBjb25zb2xlLmVycm9yKFwiT3BlbkFJIEFQSSBrZXkgbm90IGNvbmZpZ3VyZWQsIHBsZWFzZSBmb2xsb3cgaW5zdHJ1Y3Rpb25zIGluIFJFQURNRS5tZFwiKTtcbi8vICAgICAgICByZXR1cm47XG4vLyAgICB9XG4vL1xuLy8gICAgY29uc3Qgam9iRGVzY3JpcHRpb24gPSBcIkFUVEVOVElPTjogUExBQ0VIT0xERVJcIjtcbi8vICAgIHRyeSB7XG4vLyAgICAgICAgY29uc3QgY29tcGxldGlvbiA9IGF3YWl0IG9wZW5haS5jcmVhdGVDb21wbGV0aW9uKHtcbi8vICAgICAgICAgICAgbW9kZWw6IFwidGV4dC1kYXZpbmNpLTAwM1wiLFxuLy8gICAgICAgICAgICBwcm9tcHQ6IGdlbmVyYXRlUHJvbXB0KGpvYkRlc2NyaXB0aW9uKSxcbi8vICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNixcbi8vICAgICAgICB9KTtcbi8vICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHJlc3VsdDogY29tcGxldGlvbi5kYXRhLmNob2ljZXNbMF0udGV4dCB9KTtcbi8vICAgIH0gY2F0Y2goZXJyb3IpIHtcbi8vICAgICAgICAvLyBDb25zaWRlciBhZGp1c3RpbmcgdGhlIGVycm9yIGhhbmRsaW5nIGxvZ2ljIGZvciB5b3VyIHVzZSBjYXNlXG4vLyAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4vLyAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IucmVzcG9uc2Uuc3RhdHVzLCBlcnJvci5yZXNwb25zZS5kYXRhKTtcbi8vICAgICAgICAgICAgcmVzLnN0YXR1cyhlcnJvci5yZXNwb25zZS5zdGF0dXMpLmpzb24oZXJyb3IucmVzcG9uc2UuZGF0YSk7XG4vLyAgICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3Igd2l0aCBPcGVuQUkgQVBJIHJlcXVlc3Q6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbi8vICAgICAgICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xuLy8gICAgICAgICAgICAgICAgZXJyb3I6IHtcbi8vICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQW4gZXJyb3Igb2NjdXJyZWQgZHVyaW5nIHlvdXIgcmVxdWVzdC4nLFxuLy8gICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICB9KTtcbi8vICAgICAgICB9XG4vLyAgICB9XG4vL31cbi8vXG4vLy8vIFBhdGNoIHRoZSBqb2IgZGVzY3JpcHRpb24gaW50byBteSByZXN1bWUuXG4vL2Z1bmN0aW9uIGdlbmVyYXRlUHJvbXB0KGpvYkRlc2NyaXB0aW9uKSB7XG4vL31cbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbmZ1bmN0aW9uIHNlbGVjdGlvbk9uQ2xpY2soc2VsZWN0aW9uVGV4dCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRhYnMsIF9pLCB0YWJzXzEsIHQ7XG4gICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBbNCAvKnlpZWxkKi8sIGNocm9tZS50YWJzLnF1ZXJ5KHsgdGl0bGU6IFwiQ3JhZnQgQ2hhdEdQVCBQcm9tcHQgT3B0aW9uc1wiIH0pXTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIHRhYnMgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoX2kgPSAwLCB0YWJzXzEgPSB0YWJzOyBfaSA8IHRhYnNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSB0YWJzXzFbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UodC5pZCArICcnLCBzZWxlY3Rpb25UZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gY29udGV4dE9uQ2xpY2soaW5mbykge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgc3dpdGNoIChpbmZvLm1lbnVJdGVtSWQpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzZWxlY3Rpb24nOlxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25PbkNsaWNrKGluZm8uc2VsZWN0aW9uVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2VkaXRhYmxlJzpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgLy8gU3RhbmRhcmQgY29udGV4dCBtZW51IGl0ZW0gZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignTm8gYWN0aW9uIGZvciB0aGlzIG1lbnUgaXRlbS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5jaHJvbWUuY29udGV4dE1lbnVzLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihjb250ZXh0T25DbGljayk7XG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbnRleHRzID0gW1xuICAgICAgICAnc2VsZWN0aW9uJyxcbiAgICAgICAgJ2VkaXRhYmxlJyxcbiAgICBdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29udGV4dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBjb250ZXh0c1tpXTtcbiAgICAgICAgdmFyIHRpdGxlID0gXCJUZXN0ICdcIiArIGNvbnRleHQgKyBcIicgbWVudSBpdGVtXCI7XG4gICAgICAgIGNocm9tZS5jb250ZXh0TWVudXMuY3JlYXRlKHtcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgIGNvbnRleHRzOiBbY29udGV4dF0sXG4gICAgICAgICAgICBpZDogY29udGV4dCxcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IHt9O1xuX193ZWJwYWNrX21vZHVsZXNfX1tcIi4vc3JjL2NvbnRleHRfbWVudS50c1wiXSgpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9