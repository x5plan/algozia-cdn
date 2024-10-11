import React from "react";
import { Form, Input } from "semantic-ui-react";

import style from "./MetaEditor.module.less";

import { JudgeInfoProcessor, EditorComponentProps } from "./Types";

export interface JudgeInfoWithMeta {
    timeLimit?: number;
    memoryLimit?: number;
    fileIo?: {
        inputFilename: string;
        outputFilename: string;
    };
    runSamples?: boolean;
}

interface MetaEditorOptions {
    // Some of the problem types doesn't have ALL meta props
    enableTimeMemoryLimit: boolean;
    enableFileIo: boolean;
    enableRunSamples: boolean;
}

type MetaEditorProps = EditorComponentProps<JudgeInfoWithMeta, MetaEditorOptions>;

const MetaEditor: React.FC<MetaEditorProps> = (props) => {
    const judgeInfo = props.judgeInfo;

    return (
        <div>
            <Form>
                {props.options.enableTimeMemoryLimit && (
                    <Form.Group>
                        <Form.Field width={8}>
                            <label>时间限制</label>
                            <Input
                                className={style.labeledInput}
                                value={judgeInfo.timeLimit == null ? "" : judgeInfo.timeLimit}
                                label="ms"
                                labelPosition="right"
                                icon="clock"
                                iconPosition="left"
                                onChange={(e, { value }) =>
                                    (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                    props.onUpdateJudgeInfo({ timeLimit: value === "" ? null : Number(value) })
                                }
                            />
                        </Form.Field>
                        <Form.Field width={8}>
                            <label>内存限制</label>
                            <Input
                                className={style.labeledInput}
                                value={judgeInfo.memoryLimit == null ? "" : judgeInfo.memoryLimit}
                                label="MiB"
                                labelPosition="right"
                                icon="microchip"
                                iconPosition="left"
                                onChange={(e, { value }) =>
                                    (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                    props.onUpdateJudgeInfo({ memoryLimit: value === "" ? null : Number(value) })
                                }
                            />
                        </Form.Field>
                    </Form.Group>
                )}
                {props.options.enableFileIo && judgeInfo.fileIo && (
                    <Form.Group>
                        <Form.Field width={8}>
                            <label>输入文件</label>
                            <Input
                                value={judgeInfo.fileIo.inputFilename}
                                readOnly={!judgeInfo.fileIo}
                                icon="sign in"
                                iconPosition="left"
                                onChange={(e, { value }) =>
                                    props.onUpdateJudgeInfo({
                                        fileIo: {
                                            inputFilename: value,
                                            outputFilename: judgeInfo.fileIo.outputFilename,
                                        },
                                    })
                                }
                            />
                        </Form.Field>
                        <Form.Field width={8}>
                            <label>输出文件</label>
                            <Input
                                value={judgeInfo.fileIo.outputFilename}
                                readOnly={!judgeInfo.fileIo}
                                icon="sign out"
                                iconPosition="left"
                                onChange={(e, { value }) =>
                                    props.onUpdateJudgeInfo({
                                        fileIo: {
                                            inputFilename: judgeInfo.fileIo.inputFilename,
                                            outputFilename: value,
                                        },
                                    })
                                }
                            />
                        </Form.Field>
                    </Form.Group>
                )}
                {props.options.enableFileIo && (
                    <Form.Group>
                        <Form.Checkbox
                            className={style.checkbox}
                            width={8}
                            label="使用标准输入输出"
                            checked={!judgeInfo.fileIo}
                            onChange={(e, { checked }) =>
                                props.onUpdateJudgeInfo({
                                    fileIo: checked ? null : { inputFilename: "", outputFilename: "" },
                                })
                            }
                        />
                    </Form.Group>
                )}
            </Form>
        </div>
    );
};

const judgeInfoProcessor: JudgeInfoProcessor<JudgeInfoWithMeta, MetaEditorOptions> = {
    parseJudgeInfo(raw, testData, options) {
        return {
            timeLimit: options.enableTimeMemoryLimit && Number.isSafeInteger(raw.timeLimit) ? raw.timeLimit : null,
            memoryLimit:
                options.enableTimeMemoryLimit && Number.isSafeInteger(raw.memoryLimit) ? raw.memoryLimit : null,
            fileIo:
                options.enableFileIo &&
                raw.fileIo &&
                typeof raw.fileIo.inputFilename === "string" &&
                typeof raw.fileIo.outputFilename === "string"
                    ? {
                          inputFilename: raw.fileIo.inputFilename,
                          outputFilename: raw.fileIo.outputFilename,
                      }
                    : null,
            runSamples: options.enableRunSamples ? !!raw.runSamples : null,
        };
    },
    normalizeJudgeInfo(judgeInfo, options) {
        if (!options.enableTimeMemoryLimit) {
            delete judgeInfo.timeLimit;
            delete judgeInfo.memoryLimit;
        }
        if (!judgeInfo.runSamples) delete judgeInfo.runSamples;
        if (!judgeInfo.fileIo) delete judgeInfo.fileIo;
    },
};

export default Object.assign(MetaEditor, judgeInfoProcessor);
