# R3F 2D 游戏项目开发范式

> 本文档总结了该项目的核心架构设计、开发模式和最佳实践，供开发者快速理解项目结构。

---

## 一、整体架构模式

这是一个 **基于 React 组件化的实体-组件系统（Entity-Component System, ECS 轻量版）**，结合了 **发布-订阅（PubSub）事件驱动架构**。

### 核心层次结构

```
App → Game → SceneManager → Scene → GameObject → Components
```

| 层级 | 职责 | 文件位置 |
|------|------|----------|
| **Game** | 游戏容器，管理 R3F Canvas、全局状态、游戏对象注册表 | `src/@core/Game.tsx` |
| **SceneManager** | 场景切换、Level 管理、场景级状态持久化 | `src/@core/SceneManager.tsx` |
| **Scene** | 单个场景容器，管理动态实例化、场景生命周期事件 | `src/@core/Scene.tsx` |
| **GameObject** | 游戏实体，包含 transform、组件注册、PubSub 实例 | `src/@core/GameObject.tsx` |
| **Components** | 功能组件（如 Collider、Moveable），挂载在 GameObject 上 | `src/@core/Collider.tsx` 等 |

### 组件层次示例

```tsx
<Game cameraZoom={80}>
    <AssetLoader urls={urls} placeholder="Loading...">
        <SceneManager defaultScene="office">
            <Scene id="office">
                <GameObject name="player" layer="character">
                    <Moveable />
                    <Collider />
                    <Interactable />
                    <Sprite {...spriteData.player} />
                </GameObject>
            </Scene>
        </SceneManager>
    </AssetLoader>
</Game>
```

---

## 二、资源加载机制

### 模式：集中声明 + 预加载 + Context 分发

#### 1. 资源声明（`spriteData.ts` / `soundData.ts`）

```typescript
const spriteData = {
    player: { 
        src: './assets/player.png', 
        frameWidth: 20,
        frameHeight: 20,
        sheet: {
            default: [[0, 2]],
            walk: [[1, 2], [2, 2]],
        }
    },
    objects: { 
        src: './assets/objects.png', 
        sheet: {
            floor: [[0, 0]],
            wall: [[1, 0]],
        }
    }
};
```

#### 2. 预加载（`App.tsx`）

```tsx
const urls = [
    ...Object.values(spriteData).map(data => data.src),
    ...Object.values(soundData).map(data => data.src),
].reduce<string[]>((acc, val) => acc.concat(val), []);

<AssetLoader urls={urls} placeholder="Loading assets ...">
    {children}  // 加载完成后渲染子组件
</AssetLoader>
```

#### 3. 访问资源（`useAsset` hook）

```typescript
const image = useAsset(src) as HTMLImageElement;
```

### 关键设计点

- **单例存储**：资源存储在模块级单例 `assets: { current: AssetStore }`
- **支持格式**：图片（png/jpg/gif）和音频（mp3/wav/ogg）
- **跨 Reconciler**：使用 `AssetLoaderContext` 在 DOM 和 WebGL reconciler 间共享

---

## 三、地图渲染系统

### 模式：数据驱动 + Resolver 函数映射

#### 1. 地图数据定义

```typescript
// 使用 ASCII 字符定义地图
const mapData = mapDataString(`
# # # # # # #
# · W T · · #
# · · · · o #
# # # # # # #
`);
```

#### 2. Tile 类型解析器

```typescript
const resolveMapTile: TileMapResolver = (type, x, y) => {
    const key = `${x}-${y}`;
    const position = { x, y };
    
    switch (type) {
        case '#':  // 墙壁
            return (
                <GameObject key={key} {...position} layer="wall">
                    <Collider />
                    <Sprite {...spriteData.objects} state="wall" />
                </GameObject>
            );
        case 'W':  // 工作站
            return (
                <Fragment key={key}>
                    {floor}
                    <Workstation {...position} />
                </Fragment>
            );
        case '·':  // 地板
            return (
                <GameObject key={key} {...position} layer="ground">
                    <Sprite {...spriteData.objects} state="floor" />
                </GameObject>
            );
        default:
            return null;
    }
};
```

#### 3. TileMap 组件自动渲染

```tsx
<TileMap data={mapData} resolver={resolveMapTile} definesMapSize />
```

### 关键技术点

- **Sprite 渲染**：使用 Three.js `PlaneBufferGeometry` + 纹理 UV 偏移实现精灵动画
- **Z 轴排序**：通过 `layer` 属性和 y 轴位置自动计算 `position.z`
  ```typescript
  // GameObject.tsx 中的 Z 轴计算
  let offsetZ = 0;
  if (layer === 'ground') offsetZ = -1;
  if (layer === 'character') offsetZ = 0.5;
  if (layer === 'fx') offsetZ = 4;
  // 最终 position: [x, y, (-y + offsetZ) / 100]
  ```
