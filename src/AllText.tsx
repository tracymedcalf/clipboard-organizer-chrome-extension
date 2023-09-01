import React from "react";
import type Text from "./Text";
import type Store from "./Store";

function TextComponent(props: { delimiter: string; text: Text; }) {
    const { text } = props;
    if (props.delimiter === " ") {
        return <span key={text.id}>{text.text + " "}</span>;
    }

    return <p key={text.id}>{text.text}</p>;
}

export default function AllText(props: { store: Store }) {
    if (props.store.texts.filter(t => t.text !== "").length === 0) {
        return (
            <em>When you add text to the app, it will appear here.</em>
        )
    }

    return (
        <div>
            {props.store.texts.map(t => <TextComponent text={t} />)}
        </div>
    );
}