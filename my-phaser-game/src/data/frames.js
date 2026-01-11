// 将图集坐标映射为 Phaser 帧索引
const frameIndex = (x, y, columns) => y * columns + x;

// objects.png 图集帧配置
export const OBJECT_FRAMES = {
    floor: frameIndex(0, 0, 8),
    wall: frameIndex(1, 0, 8),
    workstation1: frameIndex(0, 1, 8),
    workstation2: frameIndex(1, 1, 8),
    coffeeMachine: frameIndex(2, 1, 8),
    coffeeMachineEmpty: frameIndex(3, 1, 8),
    pizza: frameIndex(4, 1, 8),
    plant: frameIndex(0, 2, 8),
    zombiePlant: frameIndex(2, 2, 8),
    zombiePlantInteracted: frameIndex(1, 2, 8),
    zombieIdle: frameIndex(2, 2, 8)
};

// player.png 图集帧配置
export const PLAYER_FRAMES = {
    idle: frameIndex(0, 2, 3),
    walk: [frameIndex(1, 2, 3), frameIndex(2, 2, 3)]
};

// ui.png 图集帧配置
export const UI_FRAMES = {
    select: frameIndex(4, 0, 8),
    dot: frameIndex(1, 0, 8),
    solid: frameIndex(0, 1, 8)
};
