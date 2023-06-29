import { key } from "./storage_key";
import Text from "./Text";

// Store text to persist while plugin is loaded or until reset. 
async function put(s: string) {

    const text = new Text(s);

    const oldStore = await get();

    if (oldStore === undefined) {
        chrome.storage.local.set({ [key]: [text] });

    } else {
        const newStore = [...oldStore, text];

        chrome.storage.local.set({ [key]: newStore });
    }
}

async function get() {
    const result = await chrome.storage.local.get([key]);
    const stored = result[key];
    return stored === undefined ? [] : stored;
}

async function set(content: Text[]) {
    chrome.storage.local.set({ [key]: [...content] });
}

export default { 
    get, 
    put,
    set,
};
