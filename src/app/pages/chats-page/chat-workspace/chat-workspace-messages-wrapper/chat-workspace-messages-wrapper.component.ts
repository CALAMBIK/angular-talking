import { firstValueFrom } from 'rxjs';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { MessageInputComponent } from '../../../../common-ui/message-input/message-input.component';
import { ChatService } from '../../../../data/servises/chat.service';
import { Chat, Message } from '../../../../data/models/chat.model';

@Component({
  selector: 'app-chat-workspace-messages-wrapper',
  imports: [ChatMessageComponent, MessageInputComponent],
  templateUrl: './chat-workspace-messages-wrapper.component.html',
  styleUrl: './chat-workspace-messages-wrapper.component.scss',
})
export class ChatWorkspaceMessagesWrapperComponent {
  private readonly chatService = inject(ChatService);
  public chat = input.required<Chat>();
  public messages = this.chatService.activeChatMessages;
  private readonly hostElement = inject(ElementRef);

  private readonly r2 = inject(Renderer2);

  @HostListener('window:resize') onWindowResize() {
    this.resizeFeed();
  }

  ngAfterViewInit(): void {
    this.resizeFeed();
  }

  resizeFeed() {
    const { top } = this.hostElement.nativeElement.getBoundingClientRect();

    const height = window.innerHeight - top - 24 - 24;

    this.r2.setStyle(this.hostElement.nativeElement, 'height', `${height}px`);
  }

  public async onSendMessage(message: string) {
    await firstValueFrom(this.chatService.sendMessage(this.chat().id, message));

    await firstValueFrom(this.chatService.getChatById(this.chat().id));
  }
}
