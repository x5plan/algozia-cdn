import type React from "react";

import type { IJudgeInfoWithChecker } from "../Components/CheckerEditor";
import { CheckerEditor } from "../Components/CheckerEditor";
import type { IJudgeInfoWithMeta } from "../Components/MetaEditor";
import { MetaEditor } from "../Components/MetaEditor";
import type { IJudgeInfoWithSubtasks } from "../Components/SubtasksEditor";
import { SubtasksEditor } from "../Components/SubtasksEditor";
import type { IEditorComponentProps, IOptions } from "./Type";

export type IJudgeInfoSubmitAnswer = IJudgeInfoWithMeta & IJudgeInfoWithSubtasks & IJudgeInfoWithChecker;

export const metaEditorOptions: IOptions<typeof MetaEditor> = {
    enableTimeMemoryLimit: false,
    enableFileIo: false,
    enableRunSamples: false,
};

export const subtasksEditorOptions: IOptions<typeof SubtasksEditor> = {
    enableTimeMemoryLimit: false,
    enableInputFile: "optional",
    enableOutputFile: true,
    enableUserOutputFilename: true,
};

export type ISubmitAnswerProblemEditorProps = IEditorComponentProps<IJudgeInfoSubmitAnswer>;

export const SubmitAnswerProblemEditor: React.FC<ISubmitAnswerProblemEditorProps> = (props) => {
    const { pending, testData, judgeInfo, onUpdateJudgeInfo } = props;

    return (
        <>
            <MetaEditor
                judgeInfo={judgeInfo}
                testData={testData}
                pending={pending}
                onUpdateJudgeInfo={onUpdateJudgeInfo}
                options={metaEditorOptions}
            />
            <CheckerEditor
                judgeInfo={judgeInfo}
                testData={testData}
                pending={pending}
                onUpdateJudgeInfo={onUpdateJudgeInfo}
            />
            <SubtasksEditor
                judgeInfo={judgeInfo}
                testData={testData}
                pending={pending}
                onUpdateJudgeInfo={onUpdateJudgeInfo}
                options={subtasksEditorOptions}
            />
        </>
    );
};
