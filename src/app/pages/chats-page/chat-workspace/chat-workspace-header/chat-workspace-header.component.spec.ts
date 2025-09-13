import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWorkspaceHeaderComponent } from './chat-workspace-header.component';

describe('ChatWorkspaceHeaderComponent', () => {
  let component: ChatWorkspaceHeaderComponent;
  let fixture: ComponentFixture<ChatWorkspaceHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatWorkspaceHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatWorkspaceHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
