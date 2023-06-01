/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!****************************!*\
  !*** ./src/contextMenu.js ***!
  \****************************/
//import { key } from "./storage_key"

// Store text to persist while plugin is loaded or until reset.
async function store(text) {
    const key = "upwork_cover_letter_generator_data";

    const o = await chrome.storage.local.get([key]);

    const oldStore = o[key];

    if (oldStore === undefined) {
        chrome.storage.local.set({ [key]: [text] });

    } else {
        const newStore = [...oldStore, text];

        chrome.storage.local.set({ [key]: newStore });
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dE1lbnUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxXQUFXLE1BQU07QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsZUFBZTtBQUNsRDtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsbUNBQW1DLGlCQUFpQjtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixxQkFBcUI7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2NvdmVyLWxldHRlci8uL3NyYy9jb250ZXh0TWVudS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvL2ltcG9ydCB7IGtleSB9IGZyb20gXCIuL3N0b3JhZ2Vfa2V5XCJcclxuXHJcbi8vIFN0b3JlIHRleHQgdG8gcGVyc2lzdCB3aGlsZSBwbHVnaW4gaXMgbG9hZGVkIG9yIHVudGlsIHJlc2V0LlxyXG5hc3luYyBmdW5jdGlvbiBzdG9yZSh0ZXh0KSB7XHJcbiAgICBjb25zdCBrZXkgPSBcInVwd29ya19jb3Zlcl9sZXR0ZXJfZ2VuZXJhdG9yX2RhdGFcIjtcclxuXHJcbiAgICBjb25zdCBvID0gYXdhaXQgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtrZXldKTtcclxuXHJcbiAgICBjb25zdCBvbGRTdG9yZSA9IG9ba2V5XTtcclxuXHJcbiAgICBpZiAob2xkU3RvcmUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtrZXldOiBbdGV4dF0gfSk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBuZXdTdG9yZSA9IFsuLi5vbGRTdG9yZSwgdGV4dF07XHJcblxyXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFtrZXldOiBuZXdTdG9yZSB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY29udGV4dE9uQ2xpY2soaW5mbykge1xyXG4gICAgc3dpdGNoIChpbmZvLm1lbnVJdGVtSWQpIHtcclxuICAgICAgICBjYXNlICdzZWxlY3Rpb24nOlxyXG4gICAgICAgICAgICBzdG9yZShpbmZvLnNlbGVjdGlvblRleHQpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdlZGl0YWJsZSc6XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIC8vIFN0YW5kYXJkIGNvbnRleHQgbWVudSBpdGVtIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGFjdGlvbiBmb3IgdGhpcyBtZW51IGl0ZW0uJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNocm9tZS5jb250ZXh0TWVudXMub25DbGlja2VkLmFkZExpc3RlbmVyKGNvbnRleHRPbkNsaWNrKTtcclxuXHJcbmNocm9tZS5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICBsZXQgY29udGV4dHMgPSBbXHJcbiAgICAgICAgJ3NlbGVjdGlvbicsXHJcbiAgICAgICAgJ2VkaXRhYmxlJyxcclxuICAgIF07XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250ZXh0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBjb250ZXh0ID0gY29udGV4dHNbaV07XHJcbiAgICAgICAgbGV0IHRpdGxlID0gXCJUZXN0ICdcIiArIGNvbnRleHQgKyBcIicgbWVudSBpdGVtXCI7XHJcbiAgICAgICAgY2hyb21lLmNvbnRleHRNZW51cy5jcmVhdGUoe1xyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIGNvbnRleHRzOiBbY29udGV4dF0sXHJcbiAgICAgICAgICAgIGlkOiBjb250ZXh0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9