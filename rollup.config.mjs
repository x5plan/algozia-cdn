import terser from "@rollup/plugin-terser";

const buildSrc = "build/";
const bundleDist = "dist/bundle/";
const moduleDist = "dist/modules/";

/**
 * @type {string[]}
 */
const utils = ["hitokoto"];

/**
 * @type {{
 * name: string,
 * package: string,
 * dist: string,
 * }[]}
 */
const modules = [
    {
        name: "clipboard",
        package: "clipboard-polyfill",
        dist: "dist/es5/window-var/clipboard-polyfill.window-var.promise.es5.js",
    },
];

function createUtilsConfig() {
    const config = [];

    for (const util of utils) {
        config.push(
            {
                input: `${buildSrc}utils/${util}.js`,
                output: {
                    file: `${bundleDist}${util}.js`,
                    format: "cjs",
                },
            },
            {
                input: `${buildSrc}utils/${util}.js`,
                output: {
                    file: `${bundleDist}${util}.min.js`,
                    format: "cjs",
                    plugins: [terser()],
                },
            },
        );
    }

    return config;
}

function createModulesConfig() {
    const config = [];

    for (const module of modules) {
        config.push({
            input: `node_modules/${module.package}/${module.dist}`,
            output: {
                file: `${moduleDist}${module.name}.min.js`,
                format: "cjs",
                plugins: [terser()],
            },
        });
    }

    return config;
}

export default [
    {
        input: `${buildSrc}index.js`,
        output: {
            file: `${bundleDist}index.js`,
            format: "cjs",
        },
    },
    {
        input: `${buildSrc}index.js`,
        output: {
            file: `${bundleDist}index.min.js`,
            format: "cjs",
            plugins: [terser()],
        },
    },
    ...createUtilsConfig(),
    ...createModulesConfig(),
];
