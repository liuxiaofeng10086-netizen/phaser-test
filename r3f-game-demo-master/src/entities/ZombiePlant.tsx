import React, { useRef } from 'react';
import Collider from '../@core/Collider';
import GameObject, { GameObjectProps } from '../@core/GameObject';
import Interactable, { InteractionEvent } from '../@core/Interactable';
import Sprite, { SpriteRef } from '../@core/Sprite';
import useGameObject from '../@core/useGameObject';
import useGameObjectEvent from '../@core/useGameObjectEvent';
import waitForMs from '../@core/utils/waitForMs';
import spriteData from '../spriteData';

function ZombiePlantScript() {
    const { getComponent } = useGameObject();
    const interacted = useRef(false);

    useGameObjectEvent<InteractionEvent>('interaction', () => {
        interacted.current = !interacted.current;

        if (interacted.current) {
            getComponent<SpriteRef>('Sprite').setState('zombie-plant-interacted');
        } else {
            getComponent<SpriteRef>('Sprite').setState('zombie-plant');
        }

        return waitForMs(400);
    });

    return null;
}

export default function ZombiePlant(props: GameObjectProps) {
    return (
        <GameObject layer="obstacle" {...props}>
            <Collider />
            <Interactable />
            <Sprite
                {...spriteData.objects}
                state="zombie-plant"
                offset={{ x: 0, y: 0.25 }}
            />
            <ZombiePlantScript />
        </GameObject>
    );
}
