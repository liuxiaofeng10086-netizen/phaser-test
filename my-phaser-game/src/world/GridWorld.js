import { TILE_SIZE } from "../config";
import { findPath } from "../utils/pathfinding";
import { isWithinBounds, tileToWorld, worldToTile } from "../utils/grid";

const LAYER_OFFSETS = {
    ground: 0,
    obstacle: 0.2,
    item: 0.3,
    character: 0.5,
    fx: 1
};

export class GridWorld {
    constructor(scene, mapData, sceneId) {
        this.scene = scene;
        this.sceneId = sceneId;
        this.mapData = mapData;
        this.tileSize = TILE_SIZE;
        this.height = mapData.length;
        this.width = mapData[0]?.length ?? 0;
        this.objects = [];
    }

    tileToWorld(tileX, tileY) {
        return tileToWorld(tileX, tileY, this.tileSize, this.height);
    }

    worldToTile(worldX, worldY) {
        return worldToTile(worldX, worldY, this.tileSize, this.height);
    }

    getDepth(layer, worldY) {
        return worldY + (LAYER_OFFSETS[layer] ?? 0);
    }

    addObject(obj) {
        this.objects.push(obj);
    }

    removeObject(obj) {
        this.objects = this.objects.filter(item => item !== obj);
    }

    isWithinBounds(tileX, tileY) {
        return isWithinBounds(tileX, tileY, this.width, this.height);
    }

    getObjectsAt(tileX, tileY, { includeDisabled = false } = {}) {
        return this.objects.filter(obj => {
            if (!includeDisabled && obj.disabled) return false;
            return obj.tileX === tileX && obj.tileY === tileY;
        });
    }

    isWall(tileX, tileY) {
        return (
            this.isWithinBounds(tileX, tileY) &&
            this.mapData[tileY]?.[tileX] === "#"
        );
    }

    isWalkable(tileX, tileY, { ignore } = {}) {
        if (!this.isWithinBounds(tileX, tileY)) return false;
        if (this.isWall(tileX, tileY)) return false;

        return this.getObjectsAt(tileX, tileY).every(obj => {
            if (obj === ignore) return true;
            if (!obj.collider) return true;
            return obj.walkable;
        });
    }

    hasInteractable(tileX, tileY) {
        return this.getObjectsAt(tileX, tileY).some(obj => obj.interactable);
    }

    async interactAt(tileX, tileY, actor) {
        const interactables = this.getObjectsAt(tileX, tileY).filter(
            obj => obj.interactable && !obj.disabled
        );
        if (!interactables.length) return false;
        await Promise.all(interactables.map(obj => obj.interact(actor)));
        return true;
    }

    handleTriggersAt(tileX, tileY, actor) {
        const triggers = this.getObjectsAt(tileX, tileY).filter(
            obj => obj.isTrigger && !obj.disabled
        );
        triggers.forEach(obj => obj.onTrigger?.(actor));
    }

    buildGrid({ destination, allowDestinationOnInteractable, allowOccupiedBy } = {}) {
        const grid = [];
        for (let y = 0; y < this.height; y += 1) {
            grid[y] = [];
            for (let x = 0; x < this.width; x += 1) {
                let blocked = this.isWall(x, y);
                if (!blocked) {
                    const objects = this.getObjectsAt(x, y);
                    blocked = objects.some(obj => {
                        if (!obj.collider) return false;
                        if (allowOccupiedBy && obj === allowOccupiedBy) return false;
                        return !obj.walkable;
                    });
                }

                if (
                    destination &&
                    destination.x === x &&
                    destination.y === y
                ) {
                    if (
                        allowDestinationOnInteractable &&
                        this.hasInteractable(x, y)
                    ) {
                        blocked = false;
                    }
                }

                grid[y][x] = blocked ? 1 : 0;
            }
        }
        return grid;
    }

    findPath(from, to, options) {
        const grid = this.buildGrid(options);
        return findPath(grid, from, to);
    }

    spawnFootstep(tileX, tileY) {
        const { x, y } = this.tileToWorld(tileX, tileY);
        const sprite = this.scene.add.sprite(x, y, "footstep", 0);
        sprite.setAlpha(0.75);
        sprite.setDepth(this.getDepth("fx", y));
        sprite.play("footstep");
        sprite.once("animationcomplete", () => sprite.destroy());
        this.scene.sound.play("sfx-footstep", { volume: 0.75 });
    }
}
