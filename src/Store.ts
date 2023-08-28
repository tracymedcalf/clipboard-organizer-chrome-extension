import { key } from "./storage_key";
import Text from "./Text";

// Store text to persist while plugin is loaded or until reset. 
class Store {
    public delimiter: string;
    public texts: Text[];

    constructor() {
        this.texts = [];
        this.delimiter = " ";
    }

    static from(store: Store, text: Text): Store {
        return { 
            delimiter: store.delimiter,
            texts: [...store.texts, text]
        }
    }

    static async put(s: string) {

        const text = new Text(s);

        const oldStore = await Store.get();

        if (oldStore === undefined) {
            chrome.storage.local.set({ [key]: [text] });

        } else {
            const newStore = Store.from(oldStore, text)

            chrome.storage.local.set({ [key]: newStore });
        }
    }

    static async get(): Promise<Store> {
        const result = await chrome.storage.local.get([key]);
        const stored = result[key];
        return stored === undefined ? [] : stored;
    }

    static async set(store: Store) {
        chrome.storage.local.set({ [key]: store });
    }

}

export default Store;