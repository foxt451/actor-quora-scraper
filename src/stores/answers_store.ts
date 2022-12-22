import { Actor, log } from "apify";
import {
    constructAnswersKVKey,
    isAnswersKVKey,
    removeDuplicatesByProperty,
} from "../helpers/index.js";
import { AnswerInfo } from "../types/parser_results.js";

class AnswersStore {
    private answers: Map<string, { modified: boolean; answers: AnswerInfo[] }> =
        new Map();

    constructor() {
        Actor.on("persistState", async () => {
            await this.persist();
        });
    }

    async persist() {
        let stored = 0;
        for (const [qid, state] of this.answers.entries()) {
            if (!state.modified) {
                continue;
            }
            const key = constructAnswersKVKey(qid);
            stored++;
            await Actor.setValue(key, state.answers);
            state.modified = false;
        }
        log.info(`Persisted ${stored} questions' answers.`);
    }

    async initialize() {
        const defKV = await Actor.openKeyValueStore();
        await defKV.forEachKey(async (key) => {
            const isAnswersKey = isAnswersKVKey(key);
            if (isAnswersKey.is) {
                const { qid } = isAnswersKey;
                this.answers.set(qid, {
                    modified: false,
                    answers: (await defKV.getValue(key)) ?? [],
                });
            }
        });
    }

    public addAnswers(newAnswers: AnswerInfo[], qid: string) {
        this.answers.set(qid, {
            modified: true,
            answers: removeDuplicatesByProperty(
                [...(this.answers.get(qid)?.answers ?? []), ...newAnswers],
                "aid"
            ),
        });
    }
}

export const answerStore = new AnswersStore();
