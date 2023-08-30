import React from "react";
import type Store from "./Store";

export default function AllText(props: { store: Store }) {
    if (props.store.texts.length === 0) {
        return (
            <em>When you add text to the app, it will appear here.</em>
        )
    }

    if (props.store.delimiter === "\n") {
        return (
            <div>
                {props.store.texts.map(t => <p key={t.id}>{t.text}</p>)}
            </div>
        );
    }
    return (
        <div>
            {props.store.texts.map(t => <span key={t.id}>{t.text + " "}</span>)}
        </div>
    )
}