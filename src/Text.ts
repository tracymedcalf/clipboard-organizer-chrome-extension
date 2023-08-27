import { v1 as uuidV1 } from "uuid";

// The use of UUIDs makes it possible for React to keep track of identical 
// strings.

export default class Text {
    id: string
    text: string

    constructor(text: string) {
        this.id = uuidV1();
        this.text = text;
    }

    static from(old: Text, s: string) {
        const t = new Text(s);
        t.id = old.id;
        return t;
    }

    static join(array: Text[], delimiter: string) {
        return array.map(t => t.text).join(delimiter);
    }
}
