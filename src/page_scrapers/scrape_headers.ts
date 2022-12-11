import { HtmlScrapableHeaders } from "../types/header_collection.js";

export const scrapeHeaders = (html: string): HtmlScrapableHeaders => {
    const formKey = /"formkey": "(.*?)"/.exec(html)?.[1] ?? "";
    const broadcastId = /"broadcastId": "(.*?)"/.exec(html)?.[1] ?? "";
    const revision = /"revision": "(.*?)"/.exec(html)?.[1] ?? "";
    const windowId = /"windowId": "(.*?)"/.exec(html)?.[1] ?? "";

    return {
        "Quora-Formkey": formKey,
        "Quora-Broadcast-Id": broadcastId,
        "Quora-Revision": revision,
        "Quora-Window-Id": windowId,
    };
};
