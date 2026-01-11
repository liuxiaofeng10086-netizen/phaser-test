// 将地图字符串解析为二维数组
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

// 瓦片坐标 -> 世界坐标（y 轴自底向上）
export function tileToWorld(tileX, tileY, tileSize, mapHeight) {
    return {
        x: tileX * tileSize + tileSize / 2,
        y: (mapHeight - 1 - tileY) * tileSize + tileSize / 2
    };
}

// 世界坐标 -> 瓦片坐标（对齐到最近格子）
export function worldToTile(worldX, worldY, tileSize, mapHeight) {
    const tileX = Math.round(worldX / tileSize - 0.5);
    const tileY = mapHeight - 1 - Math.round(worldY / tileSize - 0.5);
    return { x: tileX, y: tileY };
}

// 边界检查
export function isWithinBounds(tileX, tileY, width, height) {
    return (
        tileX >= 0 &&
        tileX < width &&
        tileY >= 0 &&
        tileY < height
    );
}
