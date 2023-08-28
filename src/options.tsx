import React, { StrictMode } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { createRoot } from "react-dom/client";
import { useState } from "react";

import AllTogether from "./AllTogether";
import Text from "./Text";
import { useCookie } from "./cookie_hook";
import copyToClipboard from "./copyToClipboard";

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
        copyToClipboard();
    }

    return (
        <div>
            <button
                onClick={onClear}
            >
                Clear All
            </button>
            <button onClick={handleCopy}>Copy</button>
            {content.map((t, i) => (
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
                            key={t.id}
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

