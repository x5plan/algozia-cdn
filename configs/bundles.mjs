const utils = ["hitokoto", "markdown", "math"];
const validations = ["auth-login", "auth-register"];

/**
 * @type {{
 * src: string,
 * dist: string,
 * }[]}
 */
export default [
    {
        src: "common/index.js",
        dist: "index.js",
    },
    ...utils.map((util) => ({
        src: `utils/${util}.js`,
        dist: `${util}.js`,
    })),
    ...validations.map((validation) => ({
        src: `validations/${validation}.js`,
        dist: `validations/${validation}.js`,
    })),
];
