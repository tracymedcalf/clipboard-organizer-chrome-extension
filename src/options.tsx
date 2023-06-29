import React, { StrictMode, useSyncExternalStore } from "react";
import { Button, Form } from "react-bootstrap";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { createRoot } from "react-dom/client";
import { useState } from "react";

import AllTogether from "./AllTogether";
import { key } from "./storage_key";
import { useCookie } from "./cookie-hook";

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
            <Button
                onClick={onClear}
                variant="danger"
            >
                Clear
            </Button>
            {content.map(({ text, id }, i) => (
                <div key={id}>
                    <div className={"d-flex"}>
                        <div className={"d-flex flex-column"}>
                            <Button 
                                disabled={i === 0} 
                                onClick={() => swap(i, i-1)}
                            >
                                <FaArrowUp />
                            </Button>
                            <Button 
                                disabled={i === content.length - 1} 
                                onClick={() => swap(i, i+1)}
                            >
                                <FaArrowDown />
                            </Button>
                        </div>
                        <Form.Control 
                            readOnly={edit !== i} 
                            as="textarea" 
                            placeholder="Write prompt in here." 
                            value={text} 
                        />
                    </div>
                    {(edit === i) 
                        ? <button className={"btn btn-link"} onClick={() => setEdit(-1)}>Save</button> 
                        : <button className={"btn btn-link"} onClick={() => setEdit(i)}>Edit</button>
                    }
                    <button className={"btn btn-link"} onClick={() => remove(i)}>Delete</button>
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

