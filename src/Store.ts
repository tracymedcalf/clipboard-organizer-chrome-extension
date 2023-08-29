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

        const store = await Store.get();

        store.texts.push(text);

        Store.set(store);
    }

    static async get(): Promise<Store> {
        const result = await chrome.storage.local.get([key]);
        const store = result[key];
        return store === undefined ? new Store() : store;
    }

    static async set(store: Store) {
        chrome.storage.local.set({ [key]: store });
    }

    static toText(store: Store) {
        return store.texts.map(t => t.text).join(store.delimiter);
    }
}

export default Store;