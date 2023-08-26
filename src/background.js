chrome.runtime.onMessage.addListener(async (message, sender, senderResponse) => {
    console.group("inside listener");
    const response = await fetch(
        "https://chat.openai.com/backend-api/conversation",
        { 
            mode: "no-cors",
            
        }
    );
    console.log(response)
    if (!response.ok) {
        senderResponse("failed");
        return;
    }

    const res = await response.json();
    senderResponse("success")
    console.groupEnd();
});