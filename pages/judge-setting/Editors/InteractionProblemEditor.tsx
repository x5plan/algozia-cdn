import { cloneDeep } from "lodash";
import { useCallback, useState } from "preact/hooks";
import type React from "react";
import { Form, Header, Input, Menu, Segment } from "semantic-ui-react";

import {
    checkCodeFileExtension,
    filterValidCompileAndRunOptions,
    getDefaultCompileAndRunOptions,
} from "../../shared/CodeLanguageUtils";
import { E_CodeLanguage } from "../../shared/Enums";
import style from "../Components/CheckerEditor/CheckerEditor.module.less";
import { CodeLanguageAndOptions } from "../Components/CheckerEditor/CodeLanguageAndOptions";
import type { IJudgeInfoWithExtraSourceFiles } from "../Components/ExtraSourceFilesEditor";
import { ExtraSourceFilesEditor } from "../Components/ExtraSourceFilesEditor";
import type { IJudgeInfoWithMeta } from "../Components/MetaEditor";
import { MetaEditor } from "../Components/MetaEditor";
import type { IJudgeInfoWithSubtasks } from "../Components/SubtasksEditor";
import { SubtasksEditor } from "../Components/SubtasksEditor";
import { TestDataFileSelector } from "../Components/TestDataFileSelector";
import { ExtraSourceFilesJudgeInfoProcessor } from "../JudgeInfoProcessors/ExtraSourceFiles";
import { MetaJudgeInfoProcessor } from "../JudgeInfoProcessors/Meta";
import { SubtaskJudgeInfoProcessor } from "../JudgeInfoProcessors/Subtasks";
import type { IJudgeInfoProcessor } from "../JudgeInfoProcessors/Types";
import type { IOptions } from "../Types";
import type { IEditorComponentProps } from "./Types";

interface IInteractorConfig {
    interface: InteractorInterface;
    sharedMemorySize?: number;
    language: E_CodeLanguage;
    compileAndRunOptions: Record<string, unknown>;
    filename: string;
    timeLimit?: number;
    memoryLimit?: number;
}

interface IJudgeInfoWithInteractor {
    interactor?: IInteractorConfig;
}

type IJudgeInfoInteraction = IJudgeInfoWithMeta &
    IJudgeInfoWithSubtasks &
    IJudgeInfoWithInteractor &
    IJudgeInfoWithExtraSourceFiles;

type InteractorInterface = "stdio" | "shm";

const metaEditorOptions: IOptions<typeof MetaEditor> = {
    enableTimeMemoryLimit: true,
    enableFileIo: false,
    enableRunSamples: true,
};

const subtasksEditorOptions: IOptions<typeof SubtasksEditor> = {
    enableTimeMemoryLimit: true,
    enableInputFile: true,
    enableOutputFile: false,
    enableUserOutputFilename: false,
};

const interactorInterfaces: InteractorInterface[] = ["stdio", "shm"];

const judgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoInteraction> = {
    parseJudgeInfo(raw, testData) {
        return Object.assign(
            {},
            MetaJudgeInfoProcessor.parseJudgeInfo(raw, testData, metaEditorOptions),
            {
                interactor: parseInteractorConfig(raw.interactor || {}, testData),
            },
            SubtaskJudgeInfoProcessor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
            ExtraSourceFilesJudgeInfoProcessor.parseJudgeInfo(raw, testData),
        );
    },
    normalizeJudgeInfo(judgeInfo) {
        MetaJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
        if (!judgeInfo.interactor.sharedMemorySize) delete judgeInfo.interactor.sharedMemorySize;
        if (judgeInfo.interactor.timeLimit == null) delete judgeInfo.interactor.timeLimit;
        if (judgeInfo.interactor.memoryLimit == null) delete judgeInfo.interactor.memoryLimit;
        SubtaskJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
        ExtraSourceFilesJudgeInfoProcessor.normalizeJudgeInfo(judgeInfo);
    },
};

type InteractionProblemEditorProps = IEditorComponentProps<IJudgeInfoInteraction>;