- **碰撞检测**：基于 Tile 的离散碰撞（非物理引擎）

---

## 四、状态同步与通信机制

### 4.1 游戏对象注册表（多维度索引）

`Game.tsx` 中维护 4 个 Map 实现高效查询：

```typescript
registryById: Map<symbol, GameObjectRef>        // 按 ID 查找
registryByName: Map<string, GameObjectRef>      // 按名称查找
registryByXY: Map<string, GameObjectRef[]>      // 按坐标查找
registryByLayer: Map<string, GameObjectRef[]>   // 按图层查找
```

#### 使用场景

```typescript
// 获取玩家引用
const player = findGameObjectByName('player');

// 检测坐标 (5, 3) 上的所有对象（用于碰撞检测）
const objects = findGameObjectsByXY(5, 3);

// 获取所有角色层对象
const characters = findGameObjectsByLayer('character');
```

### 4.2 发布-订阅事件系统（三层 PubSub）

| 层级 | Context | 典型事件 | 用途 |
|------|---------|----------|------|
| **Game 级** | `GameContext` | `scene-init`, `scene-ready`, `scene-exit`, `tile-map-update` | 场景生命周期、全局事件 |
| **Scene 级** | `SceneContext` | 场景特定事件 | 场景内通信 |
| **GameObject 级** | `GameObjectContext` | `will-move`, `did-move`, `collision`, `trigger`, `interaction` | 对象间通信 |

#### 事件驱动示例

```typescript
// 发布事件
publish<DidMoveEvent>('did-move', targetPosition);

// 订阅 Game 级事件
useGameEvent<SceneReadyEvent>('scene-ready', () => {
    console.log('场景准备完成');
});

// 订阅 GameObject 级事件
useGameObjectEvent<CollisionEvent>('collision', (ref) => {
    console.log('碰撞对象:', ref.name);
});
```

### 4.3 组件注册与跨组件通信

#### 注册组件 API

```typescript
// 在 Moveable 组件中注册 API
useComponentRegistry<MoveableRef>('Moveable', {
    canMove: (position?) => boolean,
    isMoving: () => boolean,
    move: async (position, type?) => boolean,
    blockMovement: async (delayMs) => void,
});
```

#### 跨组件调用

```typescript
// 在其他组件或脚本中调用
const { getComponent } = useGameObject();
const moveable = getComponent<MoveableRef>('Moveable');

if (moveable.canMove()) {
    await moveable.move({ x: 5, y: 3 });
}
```

#### 核心组件 API 参考

| 组件名 | 主要 API | 功能 |
|--------|----------|------|
| `Moveable` | `move(position)`, `canMove()`, `isMoving()` | 移动控制 |
| `Collider` | `walkable`, `setWalkable()`, `onCollision()`, `onTrigger()` | 碰撞检测 |
| `Interactable` | `interact(position)`, `canInteract()` | 交互系统 |
| `ScenePortal` | `port(target)` | 场景传送 |

---

## 五、状态持久化机制

### 模式：两级 Store（Game 级 + Scene 级）

#### Scene 级状态（场景切换时保留）

```typescript
const { getSceneState, setSceneState } = useSceneManager();

// 保存场景状态
setSceneState('boss_defeated', true);

// 读取场景状态
const defeated = getSceneState('boss_defeated');
```

#### Game 级状态（全局持久）

```typescript
const { getGameState, setGameState } = useGame();

// 保存全局状态（如当前传送门）
setGameState(targetPortalKey, 'entrance');

// 读取全局状态
const portal = getGameState(targetPortalKey);
```

#### GameObject 自动存取

```typescript
// 自动在场景切换时保存/恢复数据
useGameObjectStore(
    '_gameObject',
    // 写入函数
    () => ({ 
        x: transform.x, 
        y: transform.y, 
        disabled: self.disabled 
    }),
    // 读取函数
    (stored) => { 
        self.setDisabled(stored.disabled);
    }
);
```

### 触发时机

| 事件 | Store 操作 |
|------|-----------|
| `scene-init` | 恢复数据（读取） |
| `scene-exit` | 保存数据（写入） |
| `save-game` | 手动保存触发器 |

---

## 六、核心设计模式总结

| 设计模式 | 应用场景 | 示例 |
|----------|----------|------|
| **组合模式** | GameObject 由多个 Components 组合 | `<GameObject><Moveable /><Collider /></GameObject>` |
| **发布-订阅** | 解耦组件间通信 | `publish('collision')`, `subscribe('did-move')` |
| **Context 分发** | 跨层级状态共享 | `GameContext`, `SceneContext`, `GameObjectContext` |
| **Hook 抽象** | 封装复杂逻辑为可复用 Hook | `useCollisionTest`, `usePathfinding`, `useGameLoop` |
| **Resolver 模式** | 数据到组件的映射 | `TileMapResolver` |
| **命令模式** | 可异步、可队列的操作 | `Moveable.move()` 返回 Promise |
| **单例模式** | 全局共享资源 | 资源加载器的 `assets` 对象 |

