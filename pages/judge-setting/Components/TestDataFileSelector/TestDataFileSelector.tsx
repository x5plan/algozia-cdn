import type React from "react";
import { Dropdown, Form, Icon, FormSelectProps, DropdownProps, SemanticICONS, Popup } from "semantic-ui-react";

import style from "./TestDataFileSelector.module.less";
import { getFileIcon } from "../../../shared/FileIcon";

export interface ITestDataFileSelectorProps {
    type: "FormSelect" | "ItemSearchDropdown";
    className?: string;
    iconInputOrOutput?: SemanticICONS;
    label?: FormSelectProps["label"];
    testData: string[];
    optional?: boolean;
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
}

export const TestDataFileSelector: React.FC<ITestDataFileSelectorProps> = (props) => {
    const uiProps: FormSelectProps | DropdownProps = {
        className:
            style.fileSelect +
            " " +
            (props.type === "ItemSearchDropdown" ? style.itemSearchDropdown : style.formSelect) +
            (props.className ? " " + props.className : ""),
        label: props.label,
        text:
            props.value && !props.testData.some((file) => file === props.value)
                ? ((
                      <>
                          {props.iconInputOrOutput && (
                              <Icon className={style.iconInputOrOutput} name={props.iconInputOrOutput} />
                          )}
                          <Popup
                              trigger={<Icon name="warning sign" className={style.iconFile} />}
                              content="数据包中找不到该文件。"
                              position="top center"
                          />
                          <span>{props.value}</span>
                      </>
                  ) as any)
                : undefined,
        placeholder: props.placeholder,
        value: props.value,
        options: [
            ...(props.optional
                ? [
                      {
                          key: null,
                          value: null,
                          text: (
                              <>
                                  {props.iconInputOrOutput && (
                                      <Icon
                                          className={style.iconInputOrOutput + " " + style.invisible}
                                          name={props.iconInputOrOutput}
                                      />
                                  )}
                                  <Icon name="file code outline" className={style.iconFile + " " + style.invisible} />
                                  <div className={style.filename}>空</div>
                              </>
                          ),
                      },
                  ]
                : []),
            ...props.testData.map((file) => ({
                key: file,
                value: file,
                text: (
                    <>
                        {props.iconInputOrOutput && (
                            <Icon className={style.iconInputOrOutput} name={props.iconInputOrOutput} />
                        )}
                        <Icon name={getFileIcon(file)} className={style.iconFile} />
                        <div className={style.filename}>{file}</div>
                    </>
                ),
            })),
        ],
        onChange: (e, { value }) => props.onChange(value as string),
    };

    return props.type === "ItemSearchDropdown" ? (
        <Dropdown item selection search noResultsMessage={"找不到匹配的文件。"} {...uiProps} />
    ) : (
        <Form.Select open={props.testData.length === 0 ? false : undefined} {...(uiProps as FormSelectProps)} />
    );
};
