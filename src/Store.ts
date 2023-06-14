import { key } from "./storage_key";

// Store text to persist while plugin is loaded or until reset. 
async function put(text: string) {

    const oldStore = await this.getContent();

    if (oldStore === undefined) {
        chrome.storage.local.set({ [key]: [text] });

    } else {
        const newStore = [...oldStore, text];

        chrome.storage.local.set({ [key]: newStore });
    }
}

async function getContent() {
    const result = await chrome.storage.local.get([key]);
    return result[key];
}

export default { getContent, put };
