import { BASE_URL } from "../constants/api.js";

export const combineUrl = (url: string, base = BASE_URL): string => {
    return new URL(url, base).toString();
};
