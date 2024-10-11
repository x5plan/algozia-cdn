import { v4 as uuid } from "uuid";

import { E_SubtaskScoringType } from "../../shared/Enums";
import type { IJudgeInfoWithSubtasks, ISubtasksEditorOptions } from "../Components/SubtasksEditor";
import type { IJudgeInfoProcessor } from "./Types";

export const SubtaskJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoWithSubtasks, ISubtasksEditorOptions> = {
    parseJudgeInfo(raw, testData, options) {
        const subtaskCount = Array.isArray(raw.subtasks) ? raw.subtasks.length : 0;
        return {
            subtasks:
                Array.isArray(raw.subtasks) && raw.subtasks.length > 0
                    ? (raw.subtasks as any[])
                          .map((x) => x || {})
                          .map((rawSubtask) => ({
                              uuid: uuid(),
                              scoringType:
                                  rawSubtask.scoringType in E_SubtaskScoringType
                                      ? rawSubtask.scoringType
                                      : E_SubtaskScoringType.Sum,
                              points:
                                  Number.isSafeInteger(rawSubtask.points) && raw.subtasks.length > 1
                                      ? rawSubtask.points
                                      : null,
                              timeLimit:
                                  options.enableTimeMemoryLimit && Number.isSafeInteger(rawSubtask.timeLimit)
                                      ? rawSubtask.timeLimit
                                      : null,
                              memoryLimit:
                                  options.enableTimeMemoryLimit && Number.isSafeInteger(rawSubtask.memoryLimit)
                                      ? rawSubtask.memoryLimit
                                      : null,
                              dependencies: Array.isArray(rawSubtask.dependencies)
                                  ? (rawSubtask.dependencies as any[]).filter(
                                        (id) => typeof id === "number" && id >= 0 && id < subtaskCount,
                                    )
                                  : [],
                              testcases: Array.isArray(rawSubtask.testcases)
                                  ? (rawSubtask.testcases as any[])
                                        .map((x) => x || {})
                                        .map((rawTestcase) => ({
                                            uuid: uuid(),
                                            inputFile:
                                                options.enableInputFile && typeof rawTestcase.inputFile === "string"
                                                    ? rawTestcase.inputFile
                                                    : "",
                                            outputFile:
                                                options.enableOutputFile && typeof rawTestcase.outputFile === "string"
                                                    ? rawTestcase.outputFile
                                                    : "",
                                            userOutputFilename:
                                                options.enableUserOutputFilename &&
                                                typeof rawTestcase.userOutputFilename === "string"
                                                    ? rawTestcase.userOutputFilename
                                                    : "",
                                            points:
                                                Number.isSafeInteger(rawTestcase.points) &&
                                                rawSubtask.testcases.length > 0
                                                    ? rawTestcase.points
                                                    : null,
                                            timeLimit:
                                                options.enableTimeMemoryLimit &&
                                                Number.isSafeInteger(rawTestcase.timeLimit)
                                                    ? rawTestcase.timeLimit
                                                    : null,
                                            memoryLimit:
                                                options.enableTimeMemoryLimit &&
                                                Number.isSafeInteger(rawTestcase.memoryLimit)
                                                    ? rawTestcase.memoryLimit
                                                    : null,
                                        }))
                                  : [],
                          }))
                    : null,
        };
    },
    normalizeJudgeInfo(judgeInfo, options) {
        if (judgeInfo.subtasks) {
            for (const subtask of judgeInfo.subtasks) {
                delete subtask.uuid;
                if (subtask.points == null) delete subtask.points;
                if (!options.enableTimeMemoryLimit || subtask.timeLimit == null) delete subtask.timeLimit;
                if (!options.enableTimeMemoryLimit || subtask.memoryLimit == null) delete subtask.memoryLimit;
                if (subtask.dependencies == null || subtask.dependencies.length === 0) delete subtask.dependencies;
                for (const testcase of subtask.testcases) {
                    delete testcase.uuid;
                    if (testcase.points == null) delete testcase.points;

                    if (!options.enableInputFile) delete testcase.inputFile;
                    else if (!testcase.inputFile) testcase.inputFile = null;

                    if (!options.enableOutputFile) delete testcase.outputFile;
                    else if (!testcase.outputFile) testcase.outputFile = null;

                    if (!options.enableUserOutputFilename || !testcase.userOutputFilename) {
                        delete testcase.userOutputFilename;
                    }
                    if (!options.enableTimeMemoryLimit || testcase.timeLimit == null) delete testcase.timeLimit;
                    if (!options.enableTimeMemoryLimit || testcase.memoryLimit == null) delete testcase.memoryLimit;
                }
            }
        } else delete judgeInfo.subtasks;
    },
};
