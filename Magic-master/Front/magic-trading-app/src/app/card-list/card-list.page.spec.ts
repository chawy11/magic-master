import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardListPage } from './card-list.page';

describe('CardListPage', () => {
  let component: CardListPage;
  let fixture: ComponentFixture<CardListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CardListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
