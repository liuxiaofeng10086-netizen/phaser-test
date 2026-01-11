// 所有格子对象的基础类
export class GridObject {
    constructor({
        scene,
        world,
        name,
        tileX,
        tileY,
        texture,
        frame,
        layer = "obstacle",
        collider = false,
        walkable = false,
        isTrigger = false,
        offsetY = 0
    }) {
        this.scene = scene;
        this.world = world;
        this.name = name;
        this.tileX = tileX;
        this.tileY = tileY;
        this.layer = layer;
        this.collider = collider;
        this.walkable = walkable;
        this.isTrigger = isTrigger;
        this.interactable = false;
        this.disabled = false;
        this.offsetY = offsetY;

        // 视觉与逻辑分离：逻辑使用 tileX/tileY
        this.sprite = scene.add.sprite(0, 0, texture, frame);
        this.sprite.setOrigin(0.5, 0.5);
        this.placeAt(tileX, tileY);

        world.addObject(this);
    }

    // 放置到指定瓦片
    placeAt(tileX, tileY) {
        this.tileX = tileX;
        this.tileY = tileY;
        const { x, y } = this.world.tileToWorld(tileX, tileY);
        const offset = this.offsetY * this.world.tileSize;
        this.sprite.setPosition(x, y - offset);
        this.sprite.setDepth(this.world.getDepth(this.layer, y));
    }

    setFrame(frame) {
        this.sprite.setFrame(frame);
    }

    // 禁用/隐藏（用于拾取物持久化）
    setDisabled(disabled) {
        this.disabled = disabled;
        this.sprite.setVisible(!disabled);
        this.sprite.setActive(!disabled);
    }

    destroy() {
        this.world.removeObject(this);
        this.sprite.destroy();
    }
}
