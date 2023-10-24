import { Component, Input } from '@angular/core';

/**
 * Represents an individual player in the game.
 *
 * This component displays the player's name, status (whether they're active or not),
 * their associated image, and also the state of the slide container.
 */
@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
})
export class PlayerComponent {
    /**
     * The name of the player.
     * This is assigned in the parent component (e.g., 'game.component.html').
     */
    @Input() public name!: string;

    /**
     * Indicates whether the player is currently active (taking their turn).
     * Controls the presence/activity of the SCSS class 'player-active' in the template.
     */
    @Input() public playerActive: boolean = false;

    /**
     * The image associated with the player.
     * By default, the image is set to '1.webp'.
     */
    @Input() public image: string = '1.webp';

    /**
     * Indicates the state of the players slide container.
     * This is used to control visibility in the UI.
     */
    @Input() public playersSlideContainerHidden: boolean = false;
}
