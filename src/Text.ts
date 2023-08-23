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

    from(s: string) {
        const t = new Text(s);
        t.id = this.id;
        return t;
    }
}
