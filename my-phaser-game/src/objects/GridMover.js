import { MOVE_DURATION } from "../config";
import { GridObject } from "./GridObject";

// 支持按格移动的对象基类
export class GridMover extends GridObject {
    constructor(options) {
        super(options);
        this.isMoving = false;
        this.facingX = 1;
        this.walkAnimation = options.walkAnimation;
        this.idleFrame = options.idleFrame;
    }

    // 异步移动到目标格子（含移动动画与脚印）
    async moveTo(tileX, tileY) {
        if (this.isMoving) return false;
        if (!this.world.isWalkable(tileX, tileY, { ignore: this })) return false;

        const fromTileX = this.tileX;
        const fromTileY = this.tileY;
        const { x: toX, y: rawY } = this.world.tileToWorld(tileX, tileY);
        const toY = rawY - this.offsetY * this.world.tileSize;

        const dirX = tileX - this.tileX;
        if (dirX !== 0) {
            this.facingX = dirX > 0 ? 1 : -1;
            this.sprite.setFlipX(this.facingX < 0);
        }

        this.tileX = tileX;
        this.tileY = tileY;
        this.isMoving = true;

        this.world.spawnFootstep(fromTileX, fromTileY);

        // 走路动画
        if (this.walkAnimation) {
            this.sprite.anims.play(this.walkAnimation, true);
        }

        await new Promise(resolve => {
            this.scene.tweens.add({
                targets: this.sprite,
                x: toX,
                y: toY,
                duration: MOVE_DURATION,
                ease: "Linear",
                onUpdate: () => {
                    const baseY =
                        this.sprite.y + this.offsetY * this.world.tileSize;
                    this.sprite.setDepth(this.world.getDepth(this.layer, baseY));
                },
                onComplete: () => resolve()
            });
        });

        this.isMoving = false;
        if (this.walkAnimation) {
            this.sprite.anims.stop();
        }
        if (this.idleFrame != null) {
            this.sprite.setFrame(this.idleFrame);
        }

        this.world.handleTriggersAt(this.tileX, this.tileY, this);
        return true;
    }
}
