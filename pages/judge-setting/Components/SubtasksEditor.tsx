import type React from "react";
import { useState, useRef, useMemo } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";

import { Dropdown, Header, Menu, Popup, Button, Form, Message, Input, Ref, Table } from "semantic-ui-react";
import { v4 as uuid } from "uuid";
import update, { Spec } from "immutability-helper";

import style from "./SubtasksEditor.module.less";

import { useDialog } from "@/utils/hooks";
import TestDataFileSelector from "./TestDataFileSelector";
import { JudgeInfoProcessor, EditorComponentProps } from "./Types";
import { detectTestcasesByMatchingInputToOutput, detectTestcasesByMatchingOutputToInput } from "./detect-testcases";

interface Testcase {
    uuid: string;
    inputFile?: string;
    outputFile?: string;
    userOutputFilename?: string;
    timeLimit?: number;
    memoryLimit?: number;
    points?: number;
}

enum SubtaskScoringType {
    Sum = "Sum",
    GroupMin = "GroupMin",
    GroupMul = "GroupMul",
}

interface Subtask {
    uuid: string;
    timeLimit?: number;
    memoryLimit?: number;
    testcases: Testcase[];
    scoringType: SubtaskScoringType;
    points?: number;
    dependencies: number[];
}

export interface JudgeInfoWithSubtasks {
    timeLimit: number;
    memoryLimit: number;
    subtasks: Subtask[];
}

interface SubtasksEditorOptions {
    // Some of the problem types doesn't have ALL testcase props
    enableTimeMemoryLimit: boolean;
    enableInputFile: boolean | "optional";
    enableOutputFile: boolean | "optional";
    enableUserOutputFilename: boolean;
}

function randomColorFromUuid(uuid: string) {
    const hex = uuid.split("-").join(""),
        COLOR_COUNT = 11;
    let x = 0;
    for (let i = 0; i < hex.length; i += 4) {
        x ^= parseInt(hex.substr(i, 4), 16);
    }
    return x % COLOR_COUNT;
}

interface SubtaskEditorTastcaseItemProps {
    options: SubtasksEditorOptions;

    testData: string[];
    testcaseIndex: number;
    testcaseCount: number;
    testcase: Testcase;

    defaultPercentagePoints: number;
    defaultTimeLimit: number;
    defaultMemoryLimit: number;