export const InteractionProblemEditor: React.FC<InteractionProblemEditorProps> = (props) => {
    const { pending, testData, rawJudgeInfo, onJudgeInfoUpdated } = props;

    const [judgeInfo, setJudgeInfo] = useState<IJudgeInfoInteraction>(
        judgeInfoProcessor.parseJudgeInfo(rawJudgeInfo, testData),
    );

    const interactor = judgeInfo.interactor;

    const onUpdateJudgeInfo = useCallback(
        (
            deltaOrReducer:
                | Partial<IJudgeInfoInteraction>
                | ((judgeInfo: IJudgeInfoInteraction) => Partial<IJudgeInfoInteraction>),
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

    const onUpdateInteractor = useCallback(
        (delta: Partial<IInteractorConfig>) => {
            onUpdateJudgeInfo(({ interactor }) => ({
                interactor: Object.assign({}, interactor, delta),
            }));
        },
        [onUpdateJudgeInfo],
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
            <Form className={style.wrapper}>
                <div className={style.menuWrapper}>
                    <Header size="tiny" content="交互器" />
                    <Menu secondary pointing>
                        {interactorInterfaces.map((interactorInterface) => (
                            <Menu.Item
                                key={interactorInterface}
                                content={
                                    {
                                        stdio: "标准输入/输出",
                                        shm: "共享内存",
                                    }[interactorInterface]
                                }
                                active={interactor.interface === interactorInterface}
                                onClick={() =>
                                    interactor.interface !== interactorInterface &&
                                    onUpdateInteractor({
                                        interface: interactorInterface,
                                        sharedMemorySize: interactorInterface === "shm" ? 4 : null,
                                    })
                                }
                            />
                        ))}
                    </Menu>
                </div>
                <Segment color="grey" className={style.checkerConfig}>
                    <div className={style.custom}>
                        <TestDataFileSelector
                            type="FormSelect"
                            label="文件"
                            placeholder="无文件"
                            value={interactor.filename}
                            testData={props.testData}
                            onChange={(value) => onUpdateInteractor({ filename: value })}
                        />
                        <div className={style.compileAndRunOptions}>
                            <CodeLanguageAndOptions
                                elementAfterLanguageSelect={
                                    <Form.Field style={{ visibility: interactor.interface === "shm" ? "" : "hidden" }}>
                                        <label>共享内存大小</label>
                                        <Input
                                            value={normalizeSharedMemorySize(interactor.sharedMemorySize)}
                                            type="number"
                                            min={4}
                                            max={128}
                                            label="MiB"
                                            labelPosition="right"
                                            onChange={(e, { value }) =>
                                                onUpdateInteractor({
                                                    sharedMemorySize: normalizeSharedMemorySize(Number(value)),
                                                })
                                            }
                                        />
                                    </Form.Field>
                                }
                                language={interactor.language}
                                compileAndRunOptions={interactor.compileAndRunOptions}
                                onUpdateLanguage={(newLanguage) => onUpdateInteractor({ language: newLanguage })}
                                onUpdateCompileAndRunOptions={(compileAndRunOptions) =>
                                    onUpdateInteractor({ compileAndRunOptions: compileAndRunOptions })
                                }
                            />
                        </div>
                        <Form.Group>
                            <Form.Field width={8}>
                                <label>时间限制</label>
                                <Input
                                    className={style.labeledInput}
                                    placeholder={judgeInfo["timeLimit"]}
                                    value={interactor.timeLimit == null ? "" : interactor.timeLimit}
                                    label="ms"
                                    labelPosition="right"
                                    icon="clock"
                                    iconPosition="left"
                                    onChange={(e, { value }) =>
                                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                        onUpdateInteractor({ timeLimit: value === "" ? null : Number(value) })
                                    }
                                />
                            </Form.Field>
                            <Form.Field width={8}>
                                <label>内存限制</label>
                                <Input
                                    className={style.labeledInput}
                                    placeholder={judgeInfo["memoryLimit"]}
                                    value={interactor.memoryLimit == null ? "" : interactor.memoryLimit}
                                    label="MiB"
                                    labelPosition="right"
                                    icon="microchip"
                                    iconPosition="left"
                                    onChange={(e, { value }) =>
                                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                        onUpdateInteractor({ memoryLimit: value === "" ? null : Number(value) })
                                    }
                                />
                            </Form.Field>
                        </Form.Group>
                    </div>
                </Segment>
            </Form>
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

function parseInteractorConfig(interactor: Partial<IInteractorConfig>, testData: string[]): IInteractorConfig {
    const language = Object.values(E_CodeLanguage).includes(interactor.language)
        ? interactor.language
        : Object.values(E_CodeLanguage)[0];
    return {
        interface: ["stdio", "shm"].includes(interactor.interface) ? interactor.interface : "stdio",
        sharedMemorySize:
            interactor.interface !== "shm"
                ? null
                : Number.isSafeInteger(interactor.sharedMemorySize) &&
                    interactor.sharedMemorySize >= 4 &&
                    interactor.sharedMemorySize <= 128
                  ? interactor.sharedMemorySize
                  : 4,
        language: language,
        compileAndRunOptions:
            language === interactor.language
                ? filterValidCompileAndRunOptions(language, interactor.compileAndRunOptions)
                : getDefaultCompileAndRunOptions(language),
        filename:
            interactor.filename && typeof interactor.filename === "string"
                ? interactor.filename
                : testData.find((file) => checkCodeFileExtension(language, file)) || testData[0] || "",
        timeLimit: Number.isSafeInteger(interactor.timeLimit) ? interactor.timeLimit : null,
        memoryLimit: Number.isSafeInteger(interactor.memoryLimit) ? interactor.memoryLimit : null,
    };
}

function normalizeSharedMemorySize(x: number) {
    x = Math.round(x);
    if (x < 4) return 4;
    if (x > 128) return 128;
    return x;
}
