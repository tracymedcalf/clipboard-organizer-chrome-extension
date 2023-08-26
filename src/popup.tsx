import React from "react";
import { createRoot } from "react-dom/client";

function Popup(props: { content: string[] }) {

    const [state, setState] = React.useState(null);
    const sendHandler = () => {
        setState("sending")
        chrome.runtime.sendMessage({ message: 'the message'}).then((res) => {
            if (res === "failed" || res === "success") {
                setState(res);
            }
            window.setTimeout(() => {
                setState(null)
            }, 2000);
        });
    };

    // Button for communicating with ChatGPT
    let comm = null;

    if (state === "sending") {
        comm = <button onClick={() => setState(null)}>Success!</button>
    } else if (state === "sending") {
        comm = <button>Sending...</button>
    } else if (state === "failed") {
        comm = <button onClick={() => setState(null)}>Failed</button>
    } else {
        comm = <button onClick={sendHandler}>Send to ChatGPT</button>
    }

    return (
        <div>
            <button onClick={() => chrome.runtime.openOptionsPage()}>
                Edit Prompt
            </button>
            {comm}
        </div>
    );
}


const root = createRoot(document.getElementById("dom-container"));

root.render(
    <React.StrictMode>
        <Popup content={['Text']} />
    </React.StrictMode>,
);

