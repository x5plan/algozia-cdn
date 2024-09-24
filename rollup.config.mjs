import terser from "@rollup/plugin-terser";

export default [
    {
        input: "build/index.js",
        output: {
            file: "dist/bundle/index.js",
            format: "cjs",
        },
    },
    {
        input: "build/index.js",
        output: {
            file: "dist/bundle/index.min.js",
            format: "cjs",
            plugins: [terser()],
        },
    },
    {
        input: "node_modules/clipboard-polyfill/dist/es5/window-var/clipboard-polyfill.window-var.promise.es5.js",
        output: {
            file: "dist/modules/clipboard.min.js",
            format: "cjs",
            plugins: [terser()],
        },
    },
];
