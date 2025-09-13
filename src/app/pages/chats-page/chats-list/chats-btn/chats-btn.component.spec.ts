import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatsBtnComponent } from './chats-btn.component';

describe('ChatsBtnComponent', () => {
  let component: ChatsBtnComponent;
  let fixture: ComponentFixture<ChatsBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatsBtnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatsBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
