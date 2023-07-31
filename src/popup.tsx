import React from "react";
import { createRoot } from "react-dom/client";

function Popup(props: { content: string[] }) {
    return (
        <div>
            <button onClick={() => chrome.runtime.openOptionsPage()}>
                Edit Prompt
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

