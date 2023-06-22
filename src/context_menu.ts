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
    const tabs = await chrome.tabs.query({ title: "Craft ChatGPT Prompt Options" });    

    for (const t of tabs) {
        chrome.runtime.sendMessage(
            t.id + '',
            selectionText
        );
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

chrome.contextMenus.onClicked.addListener(contextOnClick);

chrome.runtime.onInstalled.addListener(() => {

    let contexts: chrome.contextMenus.ContextType[] = [
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
