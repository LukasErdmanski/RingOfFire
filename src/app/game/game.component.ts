/* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
import { Component, OnInit } from '@angular/core';

import { DialogAddEditPlayerComponent } from '../dialog-add-edit-player/dialog-add-edit-player.component';
import { DialogData } from '../dialog-add-edit-player/dialog-data.interface';

import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
    private routeParamsSubscription?: Subscription;

    // cardsRightToBottomStack: any[] = [0, 1, 2, 3];

    // TODO: VIELLEICHT WIRD es hier global nicht benörigt, man würde es aus dem subRouteParams direkt in GameService übergeben
    // TODO: Vielleicht wird es gebraucth für den Vergleich alte Game ID / neue Game Id bei Starten New Game in gleichem Browser Tab
    routeGameId: string = '';

    /* ================================================================================================================================= */
    /* ================================================================================================================================= */
    /* ==============================  AB 22.09.2023 NEU ANFANG  ======================================================================= */
    /* Es wird eine neuer Service, 'route' vom Typ 'ActivatedRoute' injectet und man man die game 'id' aus der Route rauslesen. */
    constructor(public dialog: MatDialog, private route: ActivatedRoute, private router: Router, private gameService: GameService) {}

    /* Führt 'newGame' nach der Initialisierung von Game Objekt aus. */
    ngOnInit() {
        debugger;

        this.subRouteParams();
        // console.log('_____________THIS IS CURRNE GAME________ ', this.game);
        debugger;

        this.startSubGameInGameService();
        // this.zzzzzz();
        debugger;
    }

    ngOnChanges() {}

    ngOnDestroy() {
        debugger;
        this.routeParamsSubscription?.unsubscribe();
        debugger;
    }

    subRouteParams(): void {
        this.routeParamsSubscription = this.route.params.subscribe((params) => {
            // debugger;
            /* 'params' kann noch andere Paramter der Route beinhaltet, so fokussiert man sich nur auf die Property 'id' */
            console.log('GAME COMPONENT / DIE ID AUS ROUTE: ', params['id']);
            this.routeGameId = params['id'];

            // debugger;
            // Überprüfen, ob routeGameId gesetzt ist, bevor subscribeGame aufgerufen wird.
            if (this.routeGameId) {
                debugger;

                /* ZUM CHECKEN OB MAN gameID, und game.Id braucht und ob man updaten muss */
                // this.gameService.gameId = this.routeGameId;
                this.gameService.game.id = this.routeGameId;
                // this.gameService.updateGameDoc();
            }
        });
    }

    get game() {
        return this.gameService.game;
    }

    async startSubGameInGameService() {
        debugger;
        try {
            const game = await this.gameService.subcribeGameDoc(); // Warte, bis das Promise aufgelöst wird.
            console.log('GAME COMPONENT / startSubGameInGameService Empfangenes Spiel:', game);
            if (this.game.gameOver) {
                this.router.navigate(['/game-over-screen']);
            }
        } catch (err) {
            console.error('Fehler beim Abonnieren des Spiels:', err);
        }
    }

    get firstDataReceived() {
        return this.gameService.firstDataReceived;
    }

    takeCard() {
        // Die Prüfung erforderlich, damit nur alle 1,5 Sekunden auf die letzte Karte des Stappels gedrückt werden kann, nicht früher.
        if (!this.game.pickCardAnimation) {
            /* Mit pop() wird das letzte Element aus dem Array entfernt und returnt. Es wird unter 'currentCard' gespeichert. */
            this.game.currentCard = this.game.stack.pop()!;

            /* Reduziert das Array 'cardsRightToBottomStack' wenn nur <= 4 Karten übrig sind, 
      damit diese reduziert richtig nach jedem Zug dargestellt sind, 
      wenn 48 Karten von unterem Stapel bereits gezogen wurden. */
            if (this.game.stack.length <= 3) this.game.cardsRightToBottomStack.splice(this.game.cardsRightToBottomStack.length - 1, 1);

            this.game.pickCardAnimation = true;

            /* Erhöhen / Ändern des aktuellen Spielers nach jedem Kartenzug.
      durch Zirkulation (durch Modulo-Division). 
      Aber erst wenn ein Pool an Spielern vorhanden ist, da wenn man vorher erst einige Karten ziehen würde
      und erst dann Spieler adden würde, würde die stylische Anzeige für aktuellen Spieler nicht funktionieren. */
            if (this.game.players.length > 0) {
                this.game.currentPlayer++;
                console.log(this.game.currentPlayer);
                this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
            }

            /* Speichern des Game Zustandes / Aktualisieren der Firebase DB nach Kartenzug */
            // this.gameService.saveGame(this.game);
            this.gameService.updateGameDoc(this.game);

            setTimeout(() => {
                // Hinzufügen der aktuell gezogenen Karte zum Stapel bereits gespielten Karten, erst nachdem die Animation zu Ende ist (also pickCardAnimation = false).
                this.game.playedCards.push(this.game.currentCard);
                // 'pickCardAnimation' wird auf 'false' resetet, damit die 'pick-card-animation' erneut abgespielt werden kann, bei jedem Kartenzugund nicht nur Einmal.
                this.game.pickCardAnimation = false;
                /* Speichern des Game Zustandes / Aktualisieren der Firebase DB des aktuellen Spielers und Hinzufügen der gezogenen Karte zum oberen Kartenstapel */

                if (this.game.stack.length == 0) {
                    debugger;
                    this.game.gameOver = true;
                }

                this.gameService.updateGameDoc(this.game);
            }, 1000);
        }

        console.log('GAME UPDATE: ', this.game);
    }

    /* Angular Material Component from https://material.angular.io/components/dialog/overview */
    openDialog(mode: 'add' | 'edit', playerId?: number): void {
        const dialogRef = this.dialog.open(DialogAddEditPlayerComponent, { data: { mode: mode, playerId: playerId } });

        dialogRef.afterClosed().subscribe((data: { name?: string; avatar?: string; delete?: boolean } | null) => {
            if (!data) return; // Wenn data null ist (Cancel geklickt), dann einfach zurückkehren

            if (data.delete) {
                this.deletePlayer(playerId!);
            } else if (mode === 'edit' && data.name && data.avatar) {
                this.editPlayer(playerId!, data.name, data.avatar);
            } else if (mode === 'add' && data.name && data.avatar && data.name.trim().length > 0) {
                this.addPlayer(data.name, data.avatar);
            }

            this.gameService.updateGameDoc(this.game);
        });
    }

    deletePlayer(playerId: number): void {
        this.game.players.splice(playerId, 1);
        this.game.player_images.splice(playerId, 1);
    }

    editPlayer(playerId: number, name: string, avatar: string): void {
        if (this.game.players[playerId] !== name || this.game.player_images[playerId] !== avatar) {
            this.game.players[playerId] = name;
            this.game.player_images[playerId] = avatar;
        }
    }

    addPlayer(name: string, avatar: string): void {
        this.game.players.push(name);
        this.game.player_images.push(avatar);
    }

    /**
     * Track by function for ngFor directive.
     *
     * This function takes the index and the item itself as parameters and returns
     * a unique identifier for the item. In this case, we are simply using the index
     * of the item as the unique identifier. This helps Angular to optimize the rendering
     * of items in a list by only re-rendering the items that have changed.
     *
     * @param {number} index - The index of the current item in the list.
     * @param {any} item - The item itself. We don't use it in this case, but it's included to conform with Angular's expected signature for trackBy functions.
     * @returns {number} - The unique identifier for the item. In this case, it's the index of the item in the list.
     */
    trackByFn(index: number, item: any): number {
        return index;
    }

    ///////////////////////////////////////////////////// TO CHECK 29.09.2023 OB NOCH WEITER BENÖTIGT ///////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //TODO: 29.09 SPÄTER WAHRSCHEINLICH TO DELETE / NICHT MEHR GEBRAUCHT
    firstGameUpdate: boolean = false;

    //TODO: 29.09 SPÄTER WAHRSCHEINLICH TO DELETE / NICHT MEHR GEBRAUCHT
    lastGameId: string = '';

    //TODO: 29.09 SPÄTER WAHRSCHEINLICH TO DELETE / NICHT MEHR GEBRAUCHT
    // initialDelayGameOverStartBtn: any = undefined;

    //TODO: 29.09 SPÄTER WAHRSCHEINLICH TO DELETE / NICHT MEHR GEBRAUCHT
    resetGameState(): void {
        this.firstGameUpdate = false;
        // this.initialDelayGameOverStartBtn = undefined;
        this.lastGameId = this.game.id;
    }

    //TODO: 29.09 SPÄTER WAHRSCHEINLICH TO DELETE / NICHT MEHR GEBRAUCHT
    initializeGameState() {
        if (!this.firstGameUpdate) {
            this.firstGameUpdate = true;
            if (this.game.gameOver) {
                // this.initialDelayGameOverStartBtn = false;
            } else {
                // this.initialDelayGameOverStartBtn = true;
            }
        }
    }
}
