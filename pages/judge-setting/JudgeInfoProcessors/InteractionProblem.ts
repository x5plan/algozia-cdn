import {
    checkCodeFileExtension,
    filterValidCompileAndRunOptions,
    getDefaultCompileAndRunOptions,
} from "../../shared/CodeLanguageUtils";
import { E_CodeLanguage } from "../../shared/Enums";
import {
    type IInteractorConfig,
    type IJudgeInfoInteraction,
    metaEditorOptions,
    subtasksEditorOptions,
} from "../Components/InteractionProblemEditor";
import { ExtraSourceFilesJudgeInfoProcessor } from "./ExtraSourceFiles";
import { MetaJudgeInfoProcessor } from "./Meta";
import { SubtaskJudgeInfoProcessor } from "./Subtasks";
import type { IJudgeInfoProcessor } from "./Types";

export const InteractionProblemJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoInteraction> = {
    parseJudgeInfo(raw, testData) {
        return Object.assign(
            {},
            MetaJudgeInfoProcessor.parseJudgeInfo(raw, testData, metaEditorOptions),
            {
                interactor: parseInteractorConfig(raw.interactor || {}, testData),
            },
            SubtaskJudgeInfoProcessor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
            ExtraSourceFilesJudgeInfoProcessor.parseJudgeInfo(raw, testData),
        );
    },
    normalizeJudgeInfo(judgeInfo) {
        MetaJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
        if (!judgeInfo.interactor.sharedMemorySize) delete judgeInfo.interactor.sharedMemorySize;
        if (judgeInfo.interactor.timeLimit == null) delete judgeInfo.interactor.timeLimit;
        if (judgeInfo.interactor.memoryLimit == null) delete judgeInfo.interactor.memoryLimit;
        SubtaskJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
        ExtraSourceFilesJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo);
    },
};

export function parseInteractorConfig(interactor: Partial<IInteractorConfig>, testData: string[]): IInteractorConfig {
    const language = Object.values(E_CodeLanguage).includes(interactor.language)
        ? interactor.language
        : Object.values(E_CodeLanguage)[0];
    return {
        interface: ["stdio", "shm"].includes(interactor.interface) ? interactor.interface : "stdio",
        sharedMemorySize:
            interactor.interface !== "shm"
                ? null
                : Number.isSafeInteger(interactor.sharedMemorySize) &&
                    interactor.sharedMemorySize >= 4 &&
                    interactor.sharedMemorySize <= 128
                  ? interactor.sharedMemorySize
                  : 4,
        language: language,
        compileAndRunOptions:
            language === interactor.language
                ? filterValidCompileAndRunOptions(language, interactor.compileAndRunOptions)
                : getDefaultCompileAndRunOptions(language),
        filename:
            interactor.filename && typeof interactor.filename === "string"
                ? interactor.filename
                : testData.find((file) => checkCodeFileExtension(language, file)) || testData[0] || "",
        timeLimit: Number.isSafeInteger(interactor.timeLimit) ? interactor.timeLimit : null,
        memoryLimit: Number.isSafeInteger(interactor.memoryLimit) ? interactor.memoryLimit : null,
    };
}
