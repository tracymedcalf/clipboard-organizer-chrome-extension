import { key } from "./storage_key"

const promptEl = document.getElementById("prompt");

//const key = "upwork_cover_letter_generator_data";

chrome.storage.local.get(key).then(result => {
    const array = result[key];
    if (array !== undefined) {
        promptEl.value = array.join("\n");
    } else {
        promptEl.value = "No prompt saved.";
    }
});
