function registerPasteListener() {
    chrome.runtime.onMessage.addListener((message: string, sender: any) => {
        if (chrome.runtime.id !== sender.id) {
            return;
        }

        const el = document.activeElement as any;
        const [start, end] = [el.selectionStart, el.selectionEnd];
        el.setRangeText(message, start, end, 'select');

        el.dispatchEvent(new Event('input', { bubbles: true}));
    });
}

export default registerPasteListener;