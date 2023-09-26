import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotateDeviceInfoComponent } from './rotate-device-info.component';

describe('RotateDeviceInfoComponent', () => {
  let component: RotateDeviceInfoComponent;
  let fixture: ComponentFixture<RotateDeviceInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RotateDeviceInfoComponent]
    });
    fixture = TestBed.createComponent(RotateDeviceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
