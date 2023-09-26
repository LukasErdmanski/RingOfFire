import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameOverScreenComponent } from './game-over-screen.component';

describe('GameOverScreenComponent', () => {
  let component: GameOverScreenComponent;
  let fixture: ComponentFixture<GameOverScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameOverScreenComponent]
    });
    fixture = TestBed.createComponent(GameOverScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
