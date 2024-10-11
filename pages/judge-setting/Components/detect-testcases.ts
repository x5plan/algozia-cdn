export function detectTestcasesByMatchingInputToOutput(testData: string[], outputOptional?: boolean) {
    return testData
        .filter((file) => file.toLowerCase().endsWith(".in"))
        .map<[string, string, number[]]>((input) => [
            input,
            testData.find((file) =>
                [".out", ".ans"]
                    .map((ext) => input.filename.slice(0, -3).toLowerCase() + ext)
                    .includes(file.toLowerCase()),
            ),
            (input.filename.match(/\d+/g) || []).map(Number),
        ])
        .filter(([, outputFile]) => (outputOptional ? true : outputFile))
        .sort(([inputA, , numbersA], [inputB, , numbersB]) => {
            const firstNonEqualIndex = [...Array(Math.max(numbersA.length, numbersB.length)).keys()].findIndex(
                (i) => numbersA[i] !== numbersB[i],
            );
            return firstNonEqualIndex === -1
                ? inputA.filename < inputB.filename
                    ? -1
                    : 1
                : numbersA[firstNonEqualIndex] - numbersB[firstNonEqualIndex];
        })
        .map(([input, output]) => ({
            inputFile: input.filename,
            outputFile: output?.filename,
        }));
}

export function detectTestcasesByMatchingOutputToInput(testData: string[], inputOptional?: boolean) {
    return testData
        .filter((file) => ((str: string) => str.endsWith(".out") || str.endsWith(".ans"))(file.toLowerCase()))
        .map<[string, string, number[]]>((input) => [
            input,
            testData.find((file) => `${input.filename.slice(0, -4).toLowerCase()}.in` === file.toLowerCase()),
            (input.filename.match(/\d+/g) || []).map(Number),
        ])
        .filter(([, inputFile]) => (inputOptional ? true : inputFile))
        .sort(([outputA, , numbersA], [outputB, , numbersB]) => {
            const firstNonEqualIndex = [...Array(Math.max(numbersA.length, numbersB.length)).keys()].findIndex(
                (i) => numbersA[i] !== numbersB[i],
            );
            return firstNonEqualIndex === -1
                ? outputA.filename < outputB.filename
                    ? -1
                    : 1
                : numbersA[firstNonEqualIndex] - numbersB[firstNonEqualIndex];
        })
        .map(([output, input]) => ({
            inputFile: input?.filename,
            outputFile: output.filename,
        }));
}
