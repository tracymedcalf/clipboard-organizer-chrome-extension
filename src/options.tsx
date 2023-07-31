import React, { StrictMode } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { createRoot } from "react-dom/client";
import { useState } from "react";

import AllTogether from "./AllTogether";
import { useCookie } from "./cookie_hook";

function Options() {

    const [content, setCookie] = useCookie();

    const [edit, setEdit] = useState(-1);

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

    return (
        <div>
            <button
                onClick={onClear}
            >
                Clear
            </button>
            {content.map(({ text, id }, i) => (
                <div key={id}>
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
                    <textarea
                        readOnly={edit !== i}
                        placeholder="Write prompt in here."
                        value={text}
                    />
                    {(edit === i)
                        ? <button onClick={() => setEdit(-1)}>Save</button>
                        : <button onClick={() => setEdit(i)}>Edit</button>
                    }
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

