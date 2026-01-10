import React from 'react';
import Collider from '../@core/Collider';
import GameObject, { GameObjectProps } from '../@core/GameObject';
import Health from '../@core/Health';
import Interactable from '../@core/Interactable';
import Moveable from '../@core/Moveable';
import Sprite from '../@core/Sprite';
import CameraFollowScript from '../components/CameraFollowScript';
import CharacterScript from '../components/CharacterScript';
import PlayerScript from '../components/PlayerScript';
import spriteData from '../spriteData';

export default function Player(props: GameObjectProps) {
    return (
        <GameObject name="player" displayName="Player" layer="character" {...props}>
            <Moveable />
            <Interactable />
            <Collider />
            <Health maxHp={100} />
            <CharacterScript>
                <Sprite {...spriteData.player} />
            </CharacterScript>
            <CameraFollowScript />
            <PlayerScript />
        </GameObject>
    );
}
