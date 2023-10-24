import { ComponentFixture, TestBed } from '@angular/core/testing';

import DialogIncludeLastGamePlayersComponent from './dialog-include-last-game-players.component';

describe('DialogIncludeLastGamePlayersComponent', () => {
    let component: DialogIncludeLastGamePlayersComponent;
    let fixture: ComponentFixture<DialogIncludeLastGamePlayersComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DialogIncludeLastGamePlayersComponent],
        });
        fixture = TestBed.createComponent(DialogIncludeLastGamePlayersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
