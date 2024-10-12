interface IHighlightUtil {
    highlightCodeWithAutoLoadAsync(code: string, lang: string): Promise<string>;
}

interface IPageSharedObject {
    readonly data: {
        readonly type: string;
        readonly judgeInfo: any;
        readonly hasSubmissions: boolean;
        readonly testDataFileNames: string[];
    };

    readonly onUpdateType: (type: string) => void;
    readonly onUpdateJudgeInfo: (judgeInfo: any) => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window {
    readonly HighlightUtil?: IHighlightUtil;
    readonly PageSharedObject: IPageSharedObject;
}
