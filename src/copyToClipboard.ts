import Store from "./Store";

async function copyToClipboard() {
    const store: Store = await Store.get();

    const text = Store.toText(store);

    // For the below code, credit goes to the following post and StackOverflow
    // user:
    // https://stackoverflow.com/a/18455088
    // https://stackoverflow.com/users/835766/jeff-gran

    var copyFrom = document.createElement("textarea");

    copyFrom.textContent = text;

    document.body.appendChild(copyFrom);

    copyFrom.select();

    document.execCommand('copy');

    copyFrom.blur();

    document.body.removeChild(copyFrom);
}

export default copyToClipboard;