import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reserva3Component } from './reserva3.component';

describe('Reserva3Component', () => {
  let component: Reserva3Component;
  let fixture: ComponentFixture<Reserva3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reserva3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reserva3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
