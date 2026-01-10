# R3F 2D 游戏项目 - 自然语言接口说明书

> **使用说明**：您只需按照本文档中的中文指令格式向我描述需求，我将自动为您生成对应的代码。

---

## 📑 目录

- [一、实体创建类](#一实体创建类)
- [二、组件功能类](#二组件功能类)
- [三、场景管理类](#三场景管理类)
- [四、地图构建类](#四地图构建类)
- [五、交互逻辑类](#五交互逻辑类)
- [六、动画效果类](#六动画效果类)
- [七、事件系统类](#七事件系统类)
- [八、状态管理类](#八状态管理类)
- [九、AI 与寻路类](#九ai-与寻路类)
- [十、视觉效果类](#十视觉效果类)
- [十一、音效管理类](#十一音效管理类)
- [十二、UI 元素类](#十二ui-元素类)

---

## 一、实体创建类

### 1.1 创建静态实体

**指令格式**：
```
创建[实体名称]，位置在(x, y)，使用[精灵名称]
```

**参数说明**：
- `实体名称`：实体的中文名称（如"石头"、"树木"）
- `x, y`：坐标位置
- `精灵名称`：在 spriteData.ts 中定义的精灵 state

**后台操作逻辑**：
1. 在 `src/entities/` 创建新文件 `[实体名称].tsx`
2. 使用 `GameObject` 包裹，设置 `layer="obstacle"`
3. 添加 `Collider` 组件（默认 walkable=false）
4. 添加 `Sprite` 组件，引用指定精灵

**示例**：
```
创建石头，位置在(5, 3)，使用 rock 精灵
```

**我会生成**：
```tsx
// src/entities/Rock.tsx
import React from 'react';
import Collider from '../@core/Collider';
import GameObject, { GameObjectProps } from '../@core/GameObject';
import Sprite from '../@core/Sprite';
import spriteData from '../spriteData';

export default function Rock(props: GameObjectProps) {
    return (
        <GameObject name="rock" layer="obstacle" {...props}>
            <Collider />
            <Sprite {...spriteData.objects} state="rock" />
        </GameObject>
    );
}
```

---

### 1.2 创建可移动角色

**指令格式**：
```
创建[角色名称]，可以移动，使用[精灵名称]，有[动画状态列表]
```

**参数说明**：
- `角色名称`：角色的中文名称（如"敌人"、"NPC"）
- `精灵名称`：精灵图资源名
- `动画状态列表`：如"idle, walk, attack"

**后台操作逻辑**：
1. 创建实体文件
2. 添加 `Moveable` 组件
3. 添加 `Collider` 组件
4. 添加 `CharacterScript` 控制动画
5. 配置精灵表的动画状态

**示例**：
```
创建敌人，可以移动，使用 enemy 精灵，有 idle 和 walk 动画
```

**我会生成**：
```tsx
// src/entities/Enemy.tsx
export default function Enemy(props: GameObjectProps) {
    return (
        <GameObject name="enemy" layer="character" {...props}>
            <Moveable />
            <Collider />
            <CharacterScript>
                <Sprite {...spriteData.enemy} />
            </CharacterScript>
        </GameObject>
    );
}
```

---

### 1.3 创建可交互物品

**指令格式**：
```
创建[物品名称]，可以交互，交互后[效果描述]
```

**参数说明**：
- `物品名称`：物品的中文名称
- `效果描述`：交互后的行为（如"消失"、"播放音效"、"显示对话"）

**后台操作逻辑**：
1. 创建实体文件
2. 添加 `Interactable` 组件
3. 添加 `Collider isTrigger`（可穿过）
4. 使用 `useGameObjectEvent` 监听 `interaction` 事件
5. 实现交互逻辑

**示例**：
```
创建宝箱，可以交互，交互后播放音效并消失
```

**我会生成**：
```tsx
// src/entities/Chest.tsx
function ChestScript() {
    const { getRef } = useGameObject();
    
    useGameObjectEvent<InteractionEvent>('interaction', () => {
        // 播放音效
        playSound('open_chest');
        // 消失
        getRef().setDisabled(true);
    });
    
    return null;
}

export default function Chest(props: GameObjectProps) {
    return (
        <GameObject name="chest" layer="item" {...props}>
            <Interactable />
            <Collider isTrigger />
            <Sprite {...spriteData.objects} state="chest" />
            <ChestScript />
        </GameObject>
    );
}
```

---

### 1.4 创建带生命值的角色

**指令格式**：
```
创建[角色名称]，有[数值]点生命值，可以[能力列表]
```

**参数说明**：
- `角色名称`：角色名称
- `数值`：最大生命值
- `能力列表`：如"移动, 攻击, 防御"

**后台操作逻辑**：
1. 创建 `Health.tsx` 组件（如果不存在）
2. 创建实体文件
3. 添加对应能力的组件（Moveable, Attackable 等）
4. 注册 `Health` 组件 API

**示例**：
```
创建 Boss，有 100 点生命值，可以移动和攻击
```

---

## 二、组件功能类

### 2.1 为实体添加组件

**指令格式**：
```
给[实体名称]添加[组件名称]功能
```

**参数说明**：
- `实体名称`：目标实体
- `组件名称`：Moveable, Collider, Interactable, Health 等

**后台操作逻辑**：
1. 定位到实体文件
2. 导入对应组件
3. 在 GameObject 内添加组件标签

**示例**：
```
给石头添加 Interactable 功能
```

---

### 2.2 创建自定义组件

**指令格式**：
```
创建[组件名称]组件，功能是[功能描述]，API 包含[方法列表]
```

**参数说明**：
- `组件名称`：组件的中文名称
- `功能描述`：组件的作用
- `方法列表`：暴露的 API 方法

**后台操作逻辑**：
1. 在 `src/@core/` 创建组件文件
2. 定义 `ComponentRef` 类型
3. 使用 `useComponentRegistry` 注册 API
4. 实现组件逻辑

**示例**：
```
创建生命值组件，功能是管理角色生命值，API包含 takeDamage 和 heal 方法
```

**我会生成**：
```tsx
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

---

### 2.3 创建脚本组件

**指令格式**：
```
创建[脚本名称]脚本，每帧/当[事件]时执行[逻辑描述]
```

**参数说明**：
- `脚本名称`：脚本的中文名称
- `事件`：触发条件（如"移动时"、"碰撞时"）
- `逻辑描述`：要执行的逻辑

**后台操作逻辑**：
1. 在 `src/components/` 创建脚本文件
2. 使用 `useGameLoop` 或 `useGameObjectEvent`
3. 实现对应逻辑

**示例**：
```
创建巡逻脚本，每帧检查距离并向玩家移动
```

**我会生成**：
```tsx
// src/components/PatrolScript.tsx
export default function PatrolScript() {
    const { getComponent, transform } = useGameObject();
    const { findGameObjectByName } = useGame();
    const findPath = usePathfinding();
    
    useGameLoop(() => {
        const player = findGameObjectByName('player');
        const distance = Math.abs(player.transform.x - transform.x) + 
                        Math.abs(player.transform.y - transform.y);
        
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

## 三、场景管理类

### 3.1 创建新场景

**指令格式**：
```
创建[场景名称]场景，包含[元素列表]
```

**参数说明**：
- `场景名称`：场景的标识符
- `元素列表`：如"地图, 玩家, 敌人, 出口"

**后台操作逻辑**：
1. 在 `src/scenes/` 创建场景文件
2. 使用 `TileMap` 渲染地图
3. 添加实体和光照
4. 在 `App.tsx` 注册场景

**示例**：
```
创建地牢场景，包含地图和玩家
```

**我会生成**：
```tsx
// src/scenes/DungeonScene.tsx
export default function DungeonScene() {
    return (
        <>
            <GameObject name="map">
                <ambientLight />
                <TileMap data={dungeonMapData} resolver={resolveMapTile} definesMapSize />
            </GameObject>
            <Player x={1} y={1} />
        </>
    );
}
```

---

### 3.2 添加场景传送门

**指令格式**：
```
在(x, y)添加传送门到[目标场景]/[传送点名称]
```

**参数说明**：
- `x, y`：传送门位置
- `目标场景`：目标场景 ID
- `传送点名称`：目标传送点标识

**后台操作逻辑**：
1. 创建 GameObject
2. 添加 `Collider` 和 `Interactable`
3. 添加 `ScenePortal` 组件
4. 配置目标和进入方向

**示例**：
```
在(10, 5)添加传送门到 office/entrance
```

**我会生成**：
```tsx
<GameObject x={10} y={5}>
    <Collider />
    <Interactable />
    <ScenePortal name="exit" enterDirection={[-1, 0]} target="office/entrance" />
</GameObject>
```

---

## 四、地图构建类

### 4.1 创建地图数据

**指令格式**：
```
创建[地图名称]，大小[宽]x[高]，包含[元素类型列表]
```

**参数说明**：
- `地图名称`：地图标识
- `宽, 高`：地图尺寸
- `元素类型列表`：如"墙壁, 地板, 水域"

**后台操作逻辑**：
1. 使用 ASCII 字符定义地图布局
2. 定义 Resolver 函数映射字符到组件
3. 配置 TileMap 组件

**示例**：
```
创建办公室地图，大小 17x8，包含墙壁、地板和工作站
```

**我会生成**：
```tsx
const officeMapData = mapDataString(`
# # # # # # # # # # # # # # # # #
# · W · · · · · · · · · · · · · #
# · · · · · · · · · · · · · · · #
# # # # # # # # # # # # # # # # #
`);

const resolveMapTile: TileMapResolver = (type, x, y) => {
    const key = `${x}-${y}`;
    const position = { x, y };
    
    switch (type) {
        case '#': return <Wall key={key} {...position} />;
        case '·': return <Floor key={key} {...position} />;
        case 'W': return <Workstation key={key} {...position} />;
        default: return null;
    }
};
```

---

### 4.2 添加地图元素

**指令格式**：
```
在地图的(x, y)添加[元素名称]
```

**参数说明**：
- `x, y`：目标坐标
- `元素名称`：要添加的实体

**后台操作逻辑**：
1. 在场景文件中添加对应实体
2. 设置正确的坐标和 layer

**示例**：
```
在地图的(5, 3)添加宝箱
```

**我会生成**：
```tsx
<Chest x={5} y={3} />
```

---

## 五、交互逻辑类

### 5.1 实现对话交互

**指令格式**：
```
让[实体名称]可以对话，内容是"[对话文本]"
```

**参数说明**：
- `实体名称`：目标实体
- `对话文本`：显示的对话内容

**后台操作逻辑**：
1. 添加 `Interactable` 组件
2. 监听 `interaction` 事件
3. 显示对话 UI（或控制台输出）

**示例**：
```
让NPC可以对话，内容是"欢迎来到游戏世界！"
```

**我会生成**：
```tsx
function NPCScript() {
    useGameObjectEvent<InteractionEvent>('interaction', () => {
        console.log('欢迎来到游戏世界！');
        // 或显示对话框
    });
    return null;
}

export default function NPC(props: GameObjectProps) {
    return (
        <GameObject name="npc" layer="character" {...props}>
            <Interactable />
            <Collider />
            <Sprite {...spriteData.npc} />
            <NPCScript />
        </GameObject>
    );
}
```

---

### 5.2 实现拾取交互

**指令格式**：
```
让[物品名称]可以拾取，拾取后[效果]
```

**参数说明**：
- `物品名称`：可拾取的物品
- `效果`：拾取后的行为（如"加分"、"获得道具"）

**后台操作逻辑**：
1. 使用 `Collider isTrigger`
2. 监听 `trigger` 事件
3. 检查触发者是否是玩家
4. 执行拾取逻辑并禁用物品

**示例**：
```
让金币可以拾取，拾取后加 10 分
```

**我会生成**：
```tsx
function CoinScript() {
    const { getRef } = useGameObject();
    const { getGameState, setGameState } = useGame();
    
    useGameObjectEvent<TriggerEvent>('trigger', (ref) => {
        if (ref.name === 'player') {
            const currentScore = getGameState('score') || 0;
            setGameState('score', currentScore + 10);
            getRef().setDisabled(true);
        }
    });
    
    return null;
}
```

---

### 5.3 实现碰撞反馈

**指令格式**：
```
当[实体A]碰到[实体B]时，[执行动作]
```

**参数说明**：
- `实体A, 实体B`：碰撞的双方
- `执行动作`：碰撞后的行为

**后台操作逻辑**：
1. 监听 `collision` 事件
2. 检查碰撞对象的名称或 layer
3. 执行对应逻辑

**示例**：
```
当玩家碰到陷阱时，扣除生命值
```

**我会生成**：
```tsx
useGameObjectEvent<CollisionEvent>('collision', (ref) => {
    if (ref.name === 'player') {
        const playerHealth = ref.getComponent<HealthRef>('Health');
        playerHealth?.takeDamage(10);
    }
});
```

---

## 六、动画效果类

### 6.1 添加精灵动画

**指令格式**：
```
给[实体名称]添加[动画状态]动画，帧序列是[帧列表]，帧时间[毫秒]
```

**参数说明**：
- `实体名称`：目标实体
- `动画状态`：动画名称（如 walk, idle）
- `帧列表`：如 "[[0,0], [1,0]]"
- `毫秒`：每帧持续时间

**后台操作逻辑**：
1. 在 `spriteData.ts` 添加动画配置
2. 更新实体的 Sprite 组件

**示例**：
```
给玩家添加 walk 动画，帧序列是[[1,2],[2,2]]，帧时间300毫秒
```

**我会生成**：
```tsx
// 在 spriteData.ts 中
player: {
    src: './assets/player.png',
    frameWidth: 20,
    frameHeight: 20,
    frameTime: 300,
    sheet: {
        walk: [[1, 2], [2, 2]],
    },
}
```

---

### 6.2 切换动画状态

**指令格式**：
```
当[实体名称][条件]时，播放[动画状态]
```

**参数说明**：
- `实体名称`：目标实体
- `条件`：触发条件（如"移动"、"攻击"）
- `动画状态`：要播放的动画

**后台操作逻辑**：
1. 使用 `CharacterScript` 或自定义脚本
2. 监听对应事件
3. 更新 Sprite 的 state prop

**示例**：
```
当玩家移动时，播放 walk 动画
```

---

### 6.3 添加视觉特效

**指令格式**：
```
在[位置]播放[特效名称]特效
```

**参数说明**：
- `位置`：坐标或"角色脚下"
- `特效名称`：特效类型（如"爆炸"、"脚印"）

**后台操作逻辑**：
1. 使用场景的 `instantiate` 方法
2. 创建临时 GameObject
3. 自动销毁或循环播放

**示例**：
```
在玩家脚下播放脚印特效
```

**我会生成**：
```tsx
const { instantiate } = useScene();

// 在移动事件中
useGameObjectEvent<DidMoveEvent>('did-move', ({ x, y }) => {
    const destroy = instantiate(
        <GameObject x={x} y={y} layer="fx">
            <Sprite {...spriteData.footstep} />
        </GameObject>
    );
    setTimeout(destroy, 500); // 0.5秒后销毁
});
```

---

## 七、事件系统类

### 7.1 监听游戏事件

**指令格式**：
```
当[事件名称]发生时，执行[操作描述]
```

**参数说明**：
- `事件名称`：Game 级事件（如 scene-ready）
- `操作描述`：要执行的操作

**后台操作逻辑**：
1. 使用 `useGameEvent` 监听事件
2. 实现回调逻辑

**示例**：
```
当场景准备完成时，播放背景音乐
```

**我会生成**：
```tsx
useGameEvent<SceneReadyEvent>('scene-ready', () => {
    playSound('background_music', { loop: true });
});
```

---

### 7.2 监听对象事件

**指令格式**：
```
当[对象]的[事件]发生时，[操作]
```

**参数说明**：
- `对象`：GameObject 或组件
- `事件`：对象级事件（如 collision, did-move）
- `操作`：要执行的操作

**后台操作逻辑**：
1. 使用 `useGameObjectEvent` 监听
2. 实现回调逻辑

**示例**：
```
当敌人的死亡事件发生时，掉落金币
```

**我会生成**：
```tsx
useGameObjectEvent<DeathEvent>('death', () => {
    const { transform } = useGameObject();
    const { instantiate } = useScene();
    
    instantiate(<Coin x={transform.x} y={transform.y} />);
});
```

---

### 7.3 发布自定义事件

**指令格式**：
```
定义[事件名称]事件，数据类型是[类型描述]
```

**参数说明**：
- `事件名称`：自定义事件名
- `类型描述`：事件携带的数据

**后台操作逻辑**：
1. 定义 `PubSubEvent` 类型
2. 在合适位置使用 `publish` 发布

**示例**：
```
定义 score-changed 事件，数据类型是 { oldScore: number, newScore: number }
```

**我会生成**：
```tsx
export type ScoreChangedEvent = PubSubEvent<'score-changed', {
    oldScore: number;
    newScore: number;
}>;

// 发布事件
publish<ScoreChangedEvent>('score-changed', { oldScore: 10, newScore: 20 });
```

---

## 八、状态管理类

### 8.1 保存对象状态

**指令格式**：
```
让[对象名称]的[属性列表]在场景切换时保持
```

**参数说明**：
- `对象名称`：要持久化的对象
- `属性列表`：如"位置, 生命值, 状态"

**后台操作逻辑**：
1. 使用 `useGameObjectStore`
2. 定义 write 和 read 函数
3. 自动在场景事件时触发

**示例**：
```
让玩家的位置和生命值在场景切换时保持
```

**我会生成**：
```tsx
useGameObjectStore(
    'player_data',
    () => ({
        x: transform.x,
        y: transform.y,
        hp: getComponent<HealthRef>('Health').hp,
    }),
    (stored) => {
        transform.setX(stored.x);
        transform.setY(stored.y);
        getComponent<HealthRef>('Health').heal(stored.hp);
    }
);
```

---

### 8.2 使用全局状态

**指令格式**：
```
创建全局变量[变量名]，初始值[值]
```

**参数说明**：
- `变量名`：状态的键名
- `值`：初始值

**后台操作逻辑**：
1. 使用 `getGameState` / `setGameState`
2. 在需要的地方读写

**示例**：
```
创建全局变量 score，初始值 0
```

**我会生成**：
```tsx
// 初始化
const { getGameState, setGameState } = useGame();
if (getGameState('score') === undefined) {
    setGameState('score', 0);
}

// 使用
const currentScore = getGameState('score');
setGameState('score', currentScore + 10);
```

---

### 8.3 使用场景状态

**指令格式**：
```
在[场景名称]中记录[状态名称]
```

**参数说明**：
- `场景名称`：场景标识
- `状态名称`：要记录的状态

**后台操作逻辑**：
1. 使用 `getSceneState` / `setSceneState`
2. 状态仅在该场景内有效

**示例**：
```
在地牢场景中记录 boss_defeated 状态
```

**我会生成**：
```tsx
const { getSceneState, setSceneState } = useSceneManager();

// 保存
setSceneState('boss_defeated', true);

// 读取
const defeated = getSceneState('boss_defeated');
```

---

## 九、AI 与寻路类

### 9.1 实现敌人AI

**指令格式**：
```
让[敌人名称]追踪玩家，当距离小于[距离]时开始追击
```

**参数说明**：
- `敌人名称`：敌人实体
- `距离`：触发追击的距离

**后台操作逻辑**：
1. 创建 AI 脚本组件
2. 使用 `useGameLoop` 每帧检测
3. 使用 `usePathfinding` 寻路
4. 调用 `Moveable.move` 移动

**示例**：
```
让僵尸追踪玩家，当距离小于 5 时开始追击
```

**我会生成**：
```tsx
function ZombieAI() {
    const { getComponent, transform } = useGameObject();
    const { findGameObjectByName } = useGame();
    const findPath = usePathfinding();
    
    useGameLoop(() => {
        const player = findGameObjectByName('player');
        if (!player) return;
        
        const distance = Math.abs(player.transform.x - transform.x) + 
                        Math.abs(player.transform.y - transform.y);
        
        if (distance < 5) {
            const moveable = getComponent<MoveableRef>('Moveable');
            if (moveable.canMove()) {
                const path = findPath({ to: player.transform });
                if (path.length > 0) {
                    moveable.move(path[0]);
                }
            }
        }
    });
    
    return null;
}
```

---

### 9.2 实现巡逻AI

**指令格式**：
```
让[角色]在[坐标列表]之间巡逻
```

**参数说明**：
- `角色`：实体名称
- `坐标列表`：巡逻路径点

**后台操作逻辑**：
1. 创建巡逻脚本
2. 维护路径点索引
3. 使用 `Moveable` 移动到下一个点

**示例**：
```
让守卫在[(2,2), (5,2), (5,5), (2,5)]之间巡逻
```

**我会生成**：
```tsx
function PatrolAI({ waypoints }: { waypoints: Position[] }) {
    const { getComponent } = useGameObject();
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        const moveable = getComponent<MoveableRef>('Moveable');
        const target = waypoints[currentIndex];
        
        moveable.move(target).then(() => {
            setCurrentIndex((currentIndex + 1) % waypoints.length);
        });
    }, [currentIndex]);
    
    return null;
}

// 使用
<PatrolAI waypoints={[{x:2,y:2}, {x:5,y:2}, {x:5,y:5}, {x:2,y:5}]} />
```

---

### 9.3 实现随机移动

**指令格式**：
```
让[角色]随机移动，每[秒数]秒一次
```

**参数说明**：
- `角色`：实体名称
- `秒数`：移动间隔

**后台操作逻辑**：
1. 使用定时器
2. 生成随机方向
3. 使用碰撞检测验证
4. 执行移动

**示例**：
```
让小动物随机移动，每 2 秒一次
```

**我会生成**：
```tsx
function RandomMoveAI({ interval = 2000 }: { interval?: number }) {
    const { getComponent, transform } = useGameObject();
    const testCollision = useCollisionTest();
    
    useEffect(() => {
        const timer = setInterval(() => {
            const directions = [[-1,0], [1,0], [0,-1], [0,1]];
            const [dx, dy] = directions[Math.floor(Math.random() * 4)];
            const nextPos = { x: transform.x + dx, y: transform.y + dy };
            
            if (testCollision(nextPos)) {
                getComponent<MoveableRef>('Moveable').move(nextPos);
            }
        }, interval);
        
        return () => clearInterval(timer);
    }, []);
    
    return null;
}
```

---

## 十、视觉效果类

### 10.1 添加粒子效果

**指令格式**：
```
在[位置]生成[数量]个[效果类型]粒子
```

**参数说明**：
- `位置`：生成位置
- `数量`：粒子数量
- `效果类型`：如"火花"、"星星"

**后台操作逻辑**：
1. 使用 `instantiate` 创建多个粒子
2. 随机偏移位置
3. 设置生命周期

**示例**：
```
在(5, 3)生成 10 个星星粒子
```

**我会生成**：
```tsx
const { instantiate } = useScene();

for (let i = 0; i < 10; i++) {
    const offsetX = (Math.random() - 0.5) * 2;
    const offsetY = (Math.random() - 0.5) * 2;
    
    const destroy = instantiate(
        <GameObject x={5 + offsetX} y={3 + offsetY} layer="fx">
            <Sprite {...spriteData.star} opacity={0.8} />
        </GameObject>
    );
    
    setTimeout(destroy, 1000);
}
```

---

### 10.2 添加镜头效果

**指令格式**：
```
让镜头跟随[对象名称]
```

**参数说明**：
- `对象名称`：要跟随的对象

**后台操作逻辑**：
1. 创建或使用 `CameraFollowScript`
2. 每帧更新相机位置

**示例**：
```
让镜头跟随玩家
```

**我会生成**：
```tsx
// 在 Player 实体中添加
<CameraFollowScript />
```

---

### 10.3 调整渲染层级

**指令格式**：
```
让[对象]显示在[层级名称]层
```

**参数说明**：
- `对象`：实体名称
- `层级名称`：ground, obstacle, character, fx 等

**后台操作逻辑**：
1. 设置 GameObject 的 `layer` 属性
2. 自动计算 Z 轴位置

**示例**：
```
让特效显示在 fx 层
```

**我会生成**：
```tsx
<GameObject layer="fx" {...props}>
    {children}
</GameObject>
```

---

## 十一、音效管理类

### 11.1 播放音效

**指令格式**：
```
播放[音效名称]音效
```

**参数说明**：
- `音效名称`：在 soundData.ts 中定义的音效

**后台操作逻辑**：
1. 使用 `Sound` 组件或 `useAsset`
2. 播放音频

**示例**：
```
播放脚步音效
```

**我会生成**：
```tsx
<Sound {...soundData.footstep} />

// 或程序化播放
const audio = useAsset(soundData.footstep.src) as HTMLAudioElement;
audio.play();
```

---

### 11.2 循环播放背景音乐

**指令格式**：
```
在[场景名称]播放循环背景音乐[音乐名称]
```

**参数说明**：
- `场景名称`：目标场景
- `音乐名称`：音乐文件名

**后台操作逻辑**：
1. 监听 `scene-ready` 事件
2. 播放音频并设置 loop
3. 在 `scene-exit` 时停止

**示例**：
```
在办公室场景播放循环背景音乐 office_bgm
```

**我会生成**：
```tsx
useGameEvent<SceneReadyEvent>('scene-ready', (sceneId) => {
    if (sceneId === 'office') {
        const audio = useAsset('./assets/sfx/office_bgm.mp3') as HTMLAudioElement;
        audio.loop = true;
        audio.play();
    }
});
```

---

### 11.3 添加音效资源

**指令格式**：
```
添加音效[音效名称]，文件路径[路径]
```

**参数说明**：
- `音效名称`：音效标识符
- `路径`：音频文件路径

**后台操作逻辑**：
1. 在 `soundData.ts` 添加配置
2. 在 `App.tsx` 的 urls 中包含

**示例**：
```
添加音效 explosion，文件路径 ./assets/sfx/explosion.wav
```

**我会生成**：
```tsx
// soundData.ts
export default {
    explosion: {
        src: './assets/sfx/explosion.wav',
    },
};
```

---

## 十二、UI 元素类

### 12.1 显示文本信息

**指令格式**：
```
在屏幕[位置]显示文本"[内容]"
```

**参数说明**：
- `位置`：如"左上角"、"中央"
- `内容`：要显示的文本

**后台操作逻辑**：
1. 使用 `HtmlOverlay` 组件
2. 设置样式和位置

**示例**：
```
在屏幕中央显示文本"游戏开始"
```

**我会生成**：
```tsx
<HtmlOverlay center>
    <div style={{ fontSize: '32px', color: 'white' }}>
        游戏开始
    </div>
</HtmlOverlay>
```

---

### 12.2 显示对话框

**指令格式**：
```
显示对话框，说话者[名称]，内容"[对话]"
```

**参数说明**：
- `名称`：说话者名字
- `对话`：对话内容

**后台操作逻辑**：
1. 创建对话框组件
2. 使用状态控制显示
3. 添加关闭按钮

**示例**：
```
显示对话框，说话者老板，内容"你被解雇了！"
```

**我会生成**：
```tsx
function DialogBox({ speaker, text, onClose }: Props) {
    return (
        <HtmlOverlay center>
            <div className="dialog-box">
                <div className="speaker">{speaker}</div>
                <div className="text">{text}</div>
                <button onClick={onClose}>确定</button>
            </div>
        </HtmlOverlay>
    );
}
```

---

### 12.3 显示分数UI

**指令格式**：
```
在[位置]显示分数，实时更新
```

**参数说明**：
- `位置`：UI 位置

**后台操作逻辑**：
1. 使用 `getGameState` 读取分数
2. 使用 `useGameEvent` 监听变化
3. 自动更新显示

**示例**：
```
在右上角显示分数，实时更新
```

**我会生成**：
```tsx
function ScoreDisplay() {
    const { getGameState } = useGame();
    const [score, setScore] = useState(0);
    
    useGameEvent('score-changed', () => {
        setScore(getGameState('score'));
    });
    
    return (
        <HtmlOverlay>
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
                得分: {score}
            </div>
        </HtmlOverlay>
    );
}
```

---

## 📝 使用示例

### 完整案例：创建带AI的敌人

**您说**：
```
创建僵尸敌人，可以移动，有 50 点生命值，使用 zombie 精灵，有 idle 和 walk 动画，
追踪玩家，当距离小于 6 时开始追击，碰到玩家时扣除玩家 10 点生命值
```

**我会生成**：

```tsx
// src/entities/Zombie.tsx
import React from 'react';
import Collider from '../@core/Collider';
import GameObject, { GameObjectProps } from '../@core/GameObject';
import Moveable from '../@core/Moveable';
import Health from '../@core/Health';
import Sprite from '../@core/Sprite';
import useGameLoop from '../@core/useGameLoop';
import useGameObject from '../@core/useGameObject';
import useGameObjectEvent from '../@core/useGameObjectEvent';
import useGame from '../@core/useGame';
import usePathfinding from '../@core/usePathfinding';
import CharacterScript from '../components/CharacterScript';
import spriteData from '../spriteData';
import { HealthRef } from '../@core/Health';
import { MoveableRef } from '../@core/Moveable';
import { CollisionEvent } from '../@core/Collider';

function ZombieAI() {
    const { getComponent, transform } = useGameObject();
    const { findGameObjectByName } = useGame();
    const findPath = usePathfinding();
    
    // AI 追踪逻辑
    useGameLoop(() => {
        const player = findGameObjectByName('player');
        if (!player) return;
        
        const distance = Math.abs(player.transform.x - transform.x) + 
                        Math.abs(player.transform.y - transform.y);
        
        if (distance < 6) {
            const moveable = getComponent<MoveableRef>('Moveable');
            if (moveable.canMove()) {
                const path = findPath({ to: player.transform });
                if (path.length > 0) {
                    moveable.move(path[0]);
                }
            }
        }
    });
    
    // 碰撞伤害逻辑
    useGameObjectEvent<CollisionEvent>('collision', (ref) => {
        if (ref.name === 'player') {
            const playerHealth = ref.getComponent<HealthRef>('Health');
            playerHealth?.takeDamage(10);
        }
    });
    
    return null;
}

export default function Zombie(props: GameObjectProps) {
    return (
        <GameObject name="zombie" displayName="僵尸" layer="character" {...props}>
            <Moveable />
            <Collider />
            <Health maxHp={50} />
            <CharacterScript>
                <Sprite {...spriteData.zombie} />
            </CharacterScript>
            <ZombieAI />
        </GameObject>
    );
}
```

---

## 🔄 指令组合使用

您可以组合多个指令来表达复杂需求，例如：

```
创建宝箱，可以交互，交互后播放音效 open_chest，
生成 5 个金币粒子，给玩家加 50 分，然后消失
```

我会理解这是一个复合指令，并生成完整的实现代码。

---

## 📌 注意事项

1. **保持指令清晰**：尽量使用文档中的标准格式
2. **提供必要参数**：坐标、名称、数值等关键信息
3. **可以自然表达**：不必严格按照格式，我会理解意图
4. **可以组合指令**：一次性描述多个相关功能

---

**版本**: 1.0  
**最后更新**: 2026-01-07  
**适用项目**: R3F 2D Game Demo