---

## 七、关键 Hooks 参考

### 游戏系统 Hooks

| Hook | 功能 | 返回值 |
|------|------|--------|
| `useGame()` | 获取 Game Context | `{ findGameObjectByName, findGameObjectsByXY, publish, subscribe, ... }` |
| `useGameObject()` | 获取当前 GameObject Context | `{ id, name, transform, getComponent, publish, ... }` |
| `useScene()` | 获取当前 Scene Context | `{ currentScene, instantiate, resetScene, ... }` |
| `useSceneManager()` | 获取场景管理器 | `{ setScene, setLevel, getSceneState, ... }` |

### 功能性 Hooks

| Hook | 功能 | 使用示例 |
|------|------|----------|
| `useGameLoop(callback, enabled?)` | 每帧调用回调 | 实现角色动画、输入检测 |
| `useGameEvent(eventName, callback)` | 订阅 Game 级事件 | 监听场景切换 |
| `useGameObjectEvent(eventName, callback)` | 订阅 GameObject 级事件 | 监听移动、碰撞 |
| `useCollisionTest(options?)` | 创建碰撞测试函数 | `testCollision({ x, y })` |
| `usePathfinding()` | A* 寻路算法 | `findPath({ to: target })` |
| `useKeyPress(keys)` | 监听键盘按键 | `const isPressed = useKeyPress(['w', 'ArrowUp'])` |
| `usePointer()` | 获取鼠标指向的 Tile 坐标 | `const pointer = usePointer()` |
| `useComponentRegistry(name, api)` | 注册组件 API | 创建自定义组件 |
| `useGameObjectStore(key, write, read?)` | GameObject 状态持久化 | 保存/恢复对象状态 |

---

## 八、扩展新功能的典型流程

### 1. 创建新 Entity（实体）

在 `src/entities/` 中组合现有组件：

```typescript
// src/entities/Enemy.tsx
export default function Enemy(props: GameObjectProps) {
    return (
        <GameObject name="enemy" layer="character" {...props}>
            <Moveable />
            <Collider />
            <Sprite {...spriteData.enemy} />
            <EnemyAI />  {/* 自定义脚本 */}
        </GameObject>
    );
}
```

### 2. 创建新 Component（组件）

使用 `useComponentRegistry` 暴露 API：

```typescript
// src/@core/Health.tsx
export type HealthRef = ComponentRef<'Health', {
    hp: number;
    maxHp: number;
    takeDamage: (amount: number) => void;
    heal: (amount: number) => void;
}>;

export default function Health({ maxHp = 100 }: { maxHp?: number }) {
    const [hp, setHp] = useState(maxHp);
    const { publish } = useGameObject();
    
    useComponentRegistry<HealthRef>('Health', {
        hp,
        maxHp,
        takeDamage(amount) {
            const newHp = Math.max(0, hp - amount);
            setHp(newHp);
            if (newHp === 0) publish('death', null);
        },
        heal(amount) {
            setHp(Math.min(maxHp, hp + amount));
        },
    });
    
    return null;
}
```

### 3. 添加新事件类型

定义 `PubSubEvent` 类型并在合适位置发布：

```typescript
// 定义事件类型
export type DeathEvent = PubSubEvent<'death', void>;

// 发布事件
publish<DeathEvent>('death');

// 订阅事件
useGameObjectEvent<DeathEvent>('death', () => {
    console.log('对象死亡');
});
```

### 4. 创建新 Scene（场景）

组合 `TileMap` + Entities + `ScenePortal`：

```typescript
// src/scenes/DungeonScene.tsx
export default function DungeonScene() {
    return (
        <>
            <GameObject name="map">
                <ambientLight />
                <TileMap data={dungeonMapData} resolver={resolveMapTile} definesMapSize />
            </GameObject>
            <Player x={1} y={1} />
            <Enemy x={5} y={5} />
            <GameObject x={10} y={10}>
                <Collider />
                <Interactable />
                <ScenePortal name="exit" target="office/entrance" />
            </GameObject>
        </>
    );
}
```

### 5. 添加新 Script（脚本组件）

创建使用 `useGameLoop` / `useGameEvent` 的脚本组件：

