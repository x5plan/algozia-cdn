export function randomColorFromUuid(uuid: string) {
    const hex = uuid.split("-").join(""),
        COLOR_COUNT = 11;
    let x = 0;
    for (let i = 0; i < hex.length; i += 4) {
        x ^= parseInt(hex.substr(i, 4), 16);
    }
    return x % COLOR_COUNT;
}
