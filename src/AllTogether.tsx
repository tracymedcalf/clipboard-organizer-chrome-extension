import React from "react";
import { Form } from "react-bootstrap";
import { useState } from "react";

import type Text from "./Text";

export default function AllTogether(props: { content: Text[] }) {
    const [delimiter, setDelimiter] = useState(" ");

    return (
        <div className="m-3 p-3">
            <div>All together: </div>
            <textarea
                placeholder="Write prompt in here." 
                value={props.content.map(t => t.text).join(delimiter)}
            />
            <Form>
                <Form.Check
                    defaultChecked
                    id="space"
                    label="space"
                    name="group1"
                    onClick={() => setDelimiter(" ")}
                    type="radio"
                />
                <Form.Check
                    id="newline"
                    label="newline"
                    name="group1"
                    onClick={() => setDelimiter("\n")}
                    type="radio"
                />
            </Form>
        </div>
    );
}
