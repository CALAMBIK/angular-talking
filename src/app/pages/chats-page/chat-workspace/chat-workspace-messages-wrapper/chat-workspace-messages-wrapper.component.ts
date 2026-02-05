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
  // Сигналы
  messages = this.chatService.activeChatMessages;
  suggestions = signal<string[]>([]);
  isGeneratingSuggestions = signal(false);
  showSuggestions = signal(false);
  showForBothUsers = signal(true); // Показывать обоим пользователям
  currentUserId = signal<string>('');
  lastGeneratedContext = signal<any>(null);
  // Таймер для автообновления предложений
  private suggestionTimer?: Subscription;
  private lastMessageCount = 0;
  // Дебаунс для предотвращения слишком частых запросов
  private readonly debounceTime = 1500;
  // Observable для отслеживания изменений сообщений
  private messages$ = toObservable(this.messages);
  constructor() {
    // Запускаем эффект в конструкторе с помощью runInInjectionContext
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.checkForMessageChanges();
      });
    });
  }
  // Определяем, кто является собеседниками
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
  // Получаем историю сообщений для AI
  private getMessageHistoryForAI() {
    const allMessages = this.messages();
    const participants = this.getParticipantsInfo();
    if (!participants) return [];
    // Берем последние 15 сообщений
    const recentMessages = [...allMessages].slice(-15);
    // Конвертируем в формат для AI
    return recentMessages.map((msg) => ({
      role: msg.isMine ? 'user' : 'assistant',
      content: msg.text,
      timestamp: msg.createdAt,
    }));
  }
  // Генерация предложений ответов
  async generateSuggestions() {
    const participants = this.getParticipantsInfo();
    if (!participants) {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
      return;
    }
    const messageHistory = this.getMessageHistoryForAI();
    // Если нет истории сообщений, используем приветственные варианты
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
        // Используем type assertion для безопасного доступа к context
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
  // Использование запасных вариантов
  private useFallbackSuggestions(messages: any[]) {
    const fallbackSuggestions = this.generateFallbackSuggestions(messages);
    this.suggestions.set(fallbackSuggestions);
    this.showSuggestions.set(fallbackSuggestions.length > 0);
    if (fallbackSuggestions.length > 0) {
      this.autoHideSuggestions();
    }
  }
  // Fallback предложения
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
  // Автоматическое скрытие предложений через время
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
  // Обработка отправки сообщения
  async onSendMessage(message: string) {
    // Отправляем сообщение
    this.chatService.wsAdapter.sendMessage(message, this.chat().id);
    // Скрываем текущие предложения
    this.showSuggestions.set(false);
    // Обновляем счетчик сообщений для отслеживания изменений
    this.lastMessageCount = this.messages().length + 1;
    // Генерируем новые предложения через дебаунс
    this.scheduleSuggestionGeneration();
  }
  // Обработка выбора предложенного ответа
  async onSelectSuggestion(suggestion: string) {
    // Отправляем выбранный вариант
    this.chatService.wsAdapter.sendMessage(suggestion, this.chat().id);
    // Скрываем предложения
    this.showSuggestions.set(false);
    this.suggestions.set([]);
    // Обновляем счетчик сообщений
    this.lastMessageCount = this.messages().length + 1;
    // Генерируем новые предложения через дебаунс
    this.scheduleSuggestionGeneration();
  }
  // Планирование генерации предложений с дебаунсом
  private scheduleSuggestionGeneration() {
    if (this.suggestionTimer) {
      this.suggestionTimer.unsubscribe();
    }
    this.suggestionTimer = timer(this.debounceTime).subscribe(async () => {
      await this.generateSuggestions();
    });
  }
  // Обработка отправки пользовательского сообщения
  async onSendCustomMessage(message: string) {
    await this.onSendMessage(message);
  }
  // Проверяем изменения в сообщениях
  private checkForMessageChanges() {
    const currentCount = this.messages().length;
    // Если количество сообщений изменилось
    if (currentCount !== this.lastMessageCount) {
      this.lastMessageCount = currentCount;
      // Генерируем новые предложения, но только если это получатель
      const participants = this.getParticipantsInfo();
      if (participants) {
        // Проверяем последнее сообщение - если оно от нас, не генерируем
        const lastMessage = this.messages()[currentCount - 1];
        if (lastMessage && !lastMessage.isMine) {
          this.scheduleSuggestionGeneration();
        }
      }
    }
  }
  // Инициализация
  ngOnInit() {
    const me = this.profileService.me();
    if (me) {
      this.currentUserId.set(me.id.toString());
      this.lastMessageCount = this.messages().length;
      // Начальная генерация предложений
      this.scheduleSuggestionGeneration();
    }
  }
  // Очистка
  ngOnDestroy() {
    if (this.suggestionTimer) {
      this.suggestionTimer.unsubscribe();
    }
  }
  // Метод для принудительной генерации предложений (можно вызвать извне)
  refreshSuggestions() {
    this.scheduleSuggestionGeneration();
  }
  // Метод для скрытия предложений
  hideSuggestions() {
    this.showSuggestions.set(false);
  }
  // Остальные методы (resize и т.д.)
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
