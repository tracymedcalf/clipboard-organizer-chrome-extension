import { useEffect, useState } from "react";

import Store from "./Store";

// I had issues using the cookie hook libary from the background worker,
// so I decided to roll my own.
export function useCookie(): [Store, (_: Store) => void] {

    const [state, setState] = useState<Store>(new Store());

    useEffect(() => {

        (async () => {
            setState(await Store.get());
        })();

        const onChange = async () => {
            setState(await Store.get());
        };

        chrome.storage.onChanged.addListener(onChange);

        return () => {
            chrome.storage.onChanged.removeListener(onChange);
        };

    }, []);

    const setCookie = (newValue: Store) => {
        setState(newValue);
        Store.set(newValue);
    };

    return [state, setCookie];
}