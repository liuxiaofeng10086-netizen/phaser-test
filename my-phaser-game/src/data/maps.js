import { mapDataString } from "../utils/grid";

const officeMap = mapDataString(`
# # # # # # # # # # # # # # # # #
# . W T # T . . W T . W . . . T #
# . . . . . . . . . . . . . . o .
# o . . # . . . # # # # . . # # #
# # # # # . . . # W o W . . T W #
# C C C # . . . T . . . . . . . #
# o . . . . . . . . . . . . . o #
# # # # # # # # # # # # # # # # #
`).reverse();

const otherMap = mapDataString(`
# # # # # #
# . . . . #
. . . . . #
# . . . . #
# # # # # #
`).reverse();

export const SCENES = {
    office: {
        map: officeMap,
        playerStart: { x: 6, y: 3 },
        portals: [
            {
                name: "exit",
                x: 16,
                y: 5,
                target: "other/start",
                enterDirection: [-1, 0]
            }
        ],
        zombies: [{ x: 4, y: 1, chaseDistance: 3 }],
        zombiePlants: []
    },
    other: {
        map: otherMap,
        playerStart: { x: 0, y: 2 },
        portals: [
            {
                name: "start",
                x: 0,
                y: 2,
                target: "office/exit",
                enterDirection: [1, 0]
            }
        ],
        zombies: [],
        zombiePlants: [{ x: 3, y: 3 }]
    }
};
