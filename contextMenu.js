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
