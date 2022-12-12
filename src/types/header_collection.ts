// headers that can be scraped from initial html response
export type HtmlScrapableHeaders = {
    "Quora-Formkey": string;
    "Quora-Broadcast-Id": string;
    "Quora-Revision": string;
    "Quora-Window-Id": string;
};

export type NecessaryHeaders = HtmlScrapableHeaders & {
    Host: "www.quora.com";
    Origin: "https://www.quora.com";
    "Content-Type": "application/json";
    "Quora-Canary-Revision": false;
    "Quora-Page-Creation-Time": number;
};
