import { cloneDeep } from "lodash";
import { useCallback, useState } from "preact/hooks";
import React from "react";

import type { IJudgeInfoWithChecker } from "../Components/CheckerEditor";
import { CheckerEditor } from "../Components/CheckerEditor/CheckerEditor";
import { ExtraSourceFilesEditor, type IJudgeInfoWithExtraSourceFiles } from "../Components/ExtraSourceFilesEditor";
import { type IJudgeInfoWithMeta, MetaEditor } from "../Components/MetaEditor";
import type { IJudgeInfoWithSubtasks } from "../Components/SubtasksEditor";
import { SubtasksEditor } from "../Components/SubtasksEditor";
import { CheckerJudgeInfoProcessor } from "../JudgeInfoProcessors/Checker";
import { ExtraSourceFilesJudgeInfoProcessor } from "../JudgeInfoProcessors/ExtraSourceFiles";
import { MetaJudgeInfoProcessor } from "../JudgeInfoProcessors/Meta";
import { SubtaskJudgeInfoProcessor } from "../JudgeInfoProcessors/Subtasks";
import type { IJudgeInfoProcessor } from "../JudgeInfoProcessors/Types";
import type { IOptions } from "../Types";
import type { IEditorComponentProps } from "./Types";

type IJudgeInfoTraditional = IJudgeInfoWithMeta &
    IJudgeInfoWithSubtasks &
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
        [onJudgeInfoUpdated],
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
