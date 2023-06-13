import React from "react";
import { createRoot } from "react-dom/client";
import { Button } from "react-bootstrap";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

function Popup(props: { content: string[] }) {
    return (
        <div>
            <h2>Re-order your text as desired.</h2>
            {props.content.map(s => (
                <div>
                    <Button><FaArrowUp /></Button>
                    <Button><FaArrowDown /></Button>
                    <span>This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.This is the text that we're saving.</span>
                </div>
            ))}
        </div>
    );
}


const root = createRoot(document.getElementById("dom-container"));

root.render(
    <React.StrictMode>
        <Popup content={['Text']} />
    </React.StrictMode>,
);

