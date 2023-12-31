import React, { StrictMode } from "react";
import { FaArrowUp, FaArrowDown, FaCopy } from "react-icons/fa";
import { createRoot } from "react-dom/client";

import AllTogether from "./AllTogether";
import Text from "./Text";
import copyToClipboard from "./copyToClipboard";
import registerPasteListener from "./registerPasteListener";
import { useCookie } from "./cookie_hook";

function Options() {

    // Custom cookie hook
    const [store, setCookie] = useCookie();

    const addText = (i: number) => {
        const texts = [...store.texts];
        texts.splice(i + 1, 0, new Text(""));
        setCookie({ ...store, texts });
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

    React.useEffect(() => {
        registerPasteListener();
    })

    return (
        <div>
            <div className="row">
                <button
                    onClick={onClear}
                    title="Delete all text"
                >
                    Clear All
                </button>
                <button onClick={handleCopy} title="Copy to clipboard">
                    <FaCopy />
                </button>
            </div>
            <button onClick={() => addText(-1)}>Add Text Below</button>
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
                            onChange={
                                (e) => setText(Text.from(t, e.target.value))
                            }
                            placeholder="Text you write in here will be saved to the browser."
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

