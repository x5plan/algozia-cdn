import {
    type IJudgeInfoTraditional,
    metaEditorOptions,
    subtasksEditorOptions,
} from "../Components/TraditionalProblemEditor";
import { CheckerJudgeInfoProcessor } from "./Checker";
import { ExtraSourceFilesJudgeInfoProcessor } from "./ExtraSourceFiles";
import { MetaJudgeInfoProcessor } from "./Meta";
import { SubtaskJudgeInfoProcessor } from "./Subtasks";
import type { IJudgeInfoProcessor } from "./Types";

export const TraditionalProblemJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoTraditional> = {
    parseJudgeInfo(raw, testData) {
        return Object.assign(
            {},
            MetaJudgeInfoProcessor.parseJudgeInfo(raw, testData, metaEditorOptions),
            CheckerJudgeInfoProcessor.parseJudgeInfo(raw, testData),
            SubtaskJudgeInfoProcessor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
            ExtraSourceFilesJudgeInfoProcessor.parseJudgeInfo(raw, testData),
        );
    },
    normalizeJudgeInfo(judgeInfo) {
        MetaJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
        CheckerJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo);
        SubtaskJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
        ExtraSourceFilesJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo);
    },
};
