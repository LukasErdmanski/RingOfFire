import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddEditPlayerComponent } from './dialog-add-edit-player.component';

describe('DialogAddEditPlayerComponent', () => {
    let component: DialogAddEditPlayerComponent;
    let fixture: ComponentFixture<DialogAddEditPlayerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DialogAddEditPlayerComponent],
        });
        fixture = TestBed.createComponent(DialogAddEditPlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
