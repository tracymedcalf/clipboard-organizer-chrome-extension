import React, { StrictMode, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Store from "./Store";

function reduce(state: string[], action: string) {
}

function Options() {
    const [content, setContent] = useState([]);

    const [edit, setEdit] = useState(-1);

    const onContentUpdate = async () => {
        setContent(await Store.get())
    };
    
    useEffect(() => {
        (async () => {
            console.log("useEffect callback");
            setContent(await Store.get());
            chrome.runtime.onMessage.addListener(onContentUpdate);
        })();
    }, []);

    const swap = (i1: number, i2: number) => {
        const newContent = [...content];
        const save = newContent[i2];
        newContent[i2] = newContent[i1];
        newContent[i1] = save;
        Store.set(newContent);
        onContentUpdate();
    };

    return (
        <div>
            <Button
                variant="danger"
            >
                Clear
            </Button>
            {content.map((s, i) => (
                <div key={s}>
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
                            value={s} 
                        />
                    </div>
                    {(edit === i) 
                        ? <button className={"btn btn-link"} onClick={() => setEdit(-1)}>Save</button> 
                        : <button className={"btn btn-link"} onClick={() => setEdit(i)}>Edit</button>
                    }
                </div>
            ))}
        </div>
    );
}

const root = createRoot(document.getElementById("dom-container"));
root.render(
    <StrictMode>
        <Options />
    </StrictMode>,
);

