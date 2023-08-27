import Store from "./Store";

async function selectionOnClick(selectionText: string) {
    // Store selectionText in cookies for when the options page is opened or we
    // try to send the prompt.
    Store.put(selectionText);
}

async function editableOnClick() {

}

async function contextOnClick(info: chrome.contextMenus.OnClickData) {
    switch (info.menuItemId) {
        case 'selection':
            selectionOnClick(info.selectionText);
            break;
        case 'editable':
            console.log(info);
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
    context: ContextType, 
    id: ContextType
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
        "Add selection to ChatGPT prompt",
        selection,
        selection
    );

    //const editable: ContextType = "editable";
    //addContextMenuItem(
    //    "Input ChatGPT result",
    //    editable,
    //    editable
    //)
});
