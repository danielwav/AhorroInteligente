import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaMeta } from './nueva-meta';

describe('NuevaMeta', () => {
  let component: NuevaMeta;
  let fixture: ComponentFixture<NuevaMeta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaMeta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevaMeta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
