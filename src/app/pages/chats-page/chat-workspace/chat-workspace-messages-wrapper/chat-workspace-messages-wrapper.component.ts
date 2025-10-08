import { firstValueFrom, Subscription, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { MessageInputComponent } from '../../../../common-ui/message-input/message-input.component';
import { ChatService } from '../../../../data/servises/chat.service';
import { Chat } from '../../../../data/models/chat.model';

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

  // private pollingSubscription: Subscription | null = null;

  // ngOnInit(): void {
  //   this.startPolling();
  // }

  // ngOnDestroy(): void {
  //   this.stopPolling();
  // }

  // private startPolling(): void {
  //   this.stopPolling();

  //   this.pollingSubscription = timer(0, 10000)
  //     .pipe(
  //       switchMap(() => this.chatService.getChatById(this.chat().id)),
  //       catchError((error) => {
  //         console.error('Error polling chat:', error);
  //         return [];
  //       })
  //     )
  //     .subscribe();
  // }

  // private stopPolling(): void {
  //   if (this.pollingSubscription) {
  //     this.pollingSubscription.unsubscribe();
  //     this.pollingSubscription = null;
  //   }
  // }

  @HostListener('window:resize')
  onWindowResize() {
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
    this.chatService.wsAdapter.sendMessage(message, this.chat().id);
    // await firstValueFrom(this.chatService.sendMessage(this.chat().id, message));
    await firstValueFrom(this.chatService.getChatById(this.chat().id));
  }
}
