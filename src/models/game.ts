/* Analog wie bei ElPoloLoco hier werden Modelle angelegt. Unterschied: Properties werden validiert mittels Typisierung. */
/* Man schreibt export vor class, damit diese woanders verwendet werden kann. */
/* Für die einzelnen Properties der Klasse muss der Visibilty Parameter eingestellt werden. */
export class Game {
    /* Initilisierung von Game Objekt Properties. */
    public id: string = '';
    public players: string[] = [];
    public playerImages: string[] = [];
    public stack: string[] = [];
    public playedCards: string[] = [];
    public cardsRightToBottomStack: number[] = [0, 1, 2, 3];
    public currentPlayer: number = 0;
    /* Ergänzen um diese Props (Animationsvariable und Variable der aktuellen Karte) für Synchronisierung dieser Reaktionen auf anderen Geräten. */
    public pickCardAnimation: boolean = false;
    public currentCard: string = '';
    public gameOver: boolean = false;
    public newGameId: string = '';

    public allProfilesPictures: string[] = ['1.webp', '2.png', 'monkey.png', 'pinguin.svg', 'serious-woman.svg', 'winkboy.svg'];

    constructor() {
        /* Fügt 52 Karten von 4 Kartensroten in 'stack' array hinzu. */
        for (let i = 1; i < 2; i++) {
            this.stack.push('spade_' + i);
            this.stack.push('hearts_' + i);
            this.stack.push('clubs_' + i);
            // this.stack.push('diamonds_' + i);
        }

        this.shuffle(this.stack);
    }

    /* Methode von: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array 
    mischt zufällig alle 52 Spielkarten bei jedem Spiel erneut durch. */
    shuffle(array: string[]) {
        let currentIndex = array.length,
            randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    /* Convert Game Object to Json. */
    public toJson() {
        return {
            id: this.id,
            players: this.players,
            playerImages: this.playerImages,
            stack: this.stack,
            playedCards: this.playedCards,
            cardsRightToBottomStack: this.cardsRightToBottomStack,
            currentPlayer: this.currentPlayer,
            /* Ergänzen um diese Props (Animationsvariable und Variable der aktuellen Karte) für Synchronisierung dieser Reaktionen auf anderen Geräten. */
            pickCardAnimation: this.pickCardAnimation,
            currentCard: this.currentCard,
            gameOver: this.gameOver,
            newGameId: this.newGameId,
        };
    }
}
