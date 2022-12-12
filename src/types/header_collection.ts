// headers that can be scraped from initial html response
export type HtmlScrapableHeaders = {
    "Quora-Formkey": string;
};

export type NecessaryHeaders = HtmlScrapableHeaders & {
    Host: "www.quora.com";
    Origin: "https://www.quora.com";
    "Content-Type": "application/json";
};
