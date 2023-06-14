import React from "react";
import { createRoot } from "react-dom/client";
import { Button } from "react-bootstrap";

function Popup(props: { content: string[] }) {
    return (
        <div>
            <Button onClick={() => chrome.runtime.openOptionsPage()}>
                Edit Prompt
            </Button>
        </div>
    );
}


const root = createRoot(document.getElementById("dom-container"));

root.render(
    <React.StrictMode>
        <Popup content={['Text']} />
    </React.StrictMode>,
);

