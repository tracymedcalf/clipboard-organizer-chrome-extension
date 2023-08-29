import copyToClipboard from "./copyToClipboard";
import Store from "./Store";

async function selectionOnClick(selectionText: string) {
    // Store selectionText in cookies for when the options page is opened or we
    // try to send the prompt.
    Store.put(selectionText);
}

async function editableOnClick() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const store: Store = await Store.get();
        const text = Store.toText(store);
        chrome.tabs.sendMessage(tabs[0].id, text);
    });
}

async function contextOnClick(info: chrome.contextMenus.OnClickData) {
    switch (info.menuItemId) {
        case 'selection':
            selectionOnClick(info.selectionText);
            break;
        case 'editable':
            editableOnClick()
            break;
        default:
            // Standard context menu item function
            console.error('No action for this menu item.');
    }
}

type ContextType = chrome.contextMenus.ContextType;

function addContextMenuItem(
    title: string, 
    context: ContextType
) {
    chrome.contextMenus.create({
        title: title,
        contexts: [context],
        id: context,
    });
}

chrome.contextMenus.onClicked.addListener(contextOnClick);

chrome.runtime.onInstalled.addListener(() => {

    const selection: ContextType = "selection";
    addContextMenuItem(
        "Save selection to Clipboard Organizer",
        selection
    );

    const editable: ContextType = "editable";
    addContextMenuItem(
        "Insert Clipboard Organizer contents",
        editable
    )
});
