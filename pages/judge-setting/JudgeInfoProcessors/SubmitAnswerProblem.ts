import type { IJudgeInfoSubmitAnswer } from "../Components/SubmitAnswerProblemEditor";
import { metaEditorOptions, subtasksEditorOptions } from "../Components/SubmitAnswerProblemEditor";
import { CheckerJudgeInfoProcessor } from "./Checker";
import { MetaJudgeInfoProcessor } from "./Meta";
import { SubtaskJudgeInfoProcessor } from "./Subtasks";
import type { IJudgeInfoProcessor } from "./Types";

export const SubmitAnswerProblemJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoSubmitAnswer> = {
    parseJudgeInfo(raw, testData) {
        return Object.assign(
            {},
            MetaJudgeInfoProcessor.parseJudgeInfo(raw, testData, metaEditorOptions),
            CheckerJudgeInfoProcessor.parseJudgeInfo(raw, testData),
            SubtaskJudgeInfoProcessor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
        );
    },
    normalizeJudgeInfo(judgeInfo) {
        MetaJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
        CheckerJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo);
        SubtaskJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
    },
};
