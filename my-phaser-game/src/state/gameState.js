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

export const makePersistKey = (sceneId, name) => `${sceneId}:${name}`;

export const getPersistedState = (sceneId, name) =>
    gameState.persisted.get(makePersistKey(sceneId, name));

export const setPersistedState = (sceneId, name, value) => {
    gameState.persisted.set(makePersistKey(sceneId, name), value);
};
