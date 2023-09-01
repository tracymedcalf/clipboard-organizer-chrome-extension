function onMessageListener(message: string, sender: chrome.runtime.MessageSender) {
    if (chrome.runtime.id !== sender.id) {
        return;
    }

    const el = document.activeElement as any;
    const [start, end] = [el.selectionStart, el.selectionEnd];
    el.setRangeText(message, start, end, 'select');

    el.dispatchEvent(new Event('input', { bubbles: true }));
}

function registerPasteListener() {
    chrome.runtime.onMessage.addListener(onMessageListener);
}

export default registerPasteListener;