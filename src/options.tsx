import React from "react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Form } from "react-bootstrap";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Store from "./Store";

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

    const [content, setContent] = useState([]);

    const [edit, setEdit] = useState(-1);

    //useEffect(() => {
    //    (async () => {
    //        const c = await Store.getContent();
    //        setContent(c);
    //    })();
    //});

    return (
        <div>
            {['text'].map((s, i) => (
                <div>
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
    <React.StrictMode>
        <Options />
    </React.StrictMode>,
);

