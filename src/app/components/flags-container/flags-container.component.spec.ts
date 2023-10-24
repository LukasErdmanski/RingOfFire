import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagsContainerComponent } from './flags-container.component';

describe('FlagsContainerComponent', () => {
  let component: FlagsContainerComponent;
  let fixture: ComponentFixture<FlagsContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlagsContainerComponent]
    });
    fixture = TestBed.createComponent(FlagsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
