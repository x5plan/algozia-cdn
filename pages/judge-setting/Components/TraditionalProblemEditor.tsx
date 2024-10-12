import React from "react";

import type { IJudgeInfoWithChecker } from "../Components/CheckerEditor";
import { CheckerEditor } from "../Components/CheckerEditor/CheckerEditor";
import { ExtraSourceFilesEditor, type IJudgeInfoWithExtraSourceFiles } from "../Components/ExtraSourceFilesEditor";
import { type IJudgeInfoWithMeta, MetaEditor } from "../Components/MetaEditor";
import type { IJudgeInfoWithSubtasks } from "../Components/SubtasksEditor";
import { SubtasksEditor } from "../Components/SubtasksEditor";
import type { IEditorComponentProps, IOptions } from "./Type";

export type IJudgeInfoTraditional = IJudgeInfoWithMeta &
    IJudgeInfoWithSubtasks &
    IJudgeInfoWithChecker &
    IJudgeInfoWithExtraSourceFiles;

export const metaEditorOptions: IOptions<typeof MetaEditor> = {
    enableTimeMemoryLimit: true,
    enableFileIo: true,
    enableRunSamples: true,
};

export const subtasksEditorOptions: IOptions<typeof SubtasksEditor> = {
    enableTimeMemoryLimit: true,
    enableInputFile: true,
    enableOutputFile: true,
    enableUserOutputFilename: false,
};

export type ITraditionalProblemEditorProps = IEditorComponentProps<IJudgeInfoTraditional>;

export const TraditionalProblemEditor: React.FC<ITraditionalProblemEditorProps> = (props) => {
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
            <ExtraSourceFilesEditor
                judgeInfo={judgeInfo}
                testData={testData}
                pending={pending}
                onUpdateJudgeInfo={onUpdateJudgeInfo}
            />
        </>
    );
};
