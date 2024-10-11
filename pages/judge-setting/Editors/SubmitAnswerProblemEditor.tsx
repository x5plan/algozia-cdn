import { cloneDeep } from "lodash";
import { useCallback, useState } from "preact/hooks";
import type React from "react";

import type { IJudgeInfoWithChecker } from "../Components/CheckerEditor";
import { CheckerEditor } from "../Components/CheckerEditor";
import type { IJudgeInfoWithMeta } from "../Components/MetaEditor";
import { MetaEditor } from "../Components/MetaEditor";
import type { IJudgeInfoWithSubtasks } from "../Components/SubtasksEditor";
import { SubtasksEditor } from "../Components/SubtasksEditor";
import { CheckerJudgeInfoProcessor } from "../JudgeInfoProcessors/Checker";
import { MetaJudgeInfoProcessor } from "../JudgeInfoProcessors/Meta";
import { SubtaskJudgeInfoProcessor } from "../JudgeInfoProcessors/Subtasks";
import type { IJudgeInfoProcessor } from "../JudgeInfoProcessors/Types";
import type { IOptions } from "../Types";
import type { IEditorComponentProps } from "./Types";

type IJudgeInfoSubmitAnswer = IJudgeInfoWithMeta & IJudgeInfoWithSubtasks & IJudgeInfoWithChecker;

const judgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoSubmitAnswer> = {
    parseJudgeInfo(raw, testData) {
        return Object.assign(
            {},
            MetaJudgeInfoProcessor.parseJudgeInfo(raw, testData, metaEditorOptions),
            CheckerJudgeInfoProcessor.parseJudgeInfo(raw, testData),
            SubtaskJudgeInfoProcessor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
        );
    },
    normalizeJudgeInfo(judgeInfo) {
        MetaJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
        CheckerJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo);
        SubtaskJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
    },
};

const metaEditorOptions: IOptions<typeof MetaEditor> = {
    enableTimeMemoryLimit: false,
    enableFileIo: false,
    enableRunSamples: false,
};

const subtasksEditorOptions: IOptions<typeof SubtasksEditor> = {
    enableTimeMemoryLimit: false,
    enableInputFile: "optional",
    enableOutputFile: true,
    enableUserOutputFilename: true,
};

export type ISubmitAnswerProblemEditorProps = IEditorComponentProps<IJudgeInfoSubmitAnswer>;

export const SubmitAnswerProblemEditor: React.FC<ISubmitAnswerProblemEditorProps> = (props) => {
    const { pending, testData, rawJudgeInfo, onJudgeInfoUpdated } = props;

    const [judgeInfo, setJudgeInfo] = useState<IJudgeInfoSubmitAnswer>(
        judgeInfoProcessor.parseJudgeInfo(rawJudgeInfo, testData),
    );

    const onUpdateJudgeInfo = useCallback(
        (
            deltaOrReducer:
                | Partial<IJudgeInfoSubmitAnswer>
                | ((judgeInfo: IJudgeInfoSubmitAnswer) => Partial<IJudgeInfoSubmitAnswer>),
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
        </>
    );
};
