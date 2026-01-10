import Phaser from "phaser";
import { Preloader } from "./preloader";
import { OfficeScene } from "./scenes/OfficeScene";
import { OtherScene } from "./scenes/OtherScene";
import { UiScene } from "./scenes/UiScene";

// More information about config: https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
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
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Preloader, OfficeScene, OtherScene, UiScene]
};

new Phaser.Game(config);
