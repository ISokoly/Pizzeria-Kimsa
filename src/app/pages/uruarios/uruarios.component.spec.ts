import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UruariosComponent } from './uruarios.component';

describe('UruariosComponent', () => {
  let component: UruariosComponent;
  let fixture: ComponentFixture<UruariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UruariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UruariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
