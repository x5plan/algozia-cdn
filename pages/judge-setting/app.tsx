import "fomantic-ui/dist/semantic.css";
import "../shared/style.less";

import { useCallback, useRef, useState } from "preact/hooks";
import React from "react";

import { CE_ProblemType } from "../shared/Enums";
import { JudgeSettingsEditor } from "./JudgeSettingEditor";
import type { IJudgeSettingEditorMessageData } from "./Types";

export const App: React.FC = () => {
    const messageChannelPortRef = useRef<MessagePort | null>(null);
    const [testData, setTestData] = useState<string[]>([]);
    const [judgeInfo, setJudgeInfo] = useState<any>({});
    const [problemType, setProblemType] = useState<CE_ProblemType>(CE_ProblemType.Traditional);

    const onJudgeInfoChange = (judgeInfo: any) => {
        if (messageChannelPortRef.current) {
            const message: IJudgeSettingEditorMessageData = { type: "UpdateJudgeInfo", judgeInfo };
            messageChannelPortRef.current.postMessage(message);
        }
    };

    const [loading, setLoading] = React.useState(true);
    const [pending, setPending] = React.useState(false);

    const onMessage = useCallback((event: MessageEvent<IJudgeSettingEditorMessageData>) => {
        if (event.data.type === "Initialize") {
            setTestData(event.data.testData);
            setJudgeInfo(event.data.judgeInfo);
            setProblemType(event.data.problemType);
            setLoading(false);
        } else if (event.data.type === "ChangeType") {
            setProblemType(event.data.problemType);
            setJudgeInfo({});
        } else if (event.data.type === "SubmitJudgeInfo") {
            setPending(true);
        }
    }, []);

    React.useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            if (event.data === "ready") {
                messageChannelPortRef.current = event.ports[0];
                messageChannelPortRef.current.onmessage = onMessage;
            }
        };

        window.addEventListener("message", messageHandler);

        return () => {
            window.removeEventListener("message", messageHandler);
        };
    }, [onMessage]);

    React.useEffect(
        () => () => {
            if (messageChannelPortRef.current) {
                messageChannelPortRef.current.close();
            }
        },
        [],
    );

    return (
        !loading && (
            <JudgeSettingsEditor
                problemType={problemType}
                rawJudgeInfo={judgeInfo}
                testData={testData}
                pending={pending}
                onJudgeInfoChange={onJudgeInfoChange}
            />
        )
    );
};
