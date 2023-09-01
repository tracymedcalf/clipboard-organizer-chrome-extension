import React from "react";
import { createRoot } from "react-dom/client";

import copyToClipboard from "./copyToClipboard";

function Popup() {

    return (
        <div className="container">
            <button onClick={() => chrome.runtime.openOptionsPage()}>
                Edit Prompt
            </button>
            <button onClick={copyToClipboard}>
                Copy
            </button>
        </div>
    );
}


const root = createRoot(document.getElementById("dom-container"));

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
);