import { HashInfo } from "../constants/extension_codes.js";
import { QueryType } from "./query_types.js";

export type CrawlerState = {
    extensionCodes: Record<QueryType, HashInfo>;
    qids: Set<string | number>;
};
