interface IHighlightUtil {
    highlightCodeWithAutoLoadAsync(code: string, lang: string): Promise<string>;
}

interface IPageSharedObject {
    readonly title: string;
    readonly problemUrl: string;
    readonly postUrl: string;
    readonly error?: string;
    readonly type: string;
    readonly info: any;
    readonly hasSubmissions: boolean;
    readonly testDataFileNames: string[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window {
    readonly HighlightUtil?: IHighlightUtil;
    readonly PageSharedObject: IPageSharedObject;
}
