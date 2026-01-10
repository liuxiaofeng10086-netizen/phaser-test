import { CHARACTER_OFFSET_Y } from "../config";
import { PLAYER_FRAMES, UI_FRAMES } from "../data/frames";
import { gameState } from "../state/gameState";
import { GridMover } from "./GridMover";

export class Player extends GridMover {
    constructor({ scene, world, tileX, tileY }) {
        super({
            scene,
            world,
            name: "player",
            tileX,
            tileY,
            texture: "player",
            frame: PLAYER_FRAMES.idle,
            layer: "character",
            collider: true,
            walkable: false,
            offsetY: CHARACTER_OFFSET_Y,
            walkAnimation: "player-walk",
            idleFrame: PLAYER_FRAMES.idle
        });

        this.path = [];
        this.pathOverlayEnabled = true;
        this.processingPath = false;
        this.pointerPath = [];

        this.pointerIndicator = scene.add.sprite(0, 0, "ui", UI_FRAMES.select);
        this.pointerIndicator.setOrigin(0.5, 0.5);
        this.pointerIndicator.setAlpha(0.5);

        this.pathGroup = scene.add.group();

        this.keys = scene.input.keyboard.addKeys({
            up: "UP",
            down: "DOWN",
            left: "LEFT",
            right: "RIGHT",
            w: "W",
            a: "A",
            s: "S",
            d: "D"
        });

        scene.input.on("pointerdown", pointer => {
            if (pointer.button !== 0) return;
            this.handlePointerClick(pointer);
        });

        gameState.player.tileX = tileX;
        gameState.player.tileY = tileY;
    }

    setPath(path, overlayEnabled) {
        this.path = path;
        this.pathOverlayEnabled = overlayEnabled;
    }

    handlePointerClick(pointer) {
        const tile = this.getPointerTile(pointer);
        if (!tile || !this.world.isWithinBounds(tile.x, tile.y)) {
            this.setPath([], true);
            return;
        }

        const path = this.world.findPath(
            { x: this.tileX, y: this.tileY },
            tile,
            {
                destination: tile,
                allowDestinationOnInteractable: true,
                allowOccupiedBy: this
            }
        );
        this.setPath(path, true);
    }

    getPointerTile(pointer) {
        const camera = this.scene.cameras.main;
        const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
        return this.world.worldToTile(worldPoint.x, worldPoint.y);
    }

    canMoveDiagonal(nextX, nextY) {
        const dx = nextX - this.tileX;
        const dy = nextY - this.tileY;
        if (dx === 0 || dy === 0) return true;
        const canHorizontal = this.world.isWalkable(this.tileX + dx, this.tileY, {
            ignore: this
        });
        const canVertical = this.world.isWalkable(this.tileX, this.tileY + dy, {
            ignore: this
        });
        return canHorizontal && canVertical;
    }

    handleKeyboardInput() {
        if (this.isMoving || this.processingPath) return;

        const left = this.keys.left.isDown || this.keys.a.isDown;
        const right = this.keys.right.isDown || this.keys.d.isDown;
        const up = this.keys.up.isDown || this.keys.w.isDown;
        const down = this.keys.down.isDown || this.keys.s.isDown;

        const dirX = (right ? 1 : 0) - (left ? 1 : 0);
        const dirY = (up ? 1 : 0) - (down ? 1 : 0);

        if (!dirX && !dirY) return;

        const nextX = this.tileX + dirX;
        const nextY = this.tileY + dirY;

        if (!this.canMoveDiagonal(nextX, nextY)) return;
        if (!this.world.isWalkable(nextX, nextY, { ignore: this })) return;

        this.setPath([{ x: nextX, y: nextY }], false);
    }

    async processPathStep() {
        if (!this.path.length || this.processingPath) return;
        this.processingPath = true;

        const next = this.path[0];
        const moved = await this.moveTo(next.x, next.y);
        let acted = moved;

        if (!moved && this.path.length === 1) {
            acted = await this.world.interactAt(next.x, next.y, this);
        }

        if (acted) {
            this.path.shift();
        }

        this.processingPath = false;
    }

    updateOverlay(pointer) {
        const pointerTile = this.getPointerTile(pointer);
        const inBounds =
            pointerTile &&
            this.world.isWithinBounds(pointerTile.x, pointerTile.y);

        if (!inBounds) {
            this.pointerIndicator.setVisible(false);
            this.pathGroup.clear(true, true);
            return;
        }

        const { x, y } = this.world.tileToWorld(pointerTile.x, pointerTile.y);
        this.pointerIndicator.setVisible(true);
        this.pointerIndicator.setPosition(x, y);
        this.pointerIndicator.setDepth(this.world.getDepth("fx", y));

        const hasTarget = this.world.hasInteractable(
            pointerTile.x,
            pointerTile.y
        );
        this.pointerIndicator.setTint(hasTarget ? 0xff4444 : 0xffffff);
        this.pointerIndicator.setAlpha(this.pathOverlayEnabled ? 1 : 0.5);

        let renderPath = [];
        let opacity = 0.25;
        if (this.pathOverlayEnabled) {
            if (this.path.length) {
                renderPath = this.path;
                opacity = null;
            } else {
                renderPath = this.world.findPath(
                    { x: this.tileX, y: this.tileY },
                    pointerTile,
                    {
                        destination: pointerTile,
                        allowDestinationOnInteractable: true,
                        allowOccupiedBy: this
                    }
                );
                opacity = 0.25;
            }
        }

        this.pathGroup.clear(true, true);
        renderPath.forEach((step, index) => {
            const pos = this.world.tileToWorld(step.x, step.y);
            const dot = this.scene.add.sprite(pos.x, pos.y, "ui", UI_FRAMES.dot);
            dot.setDepth(this.world.getDepth("fx", pos.y));
            dot.setAlpha(
                opacity != null ? opacity : Math.min(0.75, index / 5)
            );
            this.pathGroup.add(dot);
        });
    }

    update(time, delta) {
        this.handleKeyboardInput();
        this.processPathStep();
        this.updateOverlay(this.scene.input.activePointer);

        if (!this.isMoving) {
            const breath = 1 + Math.sin(time / 240) / 20;
            this.sprite.setScale(1, breath);
            this.sprite.setRotation(0);
        } else {
            this.sprite.setScale(1, 1);
            this.sprite.setRotation(Math.sin(time / 80) * 0.07);
        }

        gameState.player.tileX = this.tileX;
        gameState.player.tileY = this.tileY;
    }
}
