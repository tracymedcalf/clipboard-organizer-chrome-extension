import React from "react";
import { createRoot } from "react-dom/client";

import copyToClipboard from "./copyToClipboard";

function Popup(props: { content: string[] }) {

    const handleCopy = () => copyToClipboard();

    return (
        <div>
            <button onClick={() => chrome.runtime.openOptionsPage()}>
                Edit Prompt
            </button>
            <button onClick={handleCopy}>
                Copy
            </button>
        </div>
    );
}


const root = createRoot(document.getElementById("dom-container"));

root.render(
    <React.StrictMode>
        <Popup content={['Text']} />
    </React.StrictMode>,
);