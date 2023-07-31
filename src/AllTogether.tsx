import React from "react";
import { useState } from "react";

import type Text from "./Text";

export default function AllTogether(props: { content: Text[] }) {
    const [delimiter, setDelimiter] = useState(" ");

    return (
        <div>
            <div>All together: </div>
            <div>
                {props.content.map(t => <p>{t.text}</p>)}
            </div>
            <form name="delimiter">
                <label>
                    <input
                        checked={delimiter === " "}
                        onChange={() => setDelimiter(" ")}
                        type="radio"
                        name="delimiter"
                    />
                    space
                </label>
                <label>
                    <input
                        type="radio"
                        checked={delimiter === "\n"}
                        onChange={() => setDelimiter("\n")}
                        name="delimiter"
                    />
                    newline
                </label>
            </form>
        </div>
    );
}
