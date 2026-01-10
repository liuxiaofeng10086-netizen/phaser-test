import { css } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { HealthChangeEvent, HealthRef } from '../@core/Health';
import useGame from '../@core/useGame';

interface HealthBarProps {
    /** 要监听的目标对象名称 */
    targetName?: string;
    /** 血条高度（宽度自动按图片比例计算） */
    height?: number;
}

const styles = {
    /**
     * 容器：固定在屏幕左下角
     */
    container: (height: number) => css`
        position: fixed;
        bottom: 20px;
        left: 20px;
        height: ${height}px;
        pointer-events: none;
    `,
    /**
     * 图片包装器：相对定位，用于叠加两张图片
     */
    wrapper: css`
        position: relative;
        height: 100%;
    `,
    /**
     * 下层：空血条底图
     */
    emptyBar: (height: number) => css`
        display: block;
        height: ${height}px;
        width: auto;
    `,
    /**
     * 上层：满血条进度图
     * 使用 clip-path 从左向右裁剪，根据血量百分比显示
     */
    fullBar: (percent: number, height: number) => css`
        position: absolute;
        top: 0;
        left: 0;
        height: ${height}px;
        width: auto;
        /* 使用 clip-path 实现进度效果：从左到右裁剪 */
        clip-path: inset(0 ${100 - percent}% 0 0);
        transition: clip-path 0.2s ease-out;
    `,
    /**
     * 血量数值文字
     */
    text: css`
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 12px;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        white-space: nowrap;
    `,
};

/**
 * 血条 UI 组件
 *
 * 实现原理：
 * - 使用容器包裹两张图片
 * - 下层显示 health-empty.png（底图）
 * - 上层显示 health-full.png（进度图）
 * - 使用 CSS clip-path 根据 hp/maxHp 比例动态裁剪上层图片
 *
 * 观察者模式：
 * - 通过事件订阅机制实现 UI 与数据的自动同步
 * - 监听目标对象的 'health-change' 事件
 */
export default function HealthBar({
    targetName = 'player',
    height = 20,
}: HealthBarProps) {
    const { findGameObjectByName } = useGame();
    const [hp, setHp] = useState(100);
    const [maxHp, setMaxHp] = useState(100);

    useEffect(() => {
        // 查找目标对象
        const target = findGameObjectByName(targetName);
        if (!target) return undefined;

        // 获取初始生命值
        const health = target.getComponent<HealthRef>('Health');
        if (health) {
            setHp(health.hp);
            setMaxHp(health.maxHp);
        }

        // 订阅生命值变化事件（观察者模式）
        const unsubscribe = target.subscribe<HealthChangeEvent>('health-change', data => {
            setHp(data.hp);
            setMaxHp(data.maxHp);
        });

        // 清理：取消订阅
        return () => {
            unsubscribe();
        };
    }, [findGameObjectByName, targetName]);

    // 计算血量百分比
    const percent = maxHp > 0 ? (hp / maxHp) * 100 : 0;

    return (
        <div css={styles.container(height)}>
            {/* 图片包装器 */}
            <div css={styles.wrapper}>
                {/* 下层：空血条底图 */}
                <img
                    src="./assets/ui/health-empty.png"
                    alt="health background"
                    css={styles.emptyBar(height)}
                />
                {/* 上层：满血条进度图，使用 clip-path 裁剪 */}
                <img
                    src="./assets/ui/health-full.png"
                    alt="health bar"
                    css={styles.fullBar(percent, height)}
                />
                {/* 血量数值 */}
                <div css={styles.text}>
                    {hp} / {maxHp}
                </div>
            </div>
        </div>
    );
}
