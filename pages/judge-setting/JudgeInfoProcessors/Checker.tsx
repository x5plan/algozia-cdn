import { type IJudgeInfoWithChecker, parseCheckerConfig } from "../Components/CheckerEditor";
import type { IJudgeInfoProcessor } from "./Types";

export const CheckerJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoWithChecker> = {
    parseJudgeInfo(raw, testData) {
        return {
            checker: parseCheckerConfig(raw.checker, testData),
        };
    },
    normalizeJudgeInfo(judgeInfo) {
        if (judgeInfo.checker.type === "custom") {
            if (judgeInfo.checker.timeLimit == null) delete judgeInfo.checker.timeLimit;
            if (judgeInfo.checker.memoryLimit == null) delete judgeInfo.checker.memoryLimit;
        }
    },
};
