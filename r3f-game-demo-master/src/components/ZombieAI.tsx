import { MoveableRef } from '../@core/Moveable';
import useGame from '../@core/useGame';
import useGameLoop from '../@core/useGameLoop';
import useGameObject from '../@core/useGameObject';
import usePathfinding from '../@core/usePathfinding';

interface ZombieAIProps {
    // 开始追击的距离阈值
    chaseDistance?: number;
}

/**
 * 僵尸AI脚本
 * - 当玩家距离小于 chaseDistance 时开始追击
 * - 使用 A* 寻路算法寻找路径
 */
export default function ZombieAI({ chaseDistance = 3 }: ZombieAIProps) {
    const { getComponent, transform } = useGameObject();
    const { findGameObjectByName } = useGame();
    const findPath = usePathfinding();

    useGameLoop(() => {
        // 查找玩家
        const player = findGameObjectByName('player');
        if (!player) return;

        // 计算曼哈顿距离
        const distance =
            Math.abs(player.transform.x - transform.x) +
            Math.abs(player.transform.y - transform.y);

        // 距离小于阈值时追击
        if (distance <= chaseDistance && distance > 0) {
            const moveable = getComponent<MoveableRef>('Moveable');

            // 检查是否可以移动
            if (moveable?.canMove()) {
                try {
                    // 寻找到玩家的路径
                    const path = findPath({ to: player.transform });
                    if (path.length > 0) {
                        // 移动到路径的第一个点
                        moveable.move(path[0]);
                    }
                } catch {
                    // 寻路失败（玩家不可达），忽略
                }
            }
        }
    });

    return null;
}
