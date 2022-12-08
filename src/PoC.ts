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

const result = await gotScraping.post(
    "https://www.quora.com/graphql/gql_para_POST?q=IntrospectionQuery",
    {
        body: JSON.stringify({
            variables: {},
            query: `query IntrospectionQuery {__schema{queryType{name}mutationType{name}subscriptionType{name}types{...FullType}directives{name description locations args{...InputValue}}}}fragment FullType on __Type{kind name description fields(includeDeprecated:true){name description args{...InputValue}type{...TypeRef}isDeprecated deprecationReason}inputFields{...InputValue}interfaces{...TypeRef}enumValues(includeDeprecated:true){name description isDeprecated deprecationReason}possibleTypes{...TypeRef}}fragment InputValue on __InputValue{name description type{...TypeRef}defaultValue}fragment TypeRef on __Type{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name}}}}}}}}`,
        }),
        headers: obj,
    }
);
log.info(result.statusCode.toString());
log.info(result.body);
log.info(JSON.stringify(result.headers));
