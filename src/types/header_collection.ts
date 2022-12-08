export type NecessaryHeaders = {
    "Quora-Formkey": string;
    "Content-Type": "application/json";
};

// headers that can be scraped from initial html response
export type HtmlScrapableHeaders = {
    "Quora-Formkey": string;
};
