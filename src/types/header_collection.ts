// headers that can be scraped from initial html response
export type HtmlScrapableHeaders = {
    "Quora-Formkey": string;
};

export type NecessaryHeaders = HtmlScrapableHeaders & {
    Host: string;
    Origin: string;
    "Content-Type": "application/json";
};
