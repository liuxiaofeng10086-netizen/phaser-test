import Phaser from "phaser";

// Class to preload all the assets needed for the R3F-to-Phaser port.
export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    preload() {
        this.load.setPath("assets/r3f");
        this.load.spritesheet("objects", "objects.png", {
            frameWidth: 20,
            frameHeight: 20
        });
        this.load.spritesheet("player", "player.png", {
            frameWidth: 20,
            frameHeight: 20
        });
        this.load.spritesheet("ui", "ui.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("footstep", "footstep.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.image("health-empty", "ui/health-empty.png");
        this.load.image("health-full", "ui/health-full.png");

        this.load.audio("sfx-eating", "sfx/eating.wav");
        this.load.audio("sfx-drinking", "sfx/drinking.wav");
        this.load.audio("sfx-footstep", "sfx/footstep.wav");
    }

    create() {
        this.createAnimations();
        this.scene.start("office");
        this.scene.launch("ui");
    }

    createAnimations() {
        this.anims.create({
            key: "player-walk",
            frames: this.anims.generateFrameNumbers("player", { frames: [7, 8] }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: "zombie-walk",
            frames: this.anims.generateFrameNumbers("objects", { frames: [18, 17] }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: "footstep",
            frames: this.anims.generateFrameNumbers("footstep", { frames: [0, 2] }),
            frameRate: 7,
            repeat: 0
        });
    }
}
