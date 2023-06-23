import Store from "./Store";

//let configuration;
//let openai;
//
////(async () => {
////    const relativePath = './.open_api_key_file';
////    const url = chrome.runtime.getURL(relativePath);
////    const response = await fetch(url);
////
////    configuration = new Configuration({
////        apiKey: key
////    });
////    openai = new OpenAIApi(configuration);
////})();
//
//
//async function callApi(req, res) {
//    if (!configuration.apiKey) {
//        console.error("OpenAI API key not configured, please follow instructions in README.md");
//        return;
//    }
//
//    const jobDescription = "ATTENTION: PLACEHOLDER";
//    try {
//        const completion = await openai.createCompletion({
//            model: "text-davinci-003",
//            prompt: generatePrompt(jobDescription),
//            temperature: 0.6,
//        });
//        res.status(200).json({ result: completion.data.choices[0].text });
//    } catch(error) {
//        // Consider adjusting the error handling logic for your use case
//        if (error.response) {
//            console.error(error.response.status, error.response.data);
//            res.status(error.response.status).json(error.response.data);
//        } else {
//            console.error(`Error with OpenAI API request: ${error.message}`);
//            res.status(500).json({
//                error: {
//                    message: 'An error occurred during your request.',
//                }
//            });
//        }
//    }
//}
//
//// Patch the job description into my resume.
//function generatePrompt(jobDescription) {
//}

async function selectionOnClick(selectionText: string) {
    // Store selectionText in cookies for when the options page is opened or we
    // try to send the prompt.
    Store.put(selectionText);

    // Error is okay, because the purpose of sending the message is to update
    // the options page.
    try {
        await chrome.runtime.sendMessage(
            null,
            selectionText
        );
    } catch(e) {
        console.log("Error sending message: ", e);
    }
}

async function contextOnClick(info: chrome.contextMenus.OnClickData) {
    switch (info.menuItemId) {
        case 'selection':
            selectionOnClick(info.selectionText);
            break;
        case 'editable':
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

    const editable = "editable";
});
