import "fomantic-ui/dist/semantic.css";
import "../shared/style.less";

import type React from "react";

import { CE_ProblemType } from "../shared/Enums";
import { JudgeSettingsEditor } from "./JudgeSettingEditor";

export const App: React.FC = () => {
    const onJudgeInfoChange = (judgeInfo: any, judgeInfoYaml: string) => {
        window.postMessage({ judgeInfo, judgeInfoYaml }, "*");
    };

    return (
        <JudgeSettingsEditor
            problemType={CE_ProblemType.Traditional}
            rawJudgeInfo={{}}
            testData={["file1.in", "file1.out", "file2.in", "file2.out", "file3.in", "file3.out"]}
            onJudgeInfoChange={onJudgeInfoChange}
        />
    );
};
