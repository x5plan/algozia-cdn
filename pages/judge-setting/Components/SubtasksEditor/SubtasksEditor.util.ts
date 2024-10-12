export function randomColorFromUuid(uuid: string) {
    const hex = uuid.split("-").join(""),
        COLOR_COUNT = 11;
    let x = 0;
    for (let i = 0; i < hex.length; i += 4) {
        x ^= parseInt(hex.substr(i, 4), 16);
    }
    return x % COLOR_COUNT;
}

export function detectTestcasesByMatchingInputToOutput(testData: string[], outputOptional?: boolean) {
    return testData
        .filter((file) => file.toLowerCase().endsWith(".in"))
        .map<[string, string, number[]]>((input) => [
            input,
            testData.find((file) =>
                [".out", ".ans"].map((ext) => input.slice(0, -3).toLowerCase() + ext).includes(file.toLowerCase()),
            ),
            (input.match(/\d+/g) || []).map(Number),
        ])
        .filter(([, outputFile]) => (outputOptional ? true : outputFile))
        .sort(([inputA, , numbersA], [inputB, , numbersB]) => {
            const firstNonEqualIndex = [...Array(Math.max(numbersA.length, numbersB.length)).keys()].findIndex(
                (i) => numbersA[i] !== numbersB[i],
            );
            return firstNonEqualIndex === -1
                ? inputA < inputB
                    ? -1
                    : 1
                : numbersA[firstNonEqualIndex] - numbersB[firstNonEqualIndex];
        })
        .map(([input, output]) => ({
            inputFile: input,
            outputFile: output,
        }));
}

export function detectTestcasesByMatchingOutputToInput(testData: string[], inputOptional?: boolean) {
    return testData
        .filter((file) => ((str: string) => str.endsWith(".out") || str.endsWith(".ans"))(file.toLowerCase()))
        .map<[string, string, number[]]>((input) => [
            input,
            testData.find((file) => `${input.slice(0, -4).toLowerCase()}.in` === file.toLowerCase()),
            (input.match(/\d+/g) || []).map(Number),
        ])
        .filter(([, inputFile]) => (inputOptional ? true : inputFile))
        .sort(([outputA, , numbersA], [outputB, , numbersB]) => {
            const firstNonEqualIndex = [...Array(Math.max(numbersA.length, numbersB.length)).keys()].findIndex(
                (i) => numbersA[i] !== numbersB[i],
            );
            return firstNonEqualIndex === -1
                ? outputA < outputB
                    ? -1
                    : 1
                : numbersA[firstNonEqualIndex] - numbersB[firstNonEqualIndex];
        })
        .map(([output, input]) => ({
            inputFile: input,
            outputFile: output,
        }));
}
