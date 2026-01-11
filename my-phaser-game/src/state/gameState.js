// 轻量全局状态，用于跨场景共享
export const gameState = {
    player: {
        hp: 100,
        maxHp: 100,
        tileX: 6,
        tileY: 3
    },
    currentScene: "office",
    persisted: new Map()
};

// 持久化 key：场景 + 对象名
export const makePersistKey = (sceneId, name) => `${sceneId}:${name}`;

export const getPersistedState = (sceneId, name) =>
    gameState.persisted.get(makePersistKey(sceneId, name));

export const setPersistedState = (sceneId, name, value) => {
    gameState.persisted.set(makePersistKey(sceneId, name), value);
};
