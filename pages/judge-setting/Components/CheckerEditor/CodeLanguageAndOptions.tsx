import React, { useRef } from "react";
import { Form } from "semantic-ui-react";

import { CodeLanguageString } from "../../../shared/CodeLanguageString";
import { compileAndRunOptions, getDefaultCompileAndRunOptions } from "../../../shared/CodeLanguageUtils";
import type { E_CodeLanguage } from "../../../shared/Enums";

interface ICodeLanguageAndOptionsProps {
    pending?: boolean;
    elementAfterLanguageSelect?: React.ReactNode;
    headerForLanguage?: string;
    classNameForLanguage?: string;
    classNameForCompileAndRunOptions?: string;
    language: E_CodeLanguage;
    compileAndRunOptions: Record<string, unknown>;
    onUpdateLanguage: (newLanguage: E_CodeLanguage) => void;
    onUpdateCompileAndRunOptions: (newCompileAndRunOptions: Record<string, unknown>) => void;
}

export const CodeLanguageAndOptions: React.FC<ICodeLanguageAndOptionsProps> = (props) => {
    const compileAndRunOptionsBackup = useRef(new Map<E_CodeLanguage, Record<string, unknown>>()).current;
    function onSwitchLanguage(newLanguage: E_CodeLanguage) {
        const oldLanguage = props.language;
        compileAndRunOptionsBackup.set(oldLanguage, props.compileAndRunOptions);
        props.onUpdateLanguage(newLanguage);
        props.onUpdateCompileAndRunOptions(
            compileAndRunOptionsBackup.get(newLanguage) || getDefaultCompileAndRunOptions(newLanguage),
        );
    }

    return (
        <>
            <Form.Select
                className={props.classNameForLanguage}
                label={props.headerForLanguage || CodeLanguageString.code_language}
                value={props.language}
                options={Object.keys(compileAndRunOptions).map((language) => ({
                    key: language,
                    value: language,
                    text: CodeLanguageString[language as E_CodeLanguage]?.name,
                }))}
                onChange={(e, { value }) => !props.pending && onSwitchLanguage(value as E_CodeLanguage)}
            />
            {props.elementAfterLanguageSelect}
            {compileAndRunOptions[props.language as E_CodeLanguage].map((option) => (
                <Form.Select
                    className={props.classNameForCompileAndRunOptions}
                    key={option.name}
                    label={CodeLanguageString[props.language]?.options?.[option.name]?.name}
                    value={props.compileAndRunOptions[option.name] as string}
                    options={option.values.map((value) => ({
                        key: value,
                        value: value,
                        text: CodeLanguageString[props.language]?.options?.[option.name]?.values?.[value],
                    }))}
                    onChange={(e, { value }) =>
                        !props.pending &&
                        props.onUpdateCompileAndRunOptions(
                            Object.assign({}, props.compileAndRunOptions, { [option.name]: value }),
                        )
                    }
                />
            ))}
        </>
    );
};
