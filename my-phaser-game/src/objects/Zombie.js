import { CHARACTER_OFFSET_Y } from "../config";
import { OBJECT_FRAMES } from "../data/frames";
import { GridMover } from "./GridMover";

export class Zombie extends GridMover {
    constructor({ scene, world, tileX, tileY, chaseDistance = 3, target }) {
        super({
            scene,
            world,
            name: "zombie",
            tileX,
            tileY,
            texture: "objects",
            frame: OBJECT_FRAMES.zombieIdle,
            layer: "character",
            collider: true,
            walkable: false,
            offsetY: CHARACTER_OFFSET_Y,
            walkAnimation: "zombie-walk",
            idleFrame: OBJECT_FRAMES.zombieIdle
        });

        this.chaseDistance = chaseDistance;
        this.target = target;
        this.nextThinkTime = 0;
    }

    update(time) {
        if (time >= this.nextThinkTime) {
            this.nextThinkTime = time + 150;
            if (!this.isMoving && this.target) {
                const dx = Math.abs(this.target.tileX - this.tileX);
                const dy = Math.abs(this.target.tileY - this.tileY);
                const distance = dx + dy;

                if (distance <= this.chaseDistance && distance > 0) {
                    const path = this.world.findPath(
                        { x: this.tileX, y: this.tileY },
                        { x: this.target.tileX, y: this.target.tileY },
                        {
                            destination: {
                                x: this.target.tileX,
                                y: this.target.tileY
                            },
                            allowOccupiedBy: this.target
                        }
                    );
                    if (path.length) {
                        this.moveTo(path[0].x, path[0].y);
                    }
                }
            }
        }

        if (!this.isMoving) {
            const breath = 1 + Math.sin(time / 240) / 20;
            this.sprite.setScale(1, breath);
            this.sprite.setRotation(0);
        } else {
            this.sprite.setScale(1, 1);
            this.sprite.setRotation(Math.sin(time / 80) * 0.07);
        }
    }
}
