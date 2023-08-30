import React from "react";
import AllText from "./AllText";
import type Store from "./Store";

export default function AllTogether(
    props: {
        store: Store,
        setDelimiter: (_: string) => void
    }
) {
    return (
        <div id="all-together">
            <h2>All together: </h2>
            <div id="delimiter">
                <h3>Delimiter</h3>
                <form name="delimiter">
                    <label>
                        <input
                            checked={props.store.delimiter === " "}
                            onChange={() => props.setDelimiter(" ")}
                            type="radio"
                            name="delimiter"
                        />
                        space
                    </label>
                    <label>
                        <input
                            type="radio"
                            checked={props.store.delimiter === "\n"}
                            onChange={() => props.setDelimiter("\n")}
                            name="delimiter"
                        />
                        newline
                    </label>
                </form>
            </div>
            <AllText store={props.store} />
        </div>
    );
}
