import * as React from "preact";

import MetaEditor, { JudgeInfoWithMeta } from "../Components/MetaEditor";
import SubtasksEditor, { JudgeInfoWithSubtasks } from "../Components/SubtasksEditor";
import CheckerEditor, { JudgeInfoWithChecker } from "../Components/CheckerEditor";
import ExtraSourceFilesEditor, { JudgeInfoWithExtraSourceFiles } from "../Components/ExtraSourceFilesEditor";
import { IEditorComponentProps, IJudgeInfoProcessor, IOptions } from "../Types";

const judgeInfoProcessor: IJudgeInfoProcessor<JudgeInfoTraditional> = {
    parseJudgeInfo(raw, testData) {
        return Object.assign(
            {},
            MetaEditor.parseJudgeInfo(raw, testData, metaEditorOptions),
            CheckerEditor.parseJudgeInfo(raw, testData),
            SubtasksEditor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
            ExtraSourceFilesEditor.parseJudgeInfo(raw, testData),
        );
    },
    normalizeJudgeInfo(judgeInfo) {
        MetaEditor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
        CheckerEditor.normalizeJudgeInfo(judgeInfo);
        SubtasksEditor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
        ExtraSourceFilesEditor.normalizeJudgeInfo(judgeInfo);
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

export type JudgeInfoTraditional = JudgeInfoWithMeta &
    JudgeInfoWithSubtasks &
    JudgeInfoWithChecker &
    JudgeInfoWithExtraSourceFiles;
type ITraditionalProblemEditorProps = IEditorComponentProps<JudgeInfoTraditional>;

export const TraditionalProblemEditor: React.FunctionComponent<ITraditionalProblemEditorProps> = (props) => {
    return (
        <>
            <MetaEditor {...props} options={metaEditorOptions} />
            <CheckerEditor {...props} />
            <SubtasksEditor {...props} options={subtasksEditorOptions} />
            <ExtraSourceFilesEditor {...props} />
        </>
    );
};
