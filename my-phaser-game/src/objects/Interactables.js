import { OBJECT_FRAMES } from "../data/frames";
import { getPersistedState, setPersistedState } from "../state/gameState";
import { GridObject } from "./GridObject";

// 交互冷却/等待帮助函数
const delay = (scene, ms) =>
    new Promise(resolve => scene.time.delayedCall(ms, resolve));

// 可交互对象基类
class InteractableObject extends GridObject {
    constructor(options) {
        super(options);
        this.interactable = true;
        this.interactLocked = false;
    }

    async interact(actor) {
        if (this.interactLocked || this.disabled) return;
        this.interactLocked = true;
        await this.onInteract(actor);
        this.interactLocked = false;
    }

    async onInteract() {}
}

// 咖啡机：只可交互一次
export class CoffeeMachine extends InteractableObject {
    constructor(options) {
        super({
            ...options,
            texture: "objects",
            frame: OBJECT_FRAMES.coffeeMachine,
            collider: true,
            walkable: false
        });
        this.filled = true;
    }

    async onInteract() {
        if (!this.filled) return;
        this.filled = false;
        this.setFrame(OBJECT_FRAMES.coffeeMachineEmpty);
        this.scene.sound.play("sfx-drinking");
    }
}

// 工位：交互切换状态
export class Workstation extends InteractableObject {
    constructor(options) {
        super({
            ...options,
            texture: "objects",
            frame: OBJECT_FRAMES.workstation1,
            collider: true,
            walkable: false
        });
        this.working = false;
    }

    async onInteract() {
        this.working = !this.working;
        this.setFrame(
            this.working
                ? OBJECT_FRAMES.workstation2
                : OBJECT_FRAMES.workstation1
        );
        await delay(this.scene, 400);
    }
}

// 僵尸植物：交互切换状态
export class ZombiePlant extends InteractableObject {
    constructor(options) {
        super({
            ...options,
            texture: "objects",
            frame: OBJECT_FRAMES.zombiePlant,
            collider: true,
            walkable: false,
            offsetY: 0.25
        });
        this.interacted = false;
    }

    async onInteract() {
        this.interacted = !this.interacted;
        this.setFrame(
            this.interacted
                ? OBJECT_FRAMES.zombiePlantInteracted
                : OBJECT_FRAMES.zombiePlant
        );
        await delay(this.scene, 400);
    }
}

// 披萨拾取：触发器 + 持久化
export class PizzaPickup extends GridObject {
    constructor({ scene, world, tileX, tileY, sceneId }) {
        const name = `pizza-${tileX}-${tileY}`;
        super({
            scene,
            world,
            name,
            tileX,
            tileY,
            texture: "objects",
            frame: OBJECT_FRAMES.pizza,
            layer: "item",
            collider: true,
            walkable: true,
            isTrigger: true
        });

        const persisted = getPersistedState(sceneId, name);
        if (persisted?.disabled) {
            this.setDisabled(true);
        }
    }

    onTrigger(actor) {
        if (actor.name !== "player" || this.disabled) return;
        this.setDisabled(true);
        setPersistedState(this.world.sceneId, this.name, { disabled: true });
        this.scene.sound.play("sfx-eating");
    }
}

export class ScenePortal extends InteractableObject {
    constructor({ scene, world, tileX, tileY, name, target, enterDirection }) {
        super({
            scene,
            world,
            name,
            tileX,
            tileY,
            texture: "objects",
            frame: OBJECT_FRAMES.floor,
            collider: true,
            walkable: false
        });
        this.target = target;
        this.enterDirection = enterDirection;
        // 传送点不显示精灵，仅保留交互逻辑
        this.sprite.setVisible(false);
    }

    async onInteract(actor) {
        if (actor.name !== "player") return;
        const [targetScene, targetPortal] = this.target.split("/");
        this.scene.scene.start(targetScene, { portalName: targetPortal });
    }
}

// 装饰植物：阻挡
export class Plant extends GridObject {
    constructor(options) {
        super({
            ...options,
            texture: "objects",
            frame: OBJECT_FRAMES.plant,
            collider: true,
            walkable: false,
            offsetY: 0.25
        });
    }
}
