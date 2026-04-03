// chat-workspace-messages-wrapper.component.ts
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  Renderer2,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { MessageInputComponent } from '../../../../common-ui/message-input/message-input.component';
import { ChatService } from '../../../../data/servises/chat.service';
import { Chat } from '../../../../data/models/chat.model';
import { AIService } from '../../../../data/servises/ai.service';
import { ProfileService } from '../../../../data/servises/profile.service';
import { Subscription, timer, firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-workspace-messages-wrapper',
  imports: [ChatMessageComponent, MessageInputComponent],
  templateUrl: './chat-workspace-messages-wrapper.component.html',
  styleUrl: './chat-workspace-messages-wrapper.component.scss',
})
export class ChatWorkspaceMessagesWrapperComponent
  implements OnInit, OnDestroy
{
  private readonly chatService = inject(ChatService);
  private readonly aiService = inject(AIService);
  private readonly profileService = inject(ProfileService);
  private readonly injector = inject(Injector);
  public chat = input.required<Chat>();
  private readonly hostElement = inject(ElementRef);
  private readonly r2 = inject(Renderer2);

  messages = this.chatService.activeChatMessages;
  suggestions = signal<string[]>([]);
  isGeneratingSuggestions = signal(false);
  showSuggestions = signal(false);
  showForBothUsers = signal(true);
  currentUserId = signal<string>('');
  lastGeneratedContext = signal<any>(null);

  private suggestionTimer?: Subscription;
  private lastMessageCount = 0;

  private readonly debounceTime = 1000;

  private messages$ = toObservable(this.messages);
  constructor() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.checkForMessageChanges();
      });
    });
  }

  getParticipantsInfo() {
    const chat = this.chat();
    const me = this.profileService.me();
    if (!me || !chat) return null;
    return {
      me,
      companion: chat.userFirst.id === me.id ? chat.userSecond : chat.userFirst,
      amIFirst: chat.userFirst.id === me.id,
    };
  }

  private getMessageHistoryForAI() {
    const allMessages = this.messages();
    const participants = this.getParticipantsInfo();
    if (!participants) return [];
    const recentMessages = [...allMessages].slice(-15);
    return recentMessages.map((msg) => ({
      role: msg.isMine ? 'user' : 'assistant',
      content: msg.text,
      timestamp: msg.createdAt,
    }));
  }

  async generateSuggestions() {
    const participants = this.getParticipantsInfo();
    if (!participants) {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
      return;
    }
    const messageHistory = this.getMessageHistoryForAI();

    if (messageHistory.length === 0) {
      this.suggestions.set(['Привет!', 'Здравствуйте!', 'Как дела?']);
      this.showSuggestions.set(true);
      this.autoHideSuggestions();
      return;
    }
    this.isGeneratingSuggestions.set(true);
    try {
      const response = await firstValueFrom(
        this.aiService.getSuggestions(
          messageHistory,
          participants.me.id.toString(),
          3,
        ),
      );
      if (response.suggestions && response.suggestions.length > 0) {
        this.suggestions.set(response.suggestions);
        this.showSuggestions.set(true);
        const typedResponse = response as any;
        if (typedResponse.context) {
          this.lastGeneratedContext.set(typedResponse.context);
        }
        this.autoHideSuggestions();
      } else {
        this.suggestions.set([]);
        this.showSuggestions.set(false);
      }
    } catch (error) {
      console.error('Ошибка генерации предложений:', error);
      this.useFallbackSuggestions(messageHistory);
    } finally {
      this.isGeneratingSuggestions.set(false);
    }
  }
  private useFallbackSuggestions(messages: any[]) {
    const fallbackSuggestions = this.generateFallbackSuggestions(messages);
    this.suggestions.set(fallbackSuggestions);
    this.showSuggestions.set(fallbackSuggestions.length > 0);
    if (fallbackSuggestions.length > 0) {
      this.autoHideSuggestions();
    }
  }
  private generateFallbackSuggestions(messages: any[]): string[] {
    if (messages.length === 0) {
      return ['Привет!', 'Здравствуйте!', 'Как дела?'];
    }
    const lastMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || '';
    if (lastMessage.includes('привет') || lastMessage.includes('здравств')) {
      return ['Привет!', 'Здравствуй!', 'Привет, как дела?'];
    } else if (lastMessage.includes('?')) {
      return ['Хороший вопрос', 'Не знаю точно', 'Думаю, что да', 'Возможно'];
    } else if (lastMessage.includes('спасибо')) {
      return ['Пожалуйста!', 'Не за что!', 'Всегда рад помочь!'];
    } else {
      return ['Понятно', 'Интересно', 'Расскажи подробнее', 'Правда?'];
    }
  }
  private autoHideSuggestions() {
    if (this.suggestionTimer) {
      this.suggestionTimer.unsubscribe();
    }
    this.suggestionTimer = timer(30000).subscribe(() => {
      if (this.showSuggestions()) {
        this.showSuggestions.set(false);
      }
    });
  }
  async onSendMessage(message: string) {
    this.chatService.wsAdapter.sendMessage(message, this.chat().id);
    this.showSuggestions.set(false);
    this.lastMessageCount = this.messages().length + 1;
    this.scheduleSuggestionGeneration();
  }
  async onSelectSuggestion(suggestion: string) {
    this.chatService.wsAdapter.sendMessage(suggestion, this.chat().id);
    this.showSuggestions.set(false);
    this.suggestions.set([]);
    this.lastMessageCount = this.messages().length + 1;
    this.scheduleSuggestionGeneration();
  }
  private scheduleSuggestionGeneration() {
    if (this.suggestionTimer) {
      this.suggestionTimer.unsubscribe();
    }
    this.suggestionTimer = timer(this.debounceTime).subscribe(async () => {
      await this.generateSuggestions();
    });
  }
  async onSendCustomMessage(message: string) {
    await this.onSendMessage(message);
  }
  private checkForMessageChanges() {
    const currentCount = this.messages().length;
    if (currentCount !== this.lastMessageCount) {
      this.lastMessageCount = currentCount;
      const participants = this.getParticipantsInfo();
      if (participants) {
        const lastMessage = this.messages()[currentCount - 1];
        if (lastMessage && !lastMessage.isMine) {
          this.scheduleSuggestionGeneration();
        }
      }
    }
  }
  ngOnInit() {
    const me = this.profileService.me();
    if (me) {
      this.currentUserId.set(me.id.toString());
      this.lastMessageCount = this.messages().length;
      this.scheduleSuggestionGeneration();
    }
  }
  ngOnDestroy() {
    if (this.suggestionTimer) {
      this.suggestionTimer.unsubscribe();
    }
  }
  refreshSuggestions() {
    this.scheduleSuggestionGeneration();
  }
  hideSuggestions() {
    this.showSuggestions.set(false);
  }
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
}
