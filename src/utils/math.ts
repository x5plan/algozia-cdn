import katex from 'katex';

function renderMath(math: string, displayMode: boolean) {
    return katex.renderToString(math, {
        throwOnError: false,
        displayMode,
    });
}

interface Window {
    renderMath: (math: string, displayMode: boolean) => string;
}

declare const window: Window;
window.renderMath = renderMath;
