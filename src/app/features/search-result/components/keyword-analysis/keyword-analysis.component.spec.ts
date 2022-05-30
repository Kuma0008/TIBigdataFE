import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordAnalysisComponent } from './keyword-analysis.component';

describe('KeywordAnalysisComponent', () => {
  let component: KeywordAnalysisComponent;
  let fixture: ComponentFixture<KeywordAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeywordAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeywordAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
