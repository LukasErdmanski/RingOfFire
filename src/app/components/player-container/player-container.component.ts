import { Component, ElementRef, Input, AfterViewInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { GameService } from '../../services/game.service';
import { DialogEditPlayerComponent } from '../dialog-edit-player/dialog-edit-player.component';

/**
 * Manages the display and interaction of players within the game.
 */
@Component({
    selector: 'app-player-container',
    templateUrl: './player-container.component.html',
    styleUrls: ['./player-container.component.scss'],
})
export class PlayerContainerComponent implements AfterViewInit, OnChanges {
    /** Represents the selected player's avatar. */
    public selectedAvatar!: string;

    /** The game object representing the current game. */
    @Input() public game!: Game;

    /** The index of the currently active player. */
    @Input() public currentPlayer!: number;

    /** The total count of players in the game. */
    @Input() public playerCount!: number;

    /** A reference to the container element of the players. */
    @ViewChild('playersContainer', { static: false }) private playersContainer!: ElementRef;

    /** Determines if the scroll arrows should be visible. */
    public scrollArrowsVisable: boolean = false;

    /** Determines if the players slide container is hidden or visible. */
    public playersSlideContainerHidden: boolean = false;

    /**
     * Initializes a new instance of the `PlayerContainerComponent` class.
     *
     * @param dialog - A service for opening material dialogs.
     * @param gameService - A service related to the game's operations.
     */
    constructor(public dialog: MatDialog, private gameService: GameService) {}

    /**
     * Lifecycle method that is called after the view is initialized.
     * It sets the visibility of the scroll arrows and ensures the current player is visible.
     */
    ngAfterViewInit(): void {
        setTimeout(() => {
            this.setScrollArrowsVisibility();
            this.scrollToCurrentPlayer();
        });
    }

    /**
     * Lifecycle method called whenever data-bound input properties change.
     * It handles changes to player count and current player index.
     *
     * @param changes - An object that contains the current and previous property values.
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['playerCount']) this.handlePlayerCountChange(changes);
        if (changes['currentPlayer']) this.handleCurrentPlayerChange(changes);
    }

    /**
     * Utility method to handle change in player count.
     *
     * @param change - The change object for the playerCount property.
     */
    private handlePlayerCountChange(changes: SimpleChanges): void {
        const cur: number = changes['playerCount'].currentValue;
        const prev: number | undefined = changes['playerCount'].previousValue;
        if (cur != prev)
            setTimeout(() => {
                this.setScrollArrowsVisibility();
            });
    }

    /**
     * Utility method to handle change in the current player index.
     *
     * @param change - The change object for the currentPlayer property.
     */
    private handleCurrentPlayerChange(changes: SimpleChanges): void {
        if (changes['currentPlayer']) {
            const cur: number = changes['currentPlayer'].currentValue;
            const prev: number | undefined = changes['currentPlayer'].previousValue;
            if (cur != prev) this.scrollToCurrentPlayer();
        }
    }

    /**
     * Track by function for ngFor directive.
     * This function takes the index and the item itself as parameters and returns
     * a unique identifier for the item. In this case, we are simply using the index
     * of the item as the unique identifier. This helps Angular to optimize the rendering
     * of items in a list by only re-rendering the items that have changed.
     *
     * @param index - The index of the item.
     * @param item - The item itself.
     * @returns {number} The index of the item.
     */
    public trackByFn(index: number, item: any): number {
        return index;
    }

    /**
     * Toggles the visibility of the players slide container.
     */
    public moveDownTop(): void {
        this.playersSlideContainerHidden = !this.playersSlideContainerHidden;
    }

    /** Determines and sets if the scroll arrows should be visible based on container width. */
    public setScrollArrowsVisibility(): void {
        if (this.playersContainer && this.playersContainer.nativeElement) {
            const playersContainerElement: HTMLElement = this.playersContainer.nativeElement;
            this.scrollArrowsVisable = playersContainerElement.scrollWidth + 1 + 32 + 1 > window.innerWidth;
        }
    }

    /**
     * Scrolls to the currently active player within the container.
     */
    private scrollToCurrentPlayer(): void {
        if (this.playersContainer && this.playersContainer.nativeElement) {
            const playersContainerElement: HTMLElement = this.playersContainer.nativeElement;
            const playersBarElement = playersContainerElement.children[0] as HTMLElement; // Zugriff auf das 'players-bar' Element
            const playerElement = playersBarElement.children[this.currentPlayer] as HTMLElement; // Zugriff auf das gewünschte 'player' Element

            if (playerElement) {
                let x = playerElement.offsetLeft - 59;
                playersContainerElement.scrollTo(x, 0);
            }
        }
    }

    /**
     * Scrolls the players container by one player card.
     *
     * @param plusOrMinus - Direction of scrolling. -1 for left and 1 for right.
     */
    public scrollByPlayerCard(plusOrMinus: number): void {
        if (this.playersContainer && this.playersContainer.nativeElement) {
            const playersContainerElement: HTMLElement = this.playersContainer.nativeElement;

            let restOf86Division = playersContainerElement.clientWidth % 86;
            let amountToScrollBackWhenScrollbarAtTheEnd = 86 - restOf86Division;

            if (plusOrMinus == -1) {
                if (this.isScrolledToEnd()) {
                    playersContainerElement.scrollBy(-amountToScrollBackWhenScrollbarAtTheEnd, 0);
                } else playersContainerElement.scrollBy(-86, 0);
            } else playersContainerElement.scrollBy(86, 0);
        }
    }

    /**
     * Checks if the container has been scrolled to its end.
     *
     * @returns {boolean} - Returns `true` if the container is scrolled to its end, otherwise `false`.
     */
    private isScrolledToEnd(): boolean {
        const playersContainerElement: HTMLElement = this.playersContainer.nativeElement;
        const currentScrollWidth = Math.ceil(playersContainerElement.scrollLeft + playersContainerElement.clientWidth);
        const maxScrollWidth = playersContainerElement.scrollWidth;
        return currentScrollWidth == maxScrollWidth;
    }

    /**
     * Opens a dialog to edit the player's details.
     *
     * @param playerId - The ID of the player to be edited.
     */
    public editPlayer(playerId: number): void {
        const dialogRef = this.dialog.open(DialogEditPlayerComponent, { data: { playerId: playerId } });
        dialogRef.afterClosed().subscribe((data: { name?: string; avatar?: string; delete?: boolean } | undefined) => {
            if (data) {
                if (data.delete) {
                    this.deletePlayer(playerId!);
                    this.gameService.updateGameDoc(this.game);
                } else if (this.game.players[playerId] !== data.name || this.game.playerImages[playerId] !== data.avatar) {
                    this.changePlayerNameAvatar(playerId!, data.name!, data.avatar!);
                    this.gameService.updateGameDoc(this.game);
                }
            }
        });
    }

    /**
     * Deletes a player from the game.
     *
     * @param playerId - The ID of the player to be deleted.
     */
    private deletePlayer(playerId: number): void {
        this.game.players.splice(playerId, 1);
        this.game.playerImages.splice(playerId, 1);
    }

    /**
     * Updates a player's name and avatar in the game.
     *
     * @param playerId - The ID of the player to be updated.
     * @param name - New name for the player.
     * @param avatar - New avatar URL for the player.
     */
    private changePlayerNameAvatar(playerId: number, name: string, avatar: string): void {
        this.game.players[playerId] = name;
        this.game.playerImages[playerId] = avatar;
    }
}
