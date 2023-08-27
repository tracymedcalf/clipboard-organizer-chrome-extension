import { useEffect, useState } from "react";

import Text from "./Text";
import Store from "./Store";

export function useCookie(): [Text[], (_: Text[]) => void] {

    const [value, setValue] = useState<Text[]>([]);

    useEffect(() => {

        (async () => {
            setValue(await Store.get());
        })();

        const onChange = async (c: any, v: any) => {
            setValue(await Store.get());
        };

        chrome.storage.onChanged.addListener(onChange);

        return () => {
            chrome.storage.onChanged.removeListener(onChange);
        };

    }, []);

    const setCookie = (newValue: Text[]) => {
        Store.set(newValue);
    };

    return [value, setCookie];
}
