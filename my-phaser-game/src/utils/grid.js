export function mapDataString(str) {
    const lineBreak = "\n";
    const data = [];
    let line = -1;
    let string = str;
    if (string[string.length - 1] === lineBreak) {
        string = string.slice(0, -1);
    }
    for (const char of string) {
        if (char === " ") continue;
        if (char === lineBreak) {
            data[++line] = [];
        } else {
            data[line].push(char);
        }
    }
    return data;
}

export function tileToWorld(tileX, tileY, tileSize, mapHeight) {
    return {
        x: tileX * tileSize + tileSize / 2,
        y: (mapHeight - 1 - tileY) * tileSize + tileSize / 2
    };
}

export function worldToTile(worldX, worldY, tileSize, mapHeight) {
    const tileX = Math.round(worldX / tileSize - 0.5);
    const tileY = mapHeight - 1 - Math.round(worldY / tileSize - 0.5);
    return { x: tileX, y: tileY };
}

export function isWithinBounds(tileX, tileY, width, height) {
    return (
        tileX >= 0 &&
        tileX < width &&
        tileY >= 0 &&
        tileY < height
    );
}
