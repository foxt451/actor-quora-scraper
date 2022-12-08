// minimal program for reaching

import { log } from "crawlee";
import { gotScraping } from "got-scraping";

const testHeaders = `Content-Type: application/json
Quora-Formkey: e60a6daaf5513fff206677cadb0e9683
Cookie: m-b_strict=OMbPotJA0pFIWjyZJ97h8g==;`;

const obj = testHeaders.split("\n").reduce((prev, cur) => {
    const [key, value] = cur.split(": ");
    return { ...prev, [key]: value };
}, {});

const result = await gotScraping.post(
    "https://www.quora.com/graphql/gql_para_POST?q=SearchResultsListQuery",
    {
        body: `query SearchResultsListQuery{
    __typename
}`,
        headers: obj,
    }
);
log.info(result.statusCode.toString());
log.info(result.body);
log.info(JSON.stringify(result.headers));
