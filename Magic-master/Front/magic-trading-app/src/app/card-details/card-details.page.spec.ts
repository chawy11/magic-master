import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardDetailsPage } from './card-details.page';

describe('CardDetailsPage', () => {
  let component: CardDetailsPage;
  let fixture: ComponentFixture<CardDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CardDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
