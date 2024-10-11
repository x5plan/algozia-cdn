import { SubtaskScoringType } from "../../../shared/Enums";

export interface Testcase {
    uuid: string;
    inputFile?: string;
    outputFile?: string;
    userOutputFilename?: string;
    timeLimit?: number;
    memoryLimit?: number;
    points?: number;
}
export interface Subtask {
    uuid: string;
    timeLimit?: number;
    memoryLimit?: number;
    testcases: Testcase[];
    scoringType: SubtaskScoringType;
    points?: number;
    dependencies: number[];
}

export interface JudgeInfoWithSubtasks {
    timeLimit?: number;
    memoryLimit?: number;
    subtasks?: Subtask[];
}

export interface SubtasksEditorOptions {
    // Some of the problem types doesn't have ALL testcase props
    enableTimeMemoryLimit: boolean;
    enableInputFile: boolean | "optional";
    enableOutputFile: boolean | "optional";
    enableUserOutputFilename: boolean;
}
