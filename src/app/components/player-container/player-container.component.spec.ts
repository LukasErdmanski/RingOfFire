import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerContainerComponent } from './player-container.component';

describe('PlayerContainerComponent', () => {
  let component: PlayerContainerComponent;
  let fixture: ComponentFixture<PlayerContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerContainerComponent]
    });
    fixture = TestBed.createComponent(PlayerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
