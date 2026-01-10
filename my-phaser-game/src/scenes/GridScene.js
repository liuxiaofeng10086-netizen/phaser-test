import Phaser from "phaser";
import { CAMERA_LERP, CAMERA_ZOOM_LEVELS } from "../config";
import { OBJECT_FRAMES } from "../data/frames";
import { SCENES } from "../data/maps";
import {
    CoffeeMachine,
    Plant,
    PizzaPickup,
    ScenePortal,
    Workstation,
    ZombiePlant
} from "../objects/Interactables";
import { Player } from "../objects/Player";
import { Zombie } from "../objects/Zombie";
import { gameState } from "../state/gameState";
import { GridWorld } from "../world/GridWorld";

export class GridScene extends Phaser.Scene {
    constructor(sceneKey, sceneId) {
        super({ key: sceneKey });
        this.sceneId = sceneId;
        this.entryPortalName = null;
        this.zoomLevel = 0;
        this.zoomLevels = CAMERA_ZOOM_LEVELS;
    }

    init(data) {
        this.entryPortalName = data?.portalName ?? null;
    }

    create() {
        const sceneData = SCENES[this.sceneId];
        gameState.currentScene = this.sceneId;
        this.world = new GridWorld(this, sceneData.map, this.sceneId);
        this.portals = new Map();
        this.zombies = [];

        this.buildMap(sceneData.map);
        this.buildObjects(sceneData.map);
        this.buildPortals(sceneData.portals);
        this.buildSceneEntities(sceneData);
        this.buildPlayer(sceneData);
        this.setupCamera();
        this.setupZoomControls();
    }

    buildMap(mapData) {
        for (let y = 0; y < this.world.height; y += 1) {
            for (let x = 0; x < this.world.width; x += 1) {
                const tile = mapData[y][x];
                const { x: worldX, y: worldY } = this.world.tileToWorld(x, y);
                const frame =
                    tile === "#"
                        ? OBJECT_FRAMES.wall
                        : OBJECT_FRAMES.floor;
                const sprite = this.add.image(worldX, worldY, "objects", frame);
                sprite.setDepth(this.world.getDepth("ground", worldY));
            }
        }
    }

    buildObjects(mapData) {
        for (let y = 0; y < this.world.height; y += 1) {
            for (let x = 0; x < this.world.width; x += 1) {
                const tile = mapData[y][x];
                if (tile === "o") {
                    new PizzaPickup({
                        scene: this,
                        world: this.world,
                        tileX: x,
                        tileY: y,
                        sceneId: this.sceneId
                    });
                } else if (tile === "W") {
                    new Workstation({
                        scene: this,
                        world: this.world,
                        tileX: x,
                        tileY: y
                    });
                } else if (tile === "C") {
                    new CoffeeMachine({
                        scene: this,
                        world: this.world,
                        tileX: x,
                        tileY: y
                    });
                } else if (tile === "T") {
                    new Plant({
                        scene: this,
                        world: this.world,
                        tileX: x,
                        tileY: y
                    });
                }
            }
        }
    }

    buildPortals(portals) {
        portals.forEach(portal => {
            const entry = new ScenePortal({
                scene: this,
                world: this.world,
                tileX: portal.x,
                tileY: portal.y,
                name: portal.name,
                target: portal.target,
                enterDirection: portal.enterDirection
            });
            this.portals.set(portal.name, entry);
        });
    }

    buildSceneEntities(sceneData) {
        sceneData.zombiePlants.forEach(plant => {
            new ZombiePlant({
                scene: this,
                world: this.world,
                tileX: plant.x,
                tileY: plant.y
            });
        });
    }

    buildPlayer(sceneData) {
        const entryPortal = this.entryPortalName
            ? this.portals.get(this.entryPortalName)
            : null;
        const spawn = entryPortal
            ? { x: entryPortal.tileX, y: entryPortal.tileY }
            : sceneData.playerStart;

        this.player = new Player({
            scene: this,
            world: this.world,
            tileX: spawn.x,
            tileY: spawn.y
        });

        if (entryPortal?.enterDirection) {
            const [dx, dy] = entryPortal.enterDirection;
            if (dx || dy) {
                this.time.delayedCall(100, () => {
                    this.player.moveTo(
                        this.player.tileX + dx,
                        this.player.tileY + dy
                    );
                });
            }
        }

        sceneData.zombies.forEach(zombie => {
            this.zombies.push(
                new Zombie({
                    scene: this,
                    world: this.world,
                    tileX: zombie.x,
                    tileY: zombie.y,
                    chaseDistance: zombie.chaseDistance,
                    target: this.player
                })
            );
        });
    }

    setupCamera() {
        const camera = this.cameras.main;
        camera.setBounds(
            0,
            0,
            this.world.width * this.world.tileSize,
            this.world.height * this.world.tileSize
        );
        camera.startFollow(this.player.sprite, false, CAMERA_LERP, CAMERA_LERP);
        camera.setZoom(this.zoomLevels[this.zoomLevel]);
    }

    setupZoomControls() {
        this.input.keyboard.on("keydown-PAGEUP", event => {
            event.preventDefault();
            const next = Math.min(
                this.zoomLevels.length - 1,
                this.zoomLevel + 1
            );
            this.zoomLevel = next;
            this.cameras.main.setZoom(this.zoomLevels[this.zoomLevel]);
        });

        this.input.keyboard.on("keydown-PAGEDOWN", event => {
            event.preventDefault();
            const next = Math.max(0, this.zoomLevel - 1);
            this.zoomLevel = next;
            this.cameras.main.setZoom(this.zoomLevels[this.zoomLevel]);
        });
    }

    update(time, delta) {
        this.player.update(time, delta);
        this.zombies.forEach(zombie => zombie.update(time, delta));
    }
}
