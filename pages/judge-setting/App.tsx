import { useState } from "preact/hooks";
import React from "react";
import { Grid } from "semantic-ui-react";
import { v4 as uuid } from "uuid";

import type { E_ProblemType } from "../shared/Enums";
import { CodeBox } from "./Components/CodeBox";
import { JudgeInfoEditor } from "./Components/JudgeSettingEditor";
import { ProblemTypeEditor } from "./Components/ProblemTypeEditor";
import { getSharedObject } from "./Utils";

export const App: React.FC = () => {
    const { data, onUpdateType, onUpdateJudgeInfo } = getSharedObject();
    const [editorKey, setEditorKey] = useState(uuid());

    const [normalizeJudgeInfo, setNormalizeJudgeInfo] = useState<any>(data.judgeInfo);
    const [problemType, setProblemType] = useState<E_ProblemType>(data.type as E_ProblemType);

    return (
        <>
            <Grid.Column width={7}>
                <CodeBox judgeInfo={normalizeJudgeInfo} />
            </Grid.Column>
            <Grid.Column width={9}>
                <ProblemTypeEditor
                    type={problemType}
                    hasSubmission={data.hasSubmissions}
                    onTypeChange={(type) => {
                        setProblemType(type);
                        onUpdateType(type);
                        setEditorKey(uuid());
                    }}
                />
                <JudgeInfoEditor
                    key={editorKey}
                    problemType={problemType}
                    judgeInfoRaw={data.judgeInfo}
                    testData={data.testDataFileNames}
                    onUpdateNomalizedJudgeInfo={(judgeInfo) => {
                        setNormalizeJudgeInfo(judgeInfo);
                        onUpdateJudgeInfo(judgeInfo);
                    }}
                />
            </Grid.Column>
        </>
    );
};
