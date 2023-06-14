import React from "react";
import { createRoot } from "react-dom/client";
import { Button, Form } from "react-bootstrap";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { key } from "./storage_key"

//const promptEl = document.getElementById("prompt");
//
//chrome.storage.local.get(key).then(result => {
//    const array = result[key];
//    if (array !== undefined) {
//        promptEl.value = array.join("\n");
//    } else {
//        promptEl.value = "No prompt saved.";
//    }
//});


function Options() {
    const content = ['text']
    return (
        <div>
            {content.map(s => (
                <div className={"border"}>
                    <Button><FaArrowUp /></Button>
                    <Button><FaArrowDown /></Button>
                    <span>This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.</span>
                </div>
            ))}
            <Form.Control as="textarea" placeholder="Write prompt in here." />
        </div>
    );
}

const root = createRoot(document.getElementById("dom-container"));
root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>,
);

