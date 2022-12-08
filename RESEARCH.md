# Question search

Quora uses some sort of graphQL API. For example, searching for a question can be made with this endpoint, POST method:
https://www.quora.com/graphql/gql_para_POST?q=SearchResultsListQuery..
It uses persisted queries:
```
{
    "queryName": "SearchResultsListQuery",
    "variables": {
        "query": "how to walk",
        "disableSpellCheck": null,
        "resultType": "all_types",
        "author": null,
        "time": "all_times",
        "first": 10,
        "after": "19",
        "tribeId": null
    },
    "extensions": {
        "hash": "9dce4809922a976f52b021ed9bbfb4d49bff450675bad8c8913518b0e100d3c4"
    }
}
```

# Anti-scraping protection

Quora has anti-scraping protection. If the request is malformed, it will be rejected with 400 Bad Request. It is, however possible to get results data with `got-scraping` by applying correct headers.

Among necessary HEADERS seem to be (tested by manual exclusion):
`Cookie`, `Content-type: application/json`, `Quora-Formkey`

Forged `Quora-Formkey` is detected.

Among necessary Cookies seem to be (tested by manual exclusion):
`m-b_strict`,

Forged `m-b_strict` is detected.

So, example minimal header set:

```
Content-Type: application/json
Quora-Formkey: e60a6daaf551qqqq206677cadb0e9683
Cookie: m-b_strict=OMbPotJAqqqqWjyZJ97h8g==;
```

