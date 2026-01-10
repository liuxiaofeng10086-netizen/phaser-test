import { Dispatch, SetStateAction, useState } from 'react';
import useComponentRegistry, { ComponentRef } from './useComponentRegistry';
import useGameObject from './useGameObject';
import { PubSubEvent } from './utils/createPubSub';

// 生命值变化事件
export type HealthChangeEvent = PubSubEvent<
    'health-change',
    { hp: number; maxHp: number }
>;
// 死亡事件
export type DeathEvent = PubSubEvent<'death', void>;
// 受伤事件
export type DamageEvent = PubSubEvent<'damage', { amount: number; remaining: number }>;
// 治愈事件
export type HealEvent = PubSubEvent<'heal', { amount: number; remaining: number }>;

export type HealthRef = ComponentRef<
    'Health',
    {
        hp: number;
        maxHp: number;
        isDead: () => boolean;
        takeDamage: (amount: number) => void;
        heal: (amount: number) => void;
        setHp: Dispatch<SetStateAction<number>>;
    }
>;

interface Props {
    maxHp?: number;
    initialHp?: number;
}

export default function Health({ maxHp = 100, initialHp }: Props) {
    const [hp, setHp] = useState(initialHp ?? maxHp);
    const { publish } = useGameObject();

    useComponentRegistry<HealthRef>('Health', {
        hp,
        maxHp,
        isDead() {
            return hp <= 0;
        },
        takeDamage(amount) {
            const newHp = Math.max(0, hp - amount);
            setHp(newHp);

            // 发布受伤事件
            publish<DamageEvent>('damage', { amount, remaining: newHp });
            // 发布生命值变化事件
            publish<HealthChangeEvent>('health-change', { hp: newHp, maxHp });

            // 如果生命值归零，发布死亡事件
            if (newHp === 0) {
                publish<DeathEvent>('death');
            }
        },
        heal(amount) {
            const newHp = Math.min(maxHp, hp + amount);
            setHp(newHp);

            // 发布治愈事件
            publish<HealEvent>('heal', { amount, remaining: newHp });
            // 发布生命值变化事件
            publish<HealthChangeEvent>('health-change', { hp: newHp, maxHp });
        },
        setHp,
    });

    return null;
}
