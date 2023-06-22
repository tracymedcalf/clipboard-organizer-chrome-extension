import React, { StrictMode, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Store from "./Store";

function Options() {
    const [content, setContent] = useState([]);

    const [edit, setEdit] = useState(-1);

    const onContentUpdate = (request: { content: string[] }, sender: any, sendResponse: any) => {
        setContent(request.content)
    };
    
    useEffect(() => {
        (async () => {
            console.log("this is called");
            setContent(await Store.getContent());
            chrome.runtime.onMessage.addListener(onContentUpdate);
        })();
    }, []);

    return (
        <div>
            {content.map((s, i) => (
                <div key={s}>
                    <div className={"d-flex"}>
                        <div className={"d-flex flex-column"}>
                            <Button disabled={i === 0}><FaArrowUp /></Button>
                            <Button disabled={i === content.length}><FaArrowDown /></Button>
                        </div>
                        <Form.Control readOnly={edit !== i} as="textarea" placeholder="Write prompt in here." />
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

