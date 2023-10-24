import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogJoinGameComponent } from './dialog-join-game.component';

describe('DialogConfirmJoinGameComponent', () => {
    let component: DialogJoinGameComponent;
    let fixture: ComponentFixture<DialogJoinGameComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DialogJoinGameComponent],
        });
        fixture = TestBed.createComponent(DialogJoinGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
