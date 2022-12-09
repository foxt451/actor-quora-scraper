// minimal program for reaching API

import { log } from "crawlee";
import { gotScraping } from "got-scraping";

const testHeaders = `Content-Type: application/json
Quora-Formkey: e60a6daaf5513fff206677cadb0e9683
Cookie: m-b_strict=OMbPotJA0pFIWjyZJ97h8g==;`;

const obj = testHeaders.split("\n").reduce((prev, cur) => {
    const [key, value] = cur.split(": ");
    return { ...prev, [key]: value };
}, {});

console.log(JSON.stringify(obj));


const result = await gotScraping.post(
    "https://www.quora.com/graphql/gql_para_POST?q=SearchResultsListQuery",
    {
        body: JSON.stringify({
            queryName: "SearchResultsListQuery",
            variables: {
                query: "how to walk",
                disableSpellCheck: null,
                resultType: "all_types",
                author: null,
                time: "all_times",
                first: 10,
                after: "19",
                tribeId: null,
            },
            extensions: {
                hash: "9dce4809922a976f52b021ed9bbfb4d49bff450675bad8c8913518b0e100d3c4",
            },
        }),
        headers: obj,
    }
);
log.info(result.statusCode.toString());
log.info(result.body);
log.info(JSON.stringify(result.headers));
