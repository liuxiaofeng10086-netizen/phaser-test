import Phaser from "phaser";
import { PLAYER_FRAMES } from "./data/frames";

// 预加载 R3F 迁移所需的资源，并在此处创建动画。
export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    preload() {
        // 资源路径统一指向 public/assets/r3f
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

        // UI 血条图
        this.load.image("health-empty", "ui/health-empty.png");
        this.load.image("health-full", "ui/health-full.png");

        // 交互与移动音效
        this.load.audio("sfx-eating", "sfx/eating.wav");
        this.load.audio("sfx-drinking", "sfx/drinking.wav");
        this.load.audio("sfx-footstep", "sfx/footstep.wav");
    }

    create() {
        // 动画在场景启动前创建
        this.createAnimations();
        // 主场景 + UI 场景并行
        this.scene.start("office");
        this.scene.launch("ui");
    }

    createAnimations() {
        // 玩家走路动画 - 使用 frames.js 中的配置
        this.anims.create({
            key: "player-walk",
            frames: this.anims.generateFrameNumbers("player", { frames: PLAYER_FRAMES.walk }),
            frameRate: 4,
            repeat: -1
        });

        // 僵尸走路动画（使用 objects 图集）
        this.anims.create({
            key: "zombie-walk",
            frames: this.anims.generateFrameNumbers("objects", { frames: [10, 10] }),
            frameRate: 4,
            repeat: -1
        });

        // 脚印特效动画
        this.anims.create({
            key: "footstep",
            frames: this.anims.generateFrameNumbers("footstep", {
                start: 0,
                end: 2
              }),
            frameRate: 4,
            repeat: 0
        });
    }
}
