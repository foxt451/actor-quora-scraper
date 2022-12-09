import { HtmlScrapableHeaders } from "../types/header_collection.js";

export const scrapeHeaders = (html: string): HtmlScrapableHeaders => {
    const formKey = /"formkey": "(.*?)"/.exec(html)?.[1] ?? "";
    return {
        "Quora-Formkey": formKey,
    };
};
