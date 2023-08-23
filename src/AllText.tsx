import React from "react";
import Text from "./Text";

export default function AllText(props: { content: Text[]; delimiter: string; }) {
    if (props.delimiter === "\n") {
        return (
            <div>
                {props.content.map(t => <p key={t.id}>{t.text}</p>)}
            </div>
        );
    }

    return (
        <div>
            {props.content.map(t => <span key={t.id}>{t.text + " "}</span>)}
        </div>
    )
}