// 将图集坐标映射为 Phaser 帧索引
const frameIndex = (x, y, columns) => y * columns + x;

// objects.png 图集帧配置
export const OBJECT_FRAMES = {
    floor: frameIndex(0, 3, 8),
    wall: frameIndex(1, 3, 8),
    workstation1: frameIndex(0, 2, 8),
    workstation2: frameIndex(1, 2, 8),
    coffeeMachine: frameIndex(2, 2, 8),
    coffeeMachineEmpty: frameIndex(3, 2, 8),
    pizza: frameIndex(4, 2, 8),
    plant: frameIndex(0, 1, 8),
    zombiePlant: frameIndex(2, 1, 8),
    zombiePlantInteracted: frameIndex(1, 1, 8),
    zombieIdle: frameIndex(2, 1, 8)
};

// player.png 图集帧配置
export const PLAYER_FRAMES = {
    idle: frameIndex(0, 0, 3),
    walk: [
        frameIndex(1, 0, 3),
        frameIndex(2, 0, 3),
        frameIndex(0, 1, 3),
        frameIndex(1, 1, 3),
        frameIndex(2, 1, 3),
        frameIndex(0, 2, 3),
        frameIndex(1, 2, 3),
      ]
};

// ui.png 图集帧配置
export const UI_FRAMES = {
    select: frameIndex(5, 2, 8),
    dot: frameIndex(1, 2, 8),
    solid: frameIndex(2, 2, 8)
};
