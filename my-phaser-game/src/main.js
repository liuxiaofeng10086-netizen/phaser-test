import Phaser from "phaser";
import { Preloader } from "./preloader";
import { OfficeScene } from "./scenes/OfficeScene";
import { OtherScene } from "./scenes/OtherScene";
import { UiScene } from "./scenes/UiScene";

// Phaser 游戏配置
const config = {
    type: Phaser.AUTO,
    parent: "phaser-container",
    width: 960,
    height: 540,
    backgroundColor: "#1c172e",
    pixelArt: true,
    roundPixel: true,
    max: {
        width: 960,
        height: 540
    },
    // 自适应缩放
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // 顺序：预加载 -> 办公室/其他 -> UI
    scene: [Preloader, OfficeScene, OtherScene, UiScene]
};

new Phaser.Game(config);
