const el = document.getElementById("save-text");

const key = "upwork_cover_letter_generator_data";

async function getSelection() {

    const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    });

    let result;

    try {
        [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => getSelection().toString(),
        });
    } catch (_e) {
        return;
    }

    return result;
}

el.onclick = async function() {
    const text = await getSelection();
    console.log(text);

    const o = await chrome.storage.local.get([key]);

    const oldStore = o[key];

    if (oldStore === undefined) {
        chrome.storage.local.set({ [key]: [text] });

    } else {
        const newStore = [...oldStore, text];

        chrome.storage.local.set({ [key]: newStore });
    }

}
