import Store from "./Store";

async function copyToClipboard() {
    const store: Store = await Store.get();

    const text = Store.toText(store);
    var copyFrom = document.createElement("textarea");

    copyFrom.textContent = text;

    document.body.appendChild(copyFrom);

    copyFrom.select();

    document.execCommand('copy');

    copyFrom.blur();

    document.body.removeChild(copyFrom);
}

export default copyToClipboard;