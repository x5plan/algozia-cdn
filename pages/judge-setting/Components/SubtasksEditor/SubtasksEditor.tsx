import type { Spec } from "immutability-helper";
import update from "immutability-helper";
import { useMemo, useRef, useState } from "preact/hooks";
import type React from "react";
import { Button, Dropdown, Form, Input, Menu, Popup, Ref, Table } from "semantic-ui-react";
import { v4 as uuid } from "uuid";

import { E_SubtaskScoringType } from "../../../shared/Enums";
import type { IEditorComponentProps } from "../Type";
import { SubtaskEditorTastcaseItem } from "./SubtaskEditorTastcaseItem";
import style from "./SubtasksEditor.module.less";
import type { IJudgeInfoWithSubtasks, ISubtask, ISubtasksEditorOptions, ITestcase } from "./SubtasksEditor.type";
import {
    detectTestcasesByMatchingInputToOutput,
    detectTestcasesByMatchingOutputToInput,
    randomColorFromUuid,
} from "./SubtasksEditor.util";

export interface ISubtaskEditorProps {
    options: ISubtasksEditorOptions;

    testData: string[];
    subtaskIndex: number;
    subtaskCount: number;
    subtask: ISubtask;

    defaultPercentagePoints: number;
    defaultTimeLimit: number;
    defaultMemoryLimit: number;

    onUpdate: (updateInfo: Partial<ISubtask>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onAddSubtaskBefore: () => void;
    onAddSubtaskAfter: () => void;

    onUpdateTestcase: (testcaseIndex: number, updateInfo: Partial<ITestcase>) => void;
    onDeleteTestcase: (testcaseIndex: number) => void;
    onMoveTestcaseUp: (testcaseIndex: number) => void;
    onMoveTestcaseDown: (testcaseIndex: number) => void;
    onAddTestcase: (testcaseIndex: number) => void;
}

export const SubtaskEditor: React.FC<ISubtaskEditorProps> = (props) => {
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

    function sortTestcases() {
        const temp: [number[], ITestcase][] = props.subtask.testcases.map((testcase) => [
            (testcase.inputFile || testcase.outputFile).match(/\d+/g).map(parseInt),
            testcase,
        ]);
        temp.sort(([a], [b]) => {
            if (a.length != b.length) return a.length - b.length;
            for (let i = 0; i < a.length; i++) if (a[i] != b[i]) return a[i] - b[i];
            return 0;
        });

        props.onUpdate({
            testcases: temp.map(([, testcase]) => testcase),
        });
    }

    return (
        <>
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
                    <div className={style.subtaskTitleTestcasesCount}>{props.subtask.testcases.length}</div>
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
                </Menu.Menu>
            </Menu>
            <Menu attached className={style.menu}>
                <Dropdown
                    item
                    value={props.subtask.scoringType}
                    className={style.itemScoringTypeDropdown}
                    options={Object.values(E_SubtaskScoringType).map((type) => ({
                        key: type,
                        value: type,
                        text:
                            type === E_SubtaskScoringType.Sum
                                ? "各测试点分数求和"
                                : type === E_SubtaskScoringType.GroupMin
                                  ? "各测试点分数取最小值"
                                  : "各测试点分数按百分比相乘",
                    }))}
                    onChange={(e, { value }) => props.onUpdate({ scoringType: value as E_SubtaskScoringType })}
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

type SubtasksEditorProps = IEditorComponentProps<IJudgeInfoWithSubtasks, ISubtasksEditorOptions>;

export const SubtasksEditor: React.FC<SubtasksEditorProps> = (props) => {
    const judgeInfo = props.judgeInfo;

    const autoTestcases = useMemo(() => {
        if (
            props.options.enableInputFile === true ||
            (props.options.enableInputFile === "optional" && props.options.enableOutputFile !== true)
        ) {
            return detectTestcasesByMatchingInputToOutput(props.testData, props.options.enableOutputFile !== true);
        } else return detectTestcasesByMatchingOutputToInput(props.testData, true);
    }, [props.options.enableInputFile, props.options.enableOutputFile, props.testData]);

    // Prevent losing subtasks by toggling "auto detect testcases"
    const [subtasksBackup, setSubtasksBackup] = useState(
        judgeInfo.subtasks || [
            { scoringType: E_SubtaskScoringType.Sum, testcases: [], uuid: uuid(), dependencies: [] },
        ],
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

    function updateSubtasks($spec: Spec<ISubtask[]>) {
        props.onUpdateJudgeInfo({ subtasks: update(judgeInfo.subtasks, $spec) });
    }

    function onUpdateSubtask(subtaskIndex: number, updateInfo: Partial<ISubtask>) {
        updateSubtasks({
            [subtaskIndex]: {
                $merge: updateInfo,
            },
        });
    }

    function mapSubtaskDependencyIdReference(callback: (id: number) => number): (subtasks: ISubtask[]) => ISubtask[] {
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
                        scoringType: E_SubtaskScoringType.Sum,
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
    function onAddSubtask(subtaskIndex: number, template: ISubtask) {
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

    function onUpdateTestcase(subtaskIndex: number, testcaseIndex: number, updateInfo: Partial<ITestcase>) {
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
