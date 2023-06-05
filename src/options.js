import { key } from "./storage_key"

const promptEl = document.getElementById("prompt");

chrome.storage.local.get(key).then(result => {
    const array = result[key];
    if (array !== undefined) {
        promptEl.value = array.join("\n");
    } else {
        promptEl.value = "No prompt saved.";
    }
});