    onUpdate: (updateInfo: Partial<Testcase>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onAddTestcaseBefore: () => void;
    onAddTestcaseAfter: () => void;
}

const SubtaskEditorTastcaseItem: React.FC<SubtaskEditorTastcaseItemProps> = (props) => {
    const [refOptionsButton, setRefOptionsButton] = useState<HTMLElement>(null);

    return (
        <>
            <Menu
                className={
                    style.menu +
                    " " +
                    style.menuTestcase +
                    " " +
                    style.menuTestcaseFirstLine +
                    " " +
                    style["color_" + randomColorFromUuid(props.testcase.uuid)]
                }
                attached
            >
                <Menu.Item className={style.itemTestcaseTitle}>#{props.testcaseIndex + 1}</Menu.Item>
                {props.options.enableInputFile ? (
                    <TestDataFileSelector
                        type="ItemSearchDropdown"
                        iconInputOrOutput="sign in"
                        testData={props.testData}
                        placeholder="输入文件"
                        optional={props.options.enableInputFile === "optional"}
                        value={props.testcase.inputFile}
                        onChange={(value) => props.onUpdate({ inputFile: value })}
                    />
                ) : (
                    <Menu.Item className={style.outputFileNotNeeded} content="不需要输入文件" />
                )}
                <Menu.Menu position="right">
                    {props.options.enableUserOutputFilename && (
                        <Menu.Item className={style.itemTestcaseUserOutputFilename}></Menu.Item>
                    )}
                    {props.options.enableTimeMemoryLimit && (
                        <>
                            <Menu.Item className={style.itemTestcaseTimeLimit}>
                                <Input
                                    transparent
                                    placeholder={props.defaultTimeLimit}
                                    value={props.testcase.timeLimit == null ? "" : props.testcase.timeLimit}
                                    icon="clock"
                                    iconPosition="left"
                                    onChange={(e, { value }) =>
                                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                        props.onUpdate({ timeLimit: value === "" ? null : Number(value) })
                                    }
                                />
                            </Menu.Item>
                            <Menu.Item className={style.itemLabel}>ms</Menu.Item>
                        </>
                    )}
                    <Dropdown item icon="plus" className={`icon ${style.itemWithIcon}`}>
                        <Dropdown.Menu>
                            <Dropdown.Item
                                icon="angle double up"
                                text="在此测试点前"
                                onClick={() => props.onAddTestcaseBefore()}
                            />
                            <Dropdown.Item
                                icon="angle double down"
                                text="在此测试点后"
                                onClick={() => props.onAddTestcaseAfter()}
                            />
                        </Dropdown.Menu>
                    </Dropdown>
                </Menu.Menu>
            </Menu>
            <Menu
                className={
                    style.menu +
                    " " +
                    style.menuTestcase +
                    " " +
                    style.menuTestcaseSecondLine +
                    " " +
                    style["color_" + randomColorFromUuid(props.testcase.uuid)]
                }
                attached
            >
                <Menu.Item className={style.itemTestcaseScore}>
                    <Input
                        transparent
                        placeholder={props.defaultPercentagePoints}
                        value={props.testcase.points == null ? "" : props.testcase.points}
                        disabled={props.testcaseCount === 1}
                        icon="percent"
                        onChange={(e, { value }) =>
                            (value === "" ||
                                (Number.isSafeInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) &&
                            props.onUpdate({ points: value === "" ? null : Number(value) })
                        }
                    />
                </Menu.Item>
                {props.options.enableOutputFile ? (
                    <TestDataFileSelector
                        type="ItemSearchDropdown"
                        iconInputOrOutput="sign out"
                        testData={props.testData}
                        placeholder="输出文件"
                        optional={props.options.enableOutputFile === "optional"}
                        value={props.testcase.outputFile}
                        onChange={(value) => props.onUpdate({ outputFile: value })}
                    />
                ) : (
                    <Menu.Item className={style.outputFileNotNeeded} content="不需要输出文件" />
                )}
                <Menu.Menu position="right">
                    {props.options.enableUserOutputFilename && (
                        <Menu.Item className={style.itemTestcaseUserOutputFilename}>
                            <Input
                                transparent
                                placeholder={props.testcase.outputFile || "用户输出文件名"}
                                value={
                                    props.testcase.userOutputFilename == null ? "" : props.testcase.userOutputFilename
                                }
                                icon="file upload"
                                iconPosition="left"
                                onChange={(e, { value }) =>
                                    props.onUpdate({ userOutputFilename: value === "" ? null : value })
                                }
                            />
                        </Menu.Item>
                    )}
                    {props.options.enableTimeMemoryLimit && (
                        <>
                            <Menu.Item className={style.itemTestcaseMemoryLimit}>
                                <Input
                                    transparent
                                    placeholder={props.defaultMemoryLimit}
                                    value={props.testcase.memoryLimit == null ? "" : props.testcase.memoryLimit}
                                    icon="microchip"
                                    iconPosition="left"
                                    onChange={(e, { value }) =>
                                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                        props.onUpdate({ memoryLimit: value === "" ? null : Number(value) })
                                    }
                                />
                            </Menu.Item>
                            <Menu.Item className={style.itemLabel}>MiB</Menu.Item>
                        </>
                    )}
                    <Ref innerRef={setRefOptionsButton}>
                        <Dropdown item icon="bars" className={`icon ${style.itemWithIcon}`}>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    icon="angle double up"
                                    text="上移"
                                    onClick={() => props.onMoveUp()}
                                    disabled={props.testcaseIndex === 0}
                                />
                                <Dropdown.Item
                                    icon="angle double down"
                                    text="下移"
                                    onClick={() => props.onMoveDown()}
                                    disabled={props.testcaseIndex === props.testcaseCount - 1}
                                />
                                <Popup
                                    trigger={<Dropdown.Item icon="delete" text="删除" />}
                                    context={refOptionsButton}
                                    content={<Button negative content="确认删除" onClick={() => props.onDelete()} />}
                                    on="click"
                                    position="bottom center"
                                />
                            </Dropdown.Menu>
                        </Dropdown>
                    </Ref>
                </Menu.Menu>
            </Menu>
        </>
    );
};

interface SubtaskEditorProps {
    options: SubtasksEditorOptions;

    testData: string[];
    subtaskIndex: number;
    subtaskCount: number;
    subtask: Subtask;

    defaultPercentagePoints: number;
    defaultTimeLimit: number;
    defaultMemoryLimit: number;

    onUpdate: (updateInfo: Partial<Subtask>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onAddSubtaskBefore: () => void;
    onAddSubtaskAfter: () => void;

    onUpdateTestcase: (testcaseIndex: number, updateInfo: Partial<Testcase>) => void;
    onDeleteTestcase: (testcaseIndex: number) => void;
    onMoveTestcaseUp: (testcaseIndex: number) => void;
    onMoveTestcaseDown: (testcaseIndex: number) => void;
    onAddTestcase: (testcaseIndex: number) => void;
}

const SubtaskEditor: React.FC<SubtaskEditorProps> = (props) => {
    const [testcasesExpanded, setTestcasesExpanded] = useState(props.subtaskCount === 1);

    const refOptionsButton = useRef(null);

    const sumSpecfiedPercentagePoints = props.subtask.testcases
        .map((testcase) => testcase.points)
        .filter((x) => x != null)
        .reduce((sum, x) => sum + x, 0);
    const countUnspecfiedPercentagePoints = props.subtask.testcases.filter(
        (testcase) => testcase.points == null,
    ).length;
    const defaultPercentagePoints =
        (sumSpecfiedPercentagePoints > 100
            ? 0
            : Math.round((100 - sumSpecfiedPercentagePoints) / countUnspecfiedPercentagePoints)) || 0;

    const [autoAddTestcaseRegexForInput, setAutoAddTestcaseRegexForInput] = useState("");
    const [autoAddTestcaseRegexForOutput, setAutoAddTestcaseRegexForOutput] = useState("");
    const [autoAddTestcaseErrorCompileForInput, setAutoAddTestcaseErrorCompileForInput] = useState("");
    const [autoAddTestcaseErrorCompileForOutput, setAutoAddTestcaseErrorCompileForOutput] = useState("");
    const [autoAddTestcaseErrorMatching, setAutoAddTestcaseErrorMatching] = useState("");
    const [autoAddTestcaseMatchResult, setAutoAddTestcaseMatchResult] = useState<[string, string][]>([]);

    // If the user only input one of the regexes, generate the default for another automatically
    function getDefaultRegexForOutput(regexForInput: string) {
        if (!regexForInput) return "^(.*?)\\.(?:out|ans|OUT|ANS)$";

        let re = regexForInput;
        re = re.split("input").join("output");
        re = re.split("INPUT").join("OUTPUT");
        if (re.endsWith(".in")) re = re.substring(0, re.length - 3) + ".(?:out|ans)";
        if (re.endsWith(".IN")) re = re.substring(0, re.length - 3) + ".(?:OUT|ANS)";
        if (re.endsWith(".in$")) re = re.substring(0, re.length - 4) + ".(?:out|ans)$";
        if (re.endsWith(".IN$")) re = re.substring(0, re.length - 4) + ".(?:OUT|ANS)$";
        return re === regexForInput ? "" : re;
    }

    function getDefaultRegexForInput(regexForOutput: string) {
        if (!regexForOutput) return "^(.*?)\\.(?:in|IN)$";

        let re = regexForOutput;
        re = re.split("output").join("input");
        re = re.split("OUTPUT").join("INPUT");
        if (re.endsWith(".out") || re.endsWith(".ans")) re = re.substring(0, re.length - 4) + ".in";
        if (re.endsWith(".OUT") || re.endsWith(".ANS")) re = re.substring(0, re.length - 4) + ".IN";
        if (re.endsWith(".out$") || re.endsWith(".ans$")) re = re.substring(0, re.length - 5) + ".in";
        if (re.endsWith(".OUT$") || re.endsWith(".ANS$")) re = re.substring(0, re.length - 5) + ".IN";
        return re === regexForOutput ? "" : re;
    }

    const enableOutputFile = props.options.enableOutputFile;

    // Pass the new value via argument
    // Because the states' values are not being updated immediately after setState()
    function autoAddTestcaseDoMatching(input: string, output: string) {
        const defaultInput = getDefaultRegexForInput(output),
            defaultOutput = getDefaultRegexForOutput(input);
        let inputIsDefault = false,
            outputIsDefault = false;

        if (!input) {
            input = defaultInput;
            inputIsDefault = true;
        }

        if (!output) {
            output = defaultOutput;
            outputIsDefault = true;
        }

        if (!input || !output) {
            setAutoAddTestcaseErrorCompileForInput("");
            setAutoAddTestcaseErrorCompileForOutput("");
            setAutoAddTestcaseErrorMatching("");
            setAutoAddTestcaseMatchResult([]);
            return;
        }

        let regexForInput: RegExp, regexForOutput: RegExp;
        try {
            regexForInput = new RegExp(input);
            setAutoAddTestcaseErrorCompileForInput("");
        } catch (e) {
            // If the regex is auto generated, do not show error message
            if (!inputIsDefault) {
                setAutoAddTestcaseErrorCompileForInput(`无法编译用于输入文件的正则表达式：${e.message}`);
            } else setAutoAddTestcaseErrorCompileForInput("");
            setAutoAddTestcaseErrorMatching("");
            setAutoAddTestcaseMatchResult([]);
        }
        if (enableOutputFile) {
            try {
                regexForOutput = new RegExp(output);
                setAutoAddTestcaseErrorCompileForOutput("");
            } catch (e) {
                // If the regex is auto generated, do not show error message
                if (!outputIsDefault) {
                    setAutoAddTestcaseErrorCompileForOutput(`无法编译用于输出文件的正则表达式：${e.message}`);
                } else setAutoAddTestcaseErrorCompileForOutput("");
                setAutoAddTestcaseErrorMatching("");
                setAutoAddTestcaseMatchResult([]);
            }
        }

        if (regexForInput == null || (regexForOutput == null && enableOutputFile)) return;

        if (!enableOutputFile) {
            const result: [string, string][] = props.testData
                .filter((file) => file.match(regexForInput))
                .map((file) => [file, null]);
            setAutoAddTestcaseMatchResult(result);
        } else {
            const matchesForInput = props.testData.map((file) => file.match(regexForInput)).filter((x) => x);
            const matchesForOutput = props.testData.map((file) => file.match(regexForOutput)).filter((x) => x);
            const result: [string, string][] = [];
            if (matchesForInput.length > 0 && matchesForOutput.length > 0) {
                const groupCount = matchesForInput[0].length - 1;
                if (groupCount !== matchesForOutput[0].length - 1) {
                    setAutoAddTestcaseErrorMatching(
                        `捕获组数量不匹配，在输入文件中有 ${groupCount} 个，但在输出文件中有 matchesForOutput[0].length - 1 个。`,
                    );
                } else if (groupCount === 0) {
                    setAutoAddTestcaseErrorMatching(
                        "无捕获组。你需要在正则表达式中使用捕获组以帮助我们关联输入与输出文件。",
                    );
                } else {
                    while (matchesForInput.length !== 0) {
                        const currentMatchForInput = matchesForInput.shift();

                        // Find the matching output filename with the current input filename
                        for (let i = 0; i < matchesForOutput.length; i++) {
                            let foundNonMatch = false;
                            for (let j = 1; j <= groupCount; j++) {
                                if (currentMatchForInput[j] !== matchesForOutput[i][j]) {
                                    foundNonMatch = true;
                                    break;
                                }
                            }

                            if (!foundNonMatch) {
                                result.push([currentMatchForInput.input, matchesForOutput[i].input]);
                                matchesForOutput.splice(i, 1);
                            }
                        }
                    }

                    setAutoAddTestcaseMatchResult(result);
                }
            }
        }
    }

    function getNewTestcases(matchResult: [string, string][]): Testcase[] {
        return matchResult.map((m) => ({
            uuid: uuid(),
            inputFile: m[0],
            outputFile: m[1],
        }));
    }

    function doReplace() {
        props.onUpdate({
            testcases: getNewTestcases(autoAddTestcaseMatchResult),
        });
        setTestcasesExpanded(true);
        autoAddTestcaseDialog.close();
    }

    const autoAddTestcaseError = [
        autoAddTestcaseErrorCompileForInput,
        autoAddTestcaseErrorCompileForOutput,
        autoAddTestcaseErrorMatching,
    ]
        .filter((x) => x)
        .join("\n");
    const autoAddTestcaseDialog = useDialog(
        {},
        <Header
            icon="magic"
            className={style.dialogHeader}
            content={
                <>
                    自动添加测试点
                    <div className={style.dialogHeaderInfo}>子任务 #{props.subtaskIndex + 1}</div>
                </>
            }
        />,
        (() => {
            const defaultInput = getDefaultRegexForInput(autoAddTestcaseRegexForOutput),
                defaultOutput = getDefaultRegexForOutput(autoAddTestcaseRegexForInput);
            const input = autoAddTestcaseRegexForInput || defaultInput,
                output = autoAddTestcaseRegexForOutput || defaultOutput;

            return (
                <>
                    <p className={style.autoAddTestcasesHelp}>
                        {props.options.enableOutputFile ? (
                            <>
                                输入正则表达式以匹配文件名，使用捕获组来表示输入输出文件名中相同的部分。
                                <br />
                                如果两个文件名分别被输入、输出的正则表达式匹配，且其每个捕获组的文本对应相同，则它们成为一组测试点。
                            </>
                        ) : (
                            "输入正则表达式以匹配文件名，每个被匹配的文件会作为一个测试点的输入文件。"
                        )}
                    </p>
                    <Form>
                        <Form.Group>
                            <Form.Field width={8}>
                                <label>输入文件</label>
                                <Input
                                    placeholder={defaultInput}
                                    value={autoAddTestcaseRegexForInput}
                                    icon="sign in"
                                    iconPosition="left"
                                    onChange={(e, { value }) => {
                                        setAutoAddTestcaseRegexForInput(value);
                                        autoAddTestcaseDoMatching(value, autoAddTestcaseRegexForOutput);
                                    }}
                                />
                            </Form.Field>
                            {props.options.enableOutputFile && (
                                <Form.Field width={8}>
                                    <label>输出文件</label>
                                    <Input
                                        placeholder={defaultOutput}
                                        value={autoAddTestcaseRegexForOutput}
                                        icon="sign out"
                                        iconPosition="left"
                                        onChange={(e, { value }) => {
                                            setAutoAddTestcaseRegexForOutput(value);
                                            autoAddTestcaseDoMatching(autoAddTestcaseRegexForInput, value);
                                        }}
                                    />
                                </Form.Field>
                            )}
                        </Form.Group>
                    </Form>
                    {autoAddTestcaseError ? (
                        <Message className={style.dialogMessage} error content={autoAddTestcaseError} />
                    ) : (
                        <Message
                            className={style.dialogMessage}
                            success={autoAddTestcaseMatchResult.length > 0}
                            info={autoAddTestcaseMatchResult.length === 0}
                            content={
                                !input || !output
                                    ? "输入正则表达式以进行匹配。"
                                    : `共匹配到 ${autoAddTestcaseMatchResult.length} 个测试点。`
                            }
                        />
                    )}
                    {autoAddTestcaseMatchResult.length > 0 && (
                        <Table textAlign="center" compact="very" celled unstackable>
                            <Table.Header>
                                <Table.Row>
                                    {[1, 2].map((i) => (
                                        <Fragment key={i}>
                                            <Table.HeaderCell width={1}>#</Table.HeaderCell>
                                            <Table.HeaderCell width={props.options.enableOutputFile ? 3 : 6}>
                                                输入文件
                                            </Table.HeaderCell>
                                            {props.options.enableOutputFile && (
                                                <Table.HeaderCell width={3}>输出文件</Table.HeaderCell>
                                            )}
                                        </Fragment>
                                    ))}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {[...Array(Math.ceil(autoAddTestcaseMatchResult.length / 2))]
                                    .map((_, i, a) => [i, a.length + i])
                                    .map((ids) => (
                                        <Table.Row>
                                            {ids.map((id) =>
                                                id >= autoAddTestcaseMatchResult.length ? null : (
                                                    <Fragment key={id}>
                                                        <Table.Cell>
                                                            <strong>{id + 1}</strong>
                                                        </Table.Cell>
                                                        <Table.Cell>{autoAddTestcaseMatchResult[id][0]}</Table.Cell>
                                                        {props.options.enableOutputFile && (
                                                            <Table.Cell>{autoAddTestcaseMatchResult[id][1]}</Table.Cell>
                                                        )}
                                                    </Fragment>
                                                ),
                                            )}
                                        </Table.Row>
                                    ))}
                            </Table.Body>
                        </Table>
                    )}
                </>
            );
        })(),
        <>
            <Button content="关闭" onClick={() => autoAddTestcaseDialog.close()} />
            <Button
                positive
                disabled={autoAddTestcaseMatchResult.length === 0}
                content="追加测试点"
                onClick={() => {
                    const current = props.subtask.testcases.map((testcase) => [
                        testcase.inputFile,
                        testcase.outputFile,
                    ]);
                    const toAppend = autoAddTestcaseMatchResult.filter(
                        (result) => !current.some((testcase) => result[0] === testcase[0] && result[1] === testcase[1]),
                    );
                    props.onUpdate({
                        testcases: props.subtask.testcases.concat(getNewTestcases(toAppend)),
                    });
                    setTestcasesExpanded(true);
                    autoAddTestcaseDialog.close();
                }}
            />
            <Popup
                trigger={
                    <Button
                        primary
                        disabled={autoAddTestcaseMatchResult.length === 0}
                        content="替换子任务"
                        onClick={() => props.subtask.testcases.length === 0 && doReplace()}
                    />
                }
                // It's safe to replace if no testcases at present, don't confirm
                disabled={props.subtask.testcases.length === 0}
                content={<Button content="确认替换" onClick={doReplace} />}
                on="click"
                position="top center"
            />
        </>,
    );

    function openAutoAddTestcasesDialog() {
        autoAddTestcaseDialog.open();
        autoAddTestcaseDoMatching(autoAddTestcaseRegexForInput, autoAddTestcaseRegexForOutput);
    }

    function sortTestcases() {
        const temp: [number[], Testcase][] = props.subtask.testcases.map((testcase) => [
            (testcase.inputFile || testcase.outputFile).match(/\d+/g).map(parseInt),
            testcase,
        ]);
        temp.sort(([a], [b]) => {
            if (a.length != b.length) return a.length - b.length;
            for (let i = 0; i < a.length; i++) if (a[i] != b[i]) return a[i] - b[i];
            return 0;
        });

        props.onUpdate({
            testcases: temp.map(([numbers, testcase]) => testcase),
        });
    }

    return (
        <>
            {autoAddTestcaseDialog.element}
            <Menu
                attached="top"
                className={
                    style.menu +
                    " " +
                    style.menuHeader +
                    " " +
                    style["color_" + randomColorFromUuid(props.subtask.uuid)]
                }
            >
                <Menu.Item className={style.itemTitle}>
                    <strong>
                        {props.subtaskCount === 1 ? "单个子任务" : <>子任务 &nbsp; #{props.subtaskIndex + 1}</>}
                    </strong>
                    <div className={style.subtaskTitleTestcasesCount}>props.subtask.testcases.length</div>
                </Menu.Item>
                <Menu.Menu position="right">
                    {props.options.enableTimeMemoryLimit && (
                        <>
                            <Menu.Item className={style.itemSubtaskTimeLimit}>
                                <Input
                                    transparent
                                    placeholder={props.defaultTimeLimit}
                                    value={props.subtask.timeLimit == null ? "" : props.subtask.timeLimit}
                                    icon="clock"
                                    iconPosition="left"
                                    onChange={(e, { value }) =>
                                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                        props.onUpdate({ timeLimit: value === "" ? null : Number(value) })
                                    }
                                />
                            </Menu.Item>
                            <Menu.Item className={style.itemLabel}>ms</Menu.Item>
                            <Menu.Item className={style.itemSubtaskMemoryLimit}>
                                <Input
                                    transparent
                                    placeholder={props.defaultMemoryLimit}
                                    value={props.subtask.memoryLimit == null ? "" : props.subtask.memoryLimit}
                                    icon="microchip"
                                    iconPosition="left"
                                    onChange={(e, { value }) =>
                                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                                        props.onUpdate({ memoryLimit: value === "" ? null : Number(value) })
                                    }
                                />
                            </Menu.Item>
                            <Menu.Item className={style.itemLabel}>MiB</Menu.Item>
                        </>
                    )}
                    {props.subtaskCount > 1 && (
                        <Menu.Item className={style.itemSubtaskScore}>
                            <Input
                                transparent
                                placeholder={props.defaultPercentagePoints}
                                value={props.subtask.points == null ? "" : props.subtask.points}
                                icon="percent"
                                onChange={(e, { value }) =>
                                    (value === "" ||
                                        (Number.isSafeInteger(Number(value)) &&
                                            Number(value) >= 0 &&
                                            Number(value) <= 100)) &&
                                    props.onUpdate({ points: value === "" ? null : Number(value) })
                                }
                            />
                        </Menu.Item>
                    )}
                    <Ref innerRef={refOptionsButton}>
                        <Dropdown item icon="bars" className={`icon ${style.itemWithIcon}`}>
                            <Dropdown.Menu>
                                <Dropdown.Item icon="sort numeric down" text="排序" onClick={sortTestcases} />
                                <Dropdown.Item
                                    icon="arrow up"
                                    text="在之前添加子任务"
                                    onClick={() => props.onAddSubtaskBefore()}
                                />
                                <Dropdown.Item
                                    icon="arrow down"
                                    text="在之后添加子任务"
                                    onClick={() => props.onAddSubtaskAfter()}
                                />
                                <Dropdown.Item
                                    icon="plus"
                                    text="添加测试点"
                                    onClick={() => (
                                        props.onAddTestcase(props.subtask.testcases.length), setTestcasesExpanded(true)
                                    )}
                                />
                                <Dropdown.Item
                                    icon="angle double up"
                                    text="上移"
                                    disabled={props.subtaskIndex === 0}
                                    onClick={() => props.onMoveUp()}
                                />
                                <Dropdown.Item
                                    icon="angle double down"
                                    text="下移"
                                    disabled={props.subtaskIndex === props.subtaskCount - 1}
                                    onClick={() => props.onMoveDown()}
                                />
                                <Popup
                                    trigger={<Dropdown.Item icon="delete" text="删除" />}
                                    context={refOptionsButton}
                                    content={<Button negative content="确认删除" onClick={() => props.onDelete()} />}
                                    on="click"
                                    position="bottom center"
                                />
                            </Dropdown.Menu>
                        </Dropdown>
                    </Ref>
                    <Menu.Item
                        as="a"
                        icon="magic"
                        className={style.itemWithIcon}
                        onClick={openAutoAddTestcasesDialog}
                    />
                </Menu.Menu>
            </Menu>
            <Menu attached className={style.menu}>
                <Dropdown
                    item
                    value={props.subtask.scoringType}
                    className={style.itemScoringTypeDropdown}
                    options={Object.values(SubtaskScoringType).map((type) => ({
                        key: type,
                        value: type,
                        text:
                            type === SubtaskScoringType.Sum
                                ? "各测试点分数求和"
                                : type === SubtaskScoringType.GroupMin
                                  ? "各测试点分数取最小值"
                                  : "各测试点分数按百分比相乘",
                    }))}
                    onChange={(e, { value }) => props.onUpdate({ scoringType: value as SubtaskScoringType })}
                />
                <Menu.Menu position="right">
                    {props.subtask.testcases.length === 0 ? (
                        <Menu.Item icon="circle outline" content="暂无测试点" />
                    ) : (
                        <Menu.Item
                            as="a"
                            icon={testcasesExpanded ? "minus square outline" : "plus square outline"}
                            content={testcasesExpanded ? "收起测试点" : "展开测试点"}
                            onClick={() => setTestcasesExpanded(!testcasesExpanded)}
                        />
                    )}
                </Menu.Menu>
            </Menu>
            {testcasesExpanded &&
                props.subtask.testcases.map((testcase, testcaseIndex) => (
                    <SubtaskEditorTastcaseItem
                        options={props.options}
                        key={testcase.uuid}
                        testData={props.testData}
                        testcaseIndex={testcaseIndex}
                        testcaseCount={props.subtask.testcases.length}
                        testcase={testcase}
                        defaultPercentagePoints={defaultPercentagePoints}
                        defaultTimeLimit={
                            props.subtask.timeLimit != null ? props.subtask.timeLimit : props.defaultTimeLimit
                        }
                        defaultMemoryLimit={
                            props.subtask.memoryLimit != null ? props.subtask.memoryLimit : props.defaultMemoryLimit
                        }
                        onUpdate={(updateInfo) => props.onUpdateTestcase(testcaseIndex, updateInfo)}
                        onDelete={() => props.onDeleteTestcase(testcaseIndex)}
                        onMoveUp={() => props.onMoveTestcaseUp(testcaseIndex)}
                        onMoveDown={() => props.onMoveTestcaseDown(testcaseIndex)}
                        onAddTestcaseBefore={() => props.onAddTestcase(testcaseIndex)}
                        onAddTestcaseAfter={() => props.onAddTestcase(testcaseIndex + 1)}
                    />
                ))}
            {props.subtaskCount > 1 && (
                <>
                    <Menu attached="bottom" className={style.menu + " " + style.menuFooter}>
                        <Menu.Item>依赖子任务</Menu.Item>
                        <Dropdown
                            className={style.itemSearchDropdown + " " + style.itemDependencies}
                            item
                            multiple
                            search
                            selection
                            value={props.subtask.dependencies}
                            options={[...Array(props.subtaskCount).keys()]
                                .filter((i) => i != props.subtaskIndex)
                                .map((i) => ({
                                    key: i,
                                    value: i,
                                    text: i + 1,
                                }))}
                            onChange={(e, { value }) => props.onUpdate({ dependencies: value as number[] })}
                        />
                    </Menu>
                </>
            )}
        </>
    );
};

type SubtasksEditorProps = EditorComponentProps<JudgeInfoWithSubtasks, SubtasksEditorOptions>;

const SubtasksEditor: React.FC<SubtasksEditorProps> = (props) => {
    const judgeInfo = props.judgeInfo;

    const autoTestcases = useMemo(() => {
        if (
            props.options.enableInputFile === true ||
            (props.options.enableInputFile === "optional" && props.options.enableOutputFile !== true)
        )
            return detectTestcasesByMatchingInputToOutput(props.testData, props.options.enableOutputFile !== true);
        else return detectTestcasesByMatchingOutputToInput(props.testData, true);
    }, [props.testData]);

    // Prevent losing subtasks by toggling "auto detect testcases"
    const [subtasksBackup, setSubtasksBackup] = useState(
        judgeInfo.subtasks || [{ scoringType: SubtaskScoringType.Sum, testcases: [], uuid: uuid(), dependencies: [] }],
    );

    // For manual subtask editor
    const sumSpecfiedPercentagePoints = (judgeInfo.subtasks || [])
        .map((subtask) => subtask.points)
        .filter((x) => x != null)
        .reduce((sum, x) => sum + x, 0);
    const countUnspecfiedPercentagePoints = (judgeInfo.subtasks || []).filter(
        (subtask) => subtask.points == null,
    ).length;
    const defaultPercentagePoints =
        (sumSpecfiedPercentagePoints > 100
            ? 0
            : Math.round((100 - sumSpecfiedPercentagePoints) / countUnspecfiedPercentagePoints)) || 0;

    function updateSubtasks($spec: Spec<Subtask[]>) {
        props.onUpdateJudgeInfo({ subtasks: update(judgeInfo.subtasks, $spec) });
    }

    function onUpdateSubtask(subtaskIndex: number, updateInfo: Partial<Subtask>) {
        updateSubtasks({
            [subtaskIndex]: {
                $merge: updateInfo,
            },
        });
    }

    function mapSubtaskDependencyIdReference(callback: (id: number) => number): (subtasks: Subtask[]) => Subtask[] {
        return (subtasks) =>
            subtasks.map((subtask) =>
                Object.assign({}, subtask, {
                    dependencies: subtask.dependencies.map(callback).filter((x) => x != null),
                }),
            );
    }

    function onDeleteSubtask(subtaskIndex: number) {
        // If only one subtask, clear it instead of deleting it
        if (judgeInfo.subtasks.length === 1) {
            updateSubtasks({
                $set: [
                    {
                        uuid: uuid(),
                        scoringType: SubtaskScoringType.Sum,
                        testcases: [],
                        dependencies: [],
                    },
                ],
            });
            return;
        }

        updateSubtasks({
            $splice: [[subtaskIndex, 1]],
            $apply: mapSubtaskDependencyIdReference((id) => {
                if (id === subtaskIndex) return null;
                else if (id > subtaskIndex) return id - 1;
                else return id;
            }),
        });
    }

    function onMoveSubtask(subtaskIndex: number, direction: "UP" | "DOWN") {
        const subtask = judgeInfo.subtasks[subtaskIndex],
            swappingSubtask = subtaskIndex + (direction === "UP" ? -1 : 1);

        updateSubtasks({
            $splice: [
                [subtaskIndex, 1],
                [subtaskIndex + (direction === "UP" ? -1 : +1), 0, subtask],
            ],
            $apply: mapSubtaskDependencyIdReference((id) => {
                if (id === swappingSubtask) return subtaskIndex;
                else if (id == subtaskIndex) return swappingSubtask;
                else return id;
            }),
        });
    }

    // Add new subtask with the TL/ML/ST of the old
    function onAddSubtask(subtaskIndex: number, template: Subtask) {
        updateSubtasks({
            $splice: [
                [
                    subtaskIndex,
                    0,
                    {
                        uuid: uuid(),
                        scoringType: template.scoringType,
                        points: null,
                        timeLimit: template.timeLimit,
                        memoryLimit: template.memoryLimit,
                        dependencies: template.dependencies,
                        testcases: [],
                    },
                ],
            ],
            $apply: mapSubtaskDependencyIdReference((id) => {
                if (id >= subtaskIndex) return id + 1;
                else return id;
            }),
        });
    }

    function onUpdateTestcase(subtaskIndex: number, testcaseIndex: number, updateInfo: Partial<Testcase>) {
        updateSubtasks({
            [subtaskIndex]: {
                testcases: {
                    [testcaseIndex]: {
                        $merge: updateInfo,
                    },
                },
            },
        });
    }

    function onDeleteTestcase(subtaskIndex: number, testcaseIndex: number) {
        updateSubtasks({
            [subtaskIndex]: {
                testcases: {
                    $splice: [[testcaseIndex, 1]],
                },
            },
        });
    }

    function onMoveTestcase(subtaskIndex: number, testcaseIndex, direction: "UP" | "DOWN") {
        const testcase = judgeInfo.subtasks[subtaskIndex].testcases[testcaseIndex];
        updateSubtasks({
            [subtaskIndex]: {
                testcases: {
                    $splice: [
                        [testcaseIndex, 1],
                        [testcaseIndex + (direction === "UP" ? -1 : +1), 0, testcase],
                    ],
                },
            },
        });
    }

    function onAddTestcase(subtaskIndex: number, testcaseIndex: number) {
        updateSubtasks({
            [subtaskIndex]: {
                testcases: {
                    $splice: [
                        [
                            testcaseIndex,
                            0,
                            {
                                uuid: uuid(),
                                inputFile: null,
                                outputFile: null,
                                userOutputFilename: null,
                                points: null,
                                timeLimit: null,
                                memoryLimit: null,
                            },
                        ],
                    ],
                },
            },
        });
    }

    return (
        <>
            <Form>
                <Form.Group>
                    <Form.Checkbox
                        width={16}
                        label={
                            <label>
                                {props.options.enableOutputFile ? (
                                    <>
                                        由数据文件自动检测测试点（自动匹配 <code>.in</code> 与 <code>.out</code> 文件）
                                    </>
                                ) : (
                                    <>
                                        由数据文件自动检测测试点（自动匹配 <code>.in</code> 文件）
                                    </>
                                )}
                            </label>
                        }
                        checked={!judgeInfo.subtasks}
                        onChange={(e, { checked }) => {
                            if (checked) {
                                setSubtasksBackup(judgeInfo.subtasks);
                                props.onUpdateJudgeInfo({ subtasks: null });
                            } else {
                                props.onUpdateJudgeInfo({ subtasks: subtasksBackup });
                            }
                        }}
                    />
                </Form.Group>
            </Form>
            {judgeInfo.subtasks ? (
                <div className={style.subtasksEditor}>
                    {judgeInfo.subtasks.map((subtask, index) => (
                        <SubtaskEditor
                            key={subtask.uuid}
                            options={props.options}
                            testData={props.testData}
                            subtaskIndex={index}
                            subtaskCount={judgeInfo.subtasks.length}
                            subtask={subtask}
                            defaultPercentagePoints={defaultPercentagePoints}
                            defaultTimeLimit={judgeInfo.timeLimit}
                            defaultMemoryLimit={judgeInfo.memoryLimit}
                            onUpdate={(updateInfo) => onUpdateSubtask(index, updateInfo)}
                            onDelete={() => onDeleteSubtask(index)}
                            onMoveUp={() => onMoveSubtask(index, "UP")}
                            onMoveDown={() => onMoveSubtask(index, "DOWN")}
                            onAddSubtaskBefore={() => onAddSubtask(index, subtask)}
                            onAddSubtaskAfter={() => onAddSubtask(index + 1, subtask)}
                            onUpdateTestcase={(testcaseIndex, updateInfo) =>
                                onUpdateTestcase(index, testcaseIndex, updateInfo)
                            }
                            onDeleteTestcase={(testcaseIndex) => onDeleteTestcase(index, testcaseIndex)}
                            onMoveTestcaseUp={(testcaseIndex) => onMoveTestcase(index, testcaseIndex, "UP")}
                            onMoveTestcaseDown={(testcaseIndex) => onMoveTestcase(index, testcaseIndex, "DOWN")}
                            onAddTestcase={(testcaseIndex) => onAddTestcase(index, testcaseIndex)}
                        />
                    ))}
                </div>
            ) : (
                <Table textAlign="center">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell width={2}>#</Table.HeaderCell>
                            {props.options.enableInputFile && (
                                <Table.HeaderCell width={props.options.enableOutputFile ? 7 : 14}>
                                    输入文件
                                </Table.HeaderCell>
                            )}
                            {props.options.enableOutputFile && (
                                <Table.HeaderCell width={props.options.enableInputFile ? 7 : 14}>
                                    输出文件
                                </Table.HeaderCell>
                            )}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {autoTestcases.length > 0 ? (
                            autoTestcases.map((testcase, i) => (
                                <Table.Row key={i}>
                                    <Table.Cell>{i + 1}</Table.Cell>
                                    <Table.Cell>{testcase.inputFile}</Table.Cell>
                                    {props.options.enableOutputFile && <Table.Cell>{testcase.outputFile}</Table.Cell>}
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan={3}>无法从测试数据中检测测试点</Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            )}
        </>
    );
};

const judgeInfoProcessor: JudgeInfoProcessor<JudgeInfoWithSubtasks, SubtasksEditorOptions> = {
    parseJudgeInfo(raw, testData, options) {
        const subtaskCount = Array.isArray(raw.subtasks) ? raw.subtasks.length : 0;
        return {
            subtasks:
                Array.isArray(raw.subtasks) && raw.subtasks.length > 0
                    ? (raw.subtasks as any[])
                          .map((x) => x || {})
                          .map((rawSubtask) => ({
                              uuid: uuid(),
                              scoringType:
                                  rawSubtask.scoringType in SubtaskScoringType
                                      ? rawSubtask.scoringType
                                      : SubtaskScoringType.Sum,
                              points:
                                  Number.isSafeInteger(rawSubtask.points) && raw.subtasks.length > 1
                                      ? rawSubtask.points
                                      : null,
                              timeLimit:
                                  options.enableTimeMemoryLimit && Number.isSafeInteger(rawSubtask.timeLimit)
                                      ? rawSubtask.timeLimit
                                      : null,
                              memoryLimit:
                                  options.enableTimeMemoryLimit && Number.isSafeInteger(rawSubtask.memoryLimit)
                                      ? rawSubtask.memoryLimit
                                      : null,
                              dependencies: Array.isArray(rawSubtask.dependencies)
                                  ? (rawSubtask.dependencies as any[]).filter(
                                        (id) => typeof id === "number" && id >= 0 && id < subtaskCount,
                                    )
                                  : [],
                              testcases: Array.isArray(rawSubtask.testcases)
                                  ? (rawSubtask.testcases as any[])
                                        .map((x) => x || {})
                                        .map((rawTestcase) => ({
                                            uuid: uuid(),
                                            inputFile:
                                                options.enableInputFile && typeof rawTestcase.inputFile === "string"
                                                    ? rawTestcase.inputFile
                                                    : "",
                                            outputFile:
                                                options.enableOutputFile && typeof rawTestcase.outputFile === "string"
                                                    ? rawTestcase.outputFile
                                                    : "",
                                            userOutputFilename:
                                                options.enableUserOutputFilename &&
                                                typeof rawTestcase.userOutputFilename === "string"
                                                    ? rawTestcase.userOutputFilename
                                                    : "",
                                            points:
                                                Number.isSafeInteger(rawTestcase.points) &&
                                                rawSubtask.testcases.length > 0
                                                    ? rawTestcase.points
                                                    : null,
                                            timeLimit:
                                                options.enableTimeMemoryLimit &&
                                                Number.isSafeInteger(rawTestcase.timeLimit)
                                                    ? rawTestcase.timeLimit
                                                    : null,
                                            memoryLimit:
                                                options.enableTimeMemoryLimit &&
                                                Number.isSafeInteger(rawTestcase.memoryLimit)
                                                    ? rawTestcase.memoryLimit
                                                    : null,
                                        }))
                                  : [],
                          }))
                    : null,
        };
    },
    normalizeJudgeInfo(judgeInfo, options) {
        if (judgeInfo.subtasks) {
            for (const subtask of judgeInfo.subtasks) {
                delete subtask.uuid;
                if (subtask.points == null) delete subtask.points;
                if (!options.enableTimeMemoryLimit || subtask.timeLimit == null) delete subtask.timeLimit;
                if (!options.enableTimeMemoryLimit || subtask.memoryLimit == null) delete subtask.memoryLimit;
                if (subtask.dependencies == null || subtask.dependencies.length === 0) delete subtask.dependencies;
                for (const testcase of subtask.testcases) {
                    delete testcase.uuid;
                    if (testcase.points == null) delete testcase.points;

                    if (!options.enableInputFile) delete testcase.inputFile;
                    else if (!testcase.inputFile) testcase.inputFile = null;

                    if (!options.enableOutputFile) delete testcase.outputFile;
                    else if (!testcase.outputFile) testcase.outputFile = null;

                    if (!options.enableUserOutputFilename || !testcase.userOutputFilename)
                        delete testcase.userOutputFilename;
                    if (!options.enableTimeMemoryLimit || testcase.timeLimit == null) delete testcase.timeLimit;
                    if (!options.enableTimeMemoryLimit || testcase.memoryLimit == null) delete testcase.memoryLimit;
                }
            }
        } else delete judgeInfo.subtasks;
    },
};

export default Object.assign(SubtasksEditor, judgeInfoProcessor);
