import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleMeta } from './detalle-meta';

describe('DetalleMeta', () => {
  let component: DetalleMeta;
  let fixture: ComponentFixture<DetalleMeta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleMeta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleMeta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
