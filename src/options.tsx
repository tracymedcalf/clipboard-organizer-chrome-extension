import React, { StrictMode } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { createRoot } from "react-dom/client";
import { useState } from "react";

import AllTogether from "./AllTogether";
import Text from "./Text";
import { useCookie } from "./cookie_hook";

function copyToClipboard(text: string) {
    //Create a textbox field where we can insert text to. 
    var copyFrom = document.createElement("textarea");

    //Set the text content to be the text you wished to copy.
    copyFrom.textContent = text;

    //Append the textbox field into the body as a child. 
    //"execCommand()" only works when there exists selected text, and the text is inside 
    //document.body (meaning the text is part of a valid rendered HTML element).
    document.body.appendChild(copyFrom);

    //Select all the text!
    copyFrom.select();

    //Execute command
    document.execCommand('copy');

    //(Optional) De-select the text using blur(). 
    copyFrom.blur();

    //Remove the textbox field from the document.body, so no other JavaScript nor 
    //other elements can get access to this.
    document.body.removeChild(copyFrom);
}

function Options() {

    const [content, setCookie] = useCookie();

    const swap = (i1: number, i2: number) => {
        const newContent = [...content];
        const save = newContent[i2];
        newContent[i2] = newContent[i1];
        newContent[i1] = save;

        setCookie(newContent);
    };

    const onClear = () => {
        setCookie([]);
    };

    const remove = (i1: number) => {
        setCookie(content.filter((_, i2) => i2 !== i1));
    };

    const setText = (newText: Text) => {
        setCookie(content.map(t => t.id === newText.id ? newText : t));
    };

    const handleCopy = () => {
        copyToClipboard(Text.join(content, " "));
    }

    return (
        <div>
            <button
                onClick={onClear}
            >
                Clear All
            </button>
            <button onClick={handleCopy}>Copy</button>
            {content.map((t, i) => (console.log(t),
                <div key={t.id}>
                    <div className="row">
                        <div className="col">
                            <button
                                disabled={i === 0}
                                onClick={() => swap(i, i - 1)}
                            >
                                <FaArrowUp />
                            </button>
                            <button
                                disabled={i === content.length - 1}
                                onClick={() => swap(i, i + 1)}
                            >
                                <FaArrowDown />
                            </button>
                        </div>
                        <textarea
                            onChange={
                                (e) => setText(Text.from(t, e.target.value))
                            }
                            placeholder="Write prompt in here."
                            value={t.text}
                        />
                    </div>
                    <button onClick={() => remove(i)}>Delete</button>
                </div>
            ))}

            <AllTogether content={content} />
        </div>
    );
}

const root = createRoot(document.getElementById("dom-container"));
root.render(
    <StrictMode>
        <Options />
    </StrictMode>,
);

