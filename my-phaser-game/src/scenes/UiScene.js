import Phaser from "phaser";
import { gameState } from "../state/gameState";

export class UiScene extends Phaser.Scene {
    constructor() {
        super({ key: "ui" });
        this.lastHp = null;
        this.lastMaxHp = null;
    }

    create() {
        const margin = 20;
        const bottom = this.scale.height - margin;

        this.healthEmpty = this.add
            .image(margin, bottom, "health-empty")
            .setOrigin(0, 1);

        const scale = 20 / this.healthEmpty.height;
        this.healthEmpty.setScale(scale);

        this.healthFull = this.add
            .image(margin, bottom, "health-full")
            .setOrigin(0, 1)
            .setScale(scale);

        this.healthText = this.add.text(0, 0, "", {
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2
        });

        this.updateHealth();
    }

    updateHealth() {
        const { hp, maxHp } = gameState.player;
        if (hp === this.lastHp && maxHp === this.lastMaxHp) return;

        this.lastHp = hp;
        this.lastMaxHp = maxHp;

        const percent = maxHp > 0 ? hp / maxHp : 0;
        const cropWidth = this.healthFull.width * percent;
        this.healthFull.setCrop(0, 0, cropWidth, this.healthFull.height);

        const centerX =
            this.healthFull.x + this.healthFull.displayWidth / 2;
        const centerY =
            this.healthFull.y - this.healthFull.displayHeight / 2;
        this.healthText.setText(`${hp} / ${maxHp}`);
        this.healthText.setPosition(centerX, centerY);
        this.healthText.setOrigin(0.5, 0.5);
    }

    update() {
        this.updateHealth();
    }
}
