import { TestBed } from '@angular/core/testing';

import { GameService } from '../services/game.service'; // Pfad angepasst

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
