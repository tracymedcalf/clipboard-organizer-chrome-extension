import React, { StrictMode } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { createRoot } from "react-dom/client";

import AllTogether from "./AllTogether";
import Text from "./Text";
import { useCookie } from "./cookie_hook";
import copyToClipboard from "./copyToClipboard";

function Options() {

    const [store, setCookie] = useCookie();

    const addText = (i: number) => {
        setCookie({ ...store, texts: [...store.texts].splice(i, 0, new Text("")) });
    }

    const swap = (i1: number, i2: number) => {
        const texts = [...store.texts];
        const save = texts[i2];
        texts[i2] = texts[i1];
        texts[i1] = save;

        setCookie({ ...store, texts });
    };

    const onClear = () => {
        setCookie({ ...store, texts: [] });
    };

    const remove = (i1: number) => {
        setCookie({
            ...store,
            texts: store.texts.filter((_, i2) => i2 !== i1)
        });
    };

    const setText = (newText: Text) => {
        setCookie({
            ...store,
            texts: store.texts.map(t => t.id === newText.id ? newText : t)
        });
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
            {store.texts.map((t, i) => (
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
                                disabled={i === store.texts.length - 1}
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
                    <button onClick={() => addText(i)}>Add Text Below</button>
                </div>
            ))}

            <AllTogether
                store={store}
                setDelimiter={(s: string) => setCookie({ ...store, delimiter: s })}
            />
        </div>
    );
}

const root = createRoot(document.getElementById("dom-container"));
root.render(
    <StrictMode>
        <Options />
    </StrictMode>,
);

