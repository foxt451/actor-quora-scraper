import { HtmlScrapableHeaders } from "../types/header_collection.js";

export const scrapeHeaders = (html: string): HtmlScrapableHeaders => {
    const formKey = /"formkey": "(.*?)"/.exec(html)?.[1] ?? "";

    // IMPORTANT: attaching Quora-BroadcastId, Quora-Revision, Quora-WindowId (some of them, not necessarily all at once)
    // has proved to be detrimental to the resulting number of results, for example, it will lower the number of returned
    // questions from ~700 to ~100 (of course, it's likely the VALUE of headers that was wrong, since Quora client sends them too).
    // Be sure to check the number of actual questions on the site and number of answers of the
    // most popular question and compare it to the results when playing with headers in the future
    return {
        "Quora-Formkey": formKey,
    };
};