```typescript
// src/components/EnemyAI.tsx
export default function EnemyAI() {
    const { getComponent, transform } = useGameObject();
    const { findGameObjectByName } = useGame();
    const findPath = usePathfinding();
    
    useGameLoop(() => {
        const player = findGameObjectByName('player');
        const distance = Math.abs(player.transform.x - transform.x) + 
                        Math.abs(player.transform.y - transform.y);
        
        // 距离小于 5 时追击
        if (distance < 5) {
            const path = findPath({ to: player.transform });
            if (path.length > 0) {
                getComponent<MoveableRef>('Moveable').move(path[0]);
            }
        }
    });
    
    return null;
}
```

---

## 九、项目文件结构

```
src/
├── @core/                    # 核心引擎模块
│   ├── Game.tsx             # 游戏容器
│   ├── Scene.tsx            # 场景管理
│   ├── SceneManager.tsx     # 场景切换
│   ├── GameObject.tsx       # 游戏对象基类
│   ├── AssetLoader.tsx      # 资源加载器
│   ├── TileMap.tsx          # Tile 地图渲染
│   ├── Collider.tsx         # 碰撞组件
│   ├── Moveable.tsx         # 移动组件
│   ├── Interactable.tsx     # 交互组件
│   ├── Sprite.tsx           # 精灵组件
│   ├── Graphic.tsx          # 图形渲染
│   ├── ScenePortal.tsx      # 场景传送门
│   ├── useGameLoop.ts       # 游戏循环 Hook
│   ├── useCollisionTest.ts  # 碰撞检测 Hook
│   ├── usePathfinding.ts    # 寻路 Hook
│   └── utils/               # 工具函数
│       ├── createPubSub.ts  # 发布订阅系统
│       ├── tileUtils.ts     # Tile 工具
│       └── mapUtils.ts      # 地图工具
├── assets/                   # 资源文件
│   ├── player.png
│   ├── objects.png
│   └── ...
├── components/               # 游戏脚本组件
│   ├── PlayerScript.tsx     # 玩家控制脚本
│   ├── CharacterScript.tsx  # 角色动画脚本
│   └── CameraFollowScript.tsx # 摄像机跟随
├── entities/                 # 游戏实体
│   ├── Player.tsx
│   ├── Plant.tsx
│   └── ...
├── scenes/                   # 游戏场景
│   ├── OfficeScene.tsx
│   └── OtherScene.tsx
├── spriteData.ts            # 精灵资源配置
├── soundData.ts             # 音频资源配置
└── App.tsx                  # 应用入口
```

---

## 十、最佳实践建议

### 1. 组件设计原则

- **单一职责**：每个组件只负责一个功能（如 `Moveable` 只负责移动）
- **无状态优先**：优先使用函数式组件，状态集中在 GameObject
- **声明式 API**：组件通过 props 配置，避免命令式调用

### 2. 事件使用规范

- **命名规范**：使用 `will-*`, `did-*`, `attempt-*` 等前缀表示时序
- **避免循环**：谨慎在事件处理中发布新事件，防止无限循环
- **类型安全**：定义明确的 `PubSubEvent` 类型

### 3. 性能优化建议

- **减少重渲染**：使用 `useMemo`, `useCallback` 缓存对象和函数
- **懒加载场景**：大型游戏可拆分多个 Scene，按需加载
- **批量更新**：使用 `useGameLoop` 集中处理每帧更新

### 4. 调试技巧

- **使用 `name` 属性**：为关键 GameObject 设置 name 便于查找
- **事件日志**：在开发环境打印关键事件便于追踪
- **React DevTools**：使用 React DevTools 查看组件树和 Context

---

## 十一、常见问题 FAQ

### Q: 为什么使用基于 Tile 的碰撞而不是物理引擎？

A: 这个项目面向回合制或网格化的 2D 游戏，基于 Tile 的离散碰撞更简单高效。如果需要连续物理模拟，可以集成 `use-cannon` 等库。

### Q: 如何在 GameObject 间传递数据？

A: 三种方式：
1. 通过 `publish/subscribe` 事件系统
2. 通过 `getComponent` 调用其他组件 API
3. 通过 `findGameObjectByName` 获取对象引用

### Q: Scene 切换时如何保留状态？

A: 使用 `useGameObjectStore` 自动保存/恢复，或手动使用 `getSceneState/setSceneState`。

### Q: 如何实现动画？

A: 
- **精灵动画**：通过 `Sprite` 的 `sheet` 配置帧序列
- **移动动画**：`Moveable` 使用 `anime.js` 实现补间
- **自定义动画**：在 `useGameLoop` 中手动更新属性

---

## 十二、相关资源

- [React Three Fiber 官方文档](https://docs.pmnd.rs/react-three-fiber/)
- [Three.js 文档](https://threejs.org/docs/)
- [原作者 Twitter 线程](https://twitter.com/coldi/status/1254446313955119104)
- [深度教程 by @flagrede](https://dev.to/flagrede/making-a-2d-rpg-game-with-react-tree-fiber-4af1)

---

**最后更新时间**：2026-01-07
