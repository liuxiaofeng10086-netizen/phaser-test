import React from 'react';
import Collider from '../@core/Collider';
import GameObject, { GameObjectProps } from '../@core/GameObject';
import Health from '../@core/Health';
import Moveable from '../@core/Moveable';
import Sprite from '../@core/Sprite';
import CharacterScript from '../components/CharacterScript';
import ZombieAI from '../components/ZombieAI';
import spriteData from '../spriteData';

interface ZombieProps extends GameObjectProps {
    maxHp?: number;
    chaseDistance?: number;
}

/**
 * 僵尸敌人实体
 * - 可移动
 * - 有 50 点生命值（可自定义）
 * - 有 idle 和 walk 动画
 * - 追踪玩家（距离小于 chaseDistance 时）
 */
export default function Zombie({ maxHp = 50, chaseDistance = 3, ...props }: ZombieProps) {
    return (
        <GameObject name="zombie" displayName="僵尸" layer="character" {...props}>
            <Moveable />
            <Collider />
            <Health maxHp={maxHp} />
            <CharacterScript>
                <Sprite {...spriteData.zombie} />
            </CharacterScript>
            <ZombieAI chaseDistance={chaseDistance} />
        </GameObject>
    );
}
