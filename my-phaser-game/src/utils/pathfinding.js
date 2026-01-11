// 8 方向 A* 寻路方向表（含对角）
const DIRECTIONS = [
    { x: 0, y: 1, cost: 1 },
    { x: 1, y: 0, cost: 1 },
    { x: 0, y: -1, cost: 1 },
    { x: -1, y: 0, cost: 1 },
    { x: 1, y: 1, cost: Math.SQRT2 },
    { x: 1, y: -1, cost: Math.SQRT2 },
    { x: -1, y: 1, cost: Math.SQRT2 },
    { x: -1, y: -1, cost: Math.SQRT2 }
];

const keyOf = (x, y) => `${x},${y}`;

// 使用对角距离作为启发函数
const heuristic = (a, b) => {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    const diag = Math.min(dx, dy);
    const straight = dx + dy;
    return Math.SQRT2 * diag + (straight - 2 * diag);
};

// 基于网格的 A*，返回去掉起点后的路径
export function findPath(grid, start, goal) {
    const height = grid.length;
    const width = grid[0]?.length ?? 0;

    if (!width || !height) return [];
    if (start.x === goal.x && start.y === goal.y) return [];
    if (goal.x < 0 || goal.y < 0 || goal.x >= width || goal.y >= height) return [];

    const openList = [];
    const openMap = new Map();
    const closed = new Set();

    const startNode = {
        x: start.x,
        y: start.y,
        g: 0,
        h: heuristic(start, goal),
        f: 0,
        parent: null
    };
    startNode.f = startNode.h;
    openList.push(startNode);
    openMap.set(keyOf(startNode.x, startNode.y), startNode);

    while (openList.length > 0) {
        let currentIndex = 0;
        for (let i = 1; i < openList.length; i += 1) {
            if (openList[i].f < openList[currentIndex].f) {
                currentIndex = i;
            }
        }

        const current = openList.splice(currentIndex, 1)[0];
        openMap.delete(keyOf(current.x, current.y));
        closed.add(keyOf(current.x, current.y));

        if (current.x === goal.x && current.y === goal.y) {
            const path = [];
            let node = current;
            while (node && node.parent) {
                path.unshift({ x: node.x, y: node.y });
                node = node.parent;
            }
            return path;
        }

        for (const dir of DIRECTIONS) {
            const nx = current.x + dir.x;
            const ny = current.y + dir.y;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (grid[ny][nx] !== 0) continue;

            // 禁止对角穿角
            if (dir.x !== 0 && dir.y !== 0) {
                const sideA = grid[current.y][current.x + dir.x];
                const sideB = grid[current.y + dir.y][current.x];
                if (sideA !== 0 || sideB !== 0) continue;
            }

            const nodeKey = keyOf(nx, ny);
            if (closed.has(nodeKey)) continue;

            const tentativeG = current.g + dir.cost;
            const existing = openMap.get(nodeKey);
            if (!existing || tentativeG < existing.g) {
                const h = heuristic({ x: nx, y: ny }, goal);
                const node = existing || {
                    x: nx,
                    y: ny,
                    g: tentativeG,
                    h,
                    f: tentativeG + h,
                    parent: current
                };
                node.g = tentativeG;
                node.h = h;
                node.f = tentativeG + h;
                node.parent = current;
                if (!existing) {
                    openMap.set(nodeKey, node);
                    openList.push(node);
                }
            }
        }
    }

    return [];
}
