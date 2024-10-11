import React from "react";
import { useCallback, useState } from "preact/hooks";

import { MetaEditor, type IJudgeInfoWithMeta } from "../Components/MetaEditor";
import { JudgeInfoWithSubtasks } from "../Components/SubtasksEditor";
import { IOptions } from "../Types";
import { IEditorComponentProps } from "./Types";
import { MetaJudgeInfoProcessor } from "../JudgeInfoProcessors/Meta";
import { IJudgeInfoProcessor } from "../JudgeInfoProcessors/Types";
import { ExtraSourceFilesJudgeInfoProcessor } from "../JudgeInfoProcessors/ExtraSourceFiles";
import { ExtraSourceFilesEditor, type IJudgeInfoWithExtraSourceFiles } from "../Components/ExtraSourceFilesEditor";
import { SubtaskJudgeInfoProcessor } from "../JudgeInfoProcessors/Subtasks";
import { SubtasksEditor } from "../Components/SubtasksEditor";
import { CheckerEditor } from "../Components/CheckerEditor/CheckerEditor";
import { IJudgeInfoWithChecker } from "../Components/CheckerEditor";
import { CheckerJudgeInfoProcessor } from "../JudgeInfoProcessors/Checker";
import { cloneDeep } from "lodash";

type IJudgeInfoTraditional = IJudgeInfoWithMeta &
    JudgeInfoWithSubtasks &
    IJudgeInfoWithChecker &
    IJudgeInfoWithExtraSourceFiles;

const judgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoTraditional> = {
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

const metaEditorOptions: IOptions<typeof MetaEditor> = {
    enableTimeMemoryLimit: true,
    enableFileIo: true,
    enableRunSamples: true,
};

const subtasksEditorOptions: IOptions<typeof SubtasksEditor> = {
    enableTimeMemoryLimit: true,
    enableInputFile: true,
    enableOutputFile: true,
    enableUserOutputFilename: false,
};

type ITraditionalProblemEditorProps = IEditorComponentProps<IJudgeInfoTraditional>;

export const TraditionalProblemEditor: React.FC<ITraditionalProblemEditorProps> = (props) => {
    const { pending, testData, rawJudgeInfo, onJudgeInfoUpdated } = props;

    const [judgeInfo, setJudgeInfo] = useState<IJudgeInfoTraditional>(
        judgeInfoProcessor.parseJudgeInfo(rawJudgeInfo, testData),
    );

    const onUpdateJudgeInfo = useCallback(
        (
            deltaOrReducer:
                | Partial<IJudgeInfoTraditional>
                | ((judgeInfo: IJudgeInfoTraditional) => Partial<IJudgeInfoTraditional>),
        ) => {
            setJudgeInfo((prev) => {
                const delta = typeof deltaOrReducer === "function" ? deltaOrReducer(prev) : deltaOrReducer;
                const next = { ...prev, ...delta };

                const obj = cloneDeep(next);
                judgeInfoProcessor.normalizeJudgeInfo(obj);
                onJudgeInfoUpdated(obj);

                return next;
            });
        },
        [],
    );

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
