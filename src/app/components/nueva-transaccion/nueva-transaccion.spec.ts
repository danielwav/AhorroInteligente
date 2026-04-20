import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaTransaccion } from './nueva-transaccion';

describe('NuevaTransaccion', () => {
  let component: NuevaTransaccion;
  let fixture: ComponentFixture<NuevaTransaccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaTransaccion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevaTransaccion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
