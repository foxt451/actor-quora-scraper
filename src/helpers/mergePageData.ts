import { Actor } from "apify";

// helps merge new page data into previous pages already stored in KVStore
export const mergePageData = async (key: string, newData: unknown[]) => {
    const prevData = await Actor.getValue<unknown[]>(key);
    if (prevData) {
        newData = [...prevData, newData];
    }
    await Actor.setValue(key, newData);
};
