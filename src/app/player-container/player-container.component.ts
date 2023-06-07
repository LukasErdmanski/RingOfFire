import { Component, ElementRef, Input, AfterViewInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { Game } from 'src/models/game';

@Component({
  selector: 'app-player-container',
  templateUrl: './player-container.component.html',
  styleUrls: ['./player-container.component.scss'],
})
export class PlayerContainerComponent implements AfterViewInit, OnChanges {
  @Input() game!: Game;
  @Input() currentPlayer!: number;
  @Input() playerCount!: number;
  @ViewChild('playersContainer', { static: false }) playersContainer!: ElementRef;
  scrollArrowsVisable: boolean = false;

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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setScrollArrowsVisibility();
      this.scrollToCurrentPlayer();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentPlayer']) {
      const cur: number = changes['currentPlayer'].currentValue;
      const prev: number | undefined = changes['currentPlayer'].previousValue;
      if (cur != prev) this.scrollToCurrentPlayer();
    }

    if (changes['playerCount']) {
      const cur: number = changes['playerCount'].currentValue;
      const prev: number | undefined = changes['playerCount'].previousValue;
      if (cur != prev)
        setTimeout(() => {
          this.setScrollArrowsVisibility();
        });
    }
  }

  setScrollArrowsVisibility(): void {
    if (this.playersContainer && this.playersContainer.nativeElement) {
      const playersContainerElement: HTMLElement = this.playersContainer.nativeElement;
      this.scrollArrowsVisable = playersContainerElement.scrollWidth + 2 + 2 > window.innerWidth;
    }
  }

  scrollByPlayerCard(plusOrMinus: number): void {
    if (this.playersContainer && this.playersContainer.nativeElement) {
      const playersContainerElement: HTMLElement = this.playersContainer.nativeElement;

      let restOf82Division = playersContainerElement.clientWidth % 82;
      let amountToScrollBackWhenScrollbarAtTheEnd = 82 - restOf82Division;

      if (plusOrMinus == -1) {
        if (this.isScrolledToEnd()) {
          playersContainerElement.scrollBy(-amountToScrollBackWhenScrollbarAtTheEnd, 0);
        } else playersContainerElement.scrollBy(-82, 0);
      } else playersContainerElement.scrollBy(82, 0);
    }
  }

  isScrolledToEnd(): boolean {
    const playersContainerElement: HTMLElement = this.playersContainer.nativeElement;
    const currentScrollWidth = Math.ceil(playersContainerElement.scrollLeft + playersContainerElement.clientWidth);
    const maxScrollWidth = playersContainerElement.scrollWidth;
    return currentScrollWidth == maxScrollWidth;
  }

  scrollToCurrentPlayer(): void {
    if (this.playersContainer && this.playersContainer.nativeElement) {
      const playersContainerElement: HTMLElement = this.playersContainer.nativeElement;
      const playersBarElement = playersContainerElement.children[0] as HTMLElement; // Zugriff auf das 'players-bar' Element
      const playerElement = playersBarElement.children[this.currentPlayer] as HTMLElement; // Zugriff auf das gewünschte 'player' Element

      if (playerElement) {
        let x = playerElement.offsetLeft - 41;
        playersContainerElement.scrollTo(x, 0);
      }
    }
  }
}
