interface Window {
    PageAppLoaderUtil: typeof PageAppLoaderUtil;
}

interface IViteChunk {
    file: string;
    name: string;
    src: string;
    isEntry?: boolean;
    isDynamicEntry?: boolean;
    imports: string[];
    dynamicImports?: string[];
    css?: string[];
}

namespace PageAppLoaderUtil {
    function injectCss(url: string) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
    }

    function injectScript(url: string) {
        const script = document.createElement("script");
        script.src = url;
        script.type = "module";
        document.body.appendChild(script);
    }

    export function loadPageApp(pagename: string, cdnUrl: string) {
        if (!document.getElementById("app-root")) {
            throw new Error("Element with id 'app-root' not found.");
        }

        const viteManifestUrl = `${cdnUrl}pages/.vite/manifest.json`;

        $.getJSON(viteManifestUrl, (manifest: Record<string, IViteChunk>) => {
            const chunk = Object.values(manifest).find((chunk) => {
                if (!chunk.isEntry) {
                    return false;
                }

                return chunk.name === pagename;
            });

            if (!chunk) {
                return;
            }

            chunk.css?.forEach((css: string) => {
                injectCss(`${cdnUrl}pages/${css}`);
            });

            injectScript(`${cdnUrl}pages/${chunk.file}`);
        });
    }

    window.PageAppLoaderUtil = PageAppLoaderUtil;
}
