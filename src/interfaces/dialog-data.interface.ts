/**
 * Interface representing the data structure for dialog interactions.
 *
 * This is used to pass specific data to the dialog components, ensuring that
 * the correct player details are accessible and modifiable within the dialog.
 *
 * @property {number} playerId - The unique identifier of a player. It is used to fetch and/or modify
 *                                the player's data within the dialog.
 */
export interface DialogData {
    playerId: number;
}
