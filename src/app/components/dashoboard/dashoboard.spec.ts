import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashoboard } from './dashoboard';

describe('Dashoboard', () => {
  let component: Dashoboard;
  let fixture: ComponentFixture<Dashoboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashoboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashoboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
