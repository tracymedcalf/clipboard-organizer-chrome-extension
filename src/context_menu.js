import { Configuration, OpenAIApi } from "openai";
import { key } from "./storage_key";

let configuration;
let openai;

(async () => {
    const keyFile = chrome.extension.getURL('../open_api_key_file.js');
    const keyScript = await import(keyFile);
    configuration = new Configuration({
        apiKey: 
    });
    openai = new OpenAIApi(configuration);
})();


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

// Store text to persist while plugin is loaded or until reset. 
async function store(text) {

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
