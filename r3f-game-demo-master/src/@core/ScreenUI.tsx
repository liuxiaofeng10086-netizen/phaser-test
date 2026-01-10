import { css } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { GameContext } from './Game';
import useGame from './useGame';

interface Props {
    children: React.ReactNode;
}

const styles = {
    container: css`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    `,
};

/**
 * 屏幕级 UI 组件
 * - 使用 React Portal 将 UI 渲染到 body 下的独立 div
 * - UI 固定在屏幕上，不随游戏相机移动
 * - 保持 GameContext 可用，以便订阅游戏事件
 */
export default function ScreenUI({ children }: Props) {
    const gameContextValue = useGame();
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        // 创建 UI 容器元素
        const div = document.createElement('div');
        div.id = 'screen-ui-root';
        document.body.appendChild(div);
        setContainer(div);

        // 清理时移除容器
        return () => {
            document.body.removeChild(div);
        };
    }, []);

    if (!container) return null;

    return ReactDOM.createPortal(
        <div css={styles.container}>
            <GameContext.Provider value={gameContextValue}>
                {children}
            </GameContext.Provider>
        </div>,
        container
    );
}
