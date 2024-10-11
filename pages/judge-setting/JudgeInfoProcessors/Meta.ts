import { IJudgeInfoWithMeta, IMetaEditorOptions } from "../Components/MetaEditor/MetaEditor.type";
import { IJudgeInfoProcessor } from "./Types";

export const MetaJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoWithMeta, IMetaEditorOptions> = {
    parseJudgeInfo(raw, testData, options) {
        return {
            timeLimit: options.enableTimeMemoryLimit && Number.isSafeInteger(raw.timeLimit) ? raw.timeLimit : null,
            memoryLimit:
                options.enableTimeMemoryLimit && Number.isSafeInteger(raw.memoryLimit) ? raw.memoryLimit : null,
            fileIo:
                options.enableFileIo &&
                raw.fileIo &&
                typeof raw.fileIo.inputFilename === "string" &&
                typeof raw.fileIo.outputFilename === "string"
                    ? {
                          inputFilename: raw.fileIo.inputFilename,
                          outputFilename: raw.fileIo.outputFilename,
                      }
                    : null,
            runSamples: options.enableRunSamples ? !!raw.runSamples : null,
        };
    },
    normalizeJudgeInfo(judgeInfo, options) {
        if (!options.enableTimeMemoryLimit) {
            delete judgeInfo.timeLimit;
            delete judgeInfo.memoryLimit;
        }
        if (!judgeInfo.fileIo) delete judgeInfo.fileIo;
    },
};
