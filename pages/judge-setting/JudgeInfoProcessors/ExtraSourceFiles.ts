import { E_CodeLanguage } from "../../shared/Enums";
import { IJudgeInfoWithExtraSourceFiles } from "../Components/ExtraSourceFilesEditor/ExtraSourceFilesEditor.type";
import { IJudgeInfoProcessor } from "./Types";

export const ExtraSourceFilesJudgeInfoProcessor: IJudgeInfoProcessor<IJudgeInfoWithExtraSourceFiles> = {
    parseJudgeInfo(raw) {
        return {
            extraSourceFiles:
                raw.extraSourceFiles && typeof raw.extraSourceFiles === "object"
                    ? Object.fromEntries(
                          Object.entries(raw.extraSourceFiles)
                              .filter(
                                  ([language, fileMap]) =>
                                      Object.values(E_CodeLanguage).includes(language as E_CodeLanguage) &&
                                      fileMap &&
                                      typeof fileMap === "object",
                              )
                              .map(([language, fileMap]) => [
                                  language,
                                  Object.fromEntries(
                                      Object.entries(fileMap).filter(([dst, src]) => typeof src === "string"),
                                  ),
                              ])
                              .filter(([language, fileMap]) => Object.keys(fileMap).length > 0),
                      )
                    : null,
        };
    },
    normalizeJudgeInfo(judgeInfo) {
        if (!judgeInfo.extraSourceFiles) delete judgeInfo.extraSourceFiles;
    },
};
