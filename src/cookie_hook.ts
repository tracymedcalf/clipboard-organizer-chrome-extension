import { useEffect, useState } from "react";

import Text from "./Text";
import Store from "./Store";

export function useCookie(): [Text[], (_: Text[]) => void] {

    const [state, setState] = useState<Text[]>([]);

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

    const setCookie = (newValue: Text[]) => {
        setState(newValue);
        Store.set(newValue);
    };

    return [state, setCookie];
}