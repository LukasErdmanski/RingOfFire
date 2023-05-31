/* Analog wie bei ElPoloLoco hier werden Modelle angelegt. Unterschied: Properties werden validiert mittels Typisierung. */
/* Man schreibt export vor class, damit diese woanders verwendet werden kann. */
/* Für die einzelnen Properties der Klasse muss der Visibilty Parameter eingestellt werden. */
export class Game {
  /* Initilisierung von Game Objekt Properties. */
  public players: string[] = [];
  public stack: string[] = [];
  public playedCards: string[] = [];
  public currentPlayer: number = 0;

  constructor() {
    /* Fügt 52 Karten von 4 Kartensroten in 'stack' array hinzu. */
    for (let i = 1; i < 14; i++) {
      this.stack.push('spade_' + i);
      this.stack.push('hearts_' + i);
      this.stack.push('clubs_' + i);
      this.stack.push('diamonds_' + i);
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
}
