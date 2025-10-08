import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Chat, LastMessageRes, Message } from '../models/chat.model';
import { ProfileService } from './profile.service';
import { map, Observable } from 'rxjs';
import { ChatWSService } from '../ws/interfaces/chat-ws-service.interface';
import { ChatWSNativeService } from '../ws/services/chat-ws-native.service';
import { AuthService } from '../../auth/auth.service';
import { ChatWSMessage } from '../ws/interfaces/chat-ws-message.interface';
import { isNewMessage, isUnreadMessage } from '../ws/interfaces/type-guards';
import { ChatWSRxJsService } from '../ws/services/chat-ws-rxjs.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly baseApiUrl = 'https://icherniakov.ru/yt-course/';
  private readonly chatApiUrl = `${this.baseApiUrl}chat/`;
  private readonly messageApiUrl = `${this.baseApiUrl}message/`;
  private readonly profileService = inject(ProfileService);
  private readonly token = inject(AuthService).token;

  // public wsAdapter: ChatWSService = new ChatWSNativeService();
  public wsAdapter: ChatWSService = new ChatWSRxJsService();

  private readonly http = inject(HttpClient);

  public activeChatMessages = signal<Message[]>([]);

  public connectWS() {
    return this.wsAdapter.connect({
      url: `${this.baseApiUrl}chat/ws`,
      token: this.token ?? '',
      handleMessage: this.handleMessage,
    }) as Observable<ChatWSMessage>;
  }

  private handleMessage = (message: ChatWSMessage) => {
    if (isUnreadMessage(message)) {
    }

    if (isNewMessage(message)) {
      this.activeChatMessages.set([
        ...this.activeChatMessages(),
        {
          id: message.data.id,
          userFromId: message.data.author,
          personalChatId: message.data.chat_id,
          text: message.data.message,
          createdAt: message.data.created_at,
          isRead: false,
          isMine: false,
        },
      ]);
    }
  };

  public createChat(userId: number) {
    return this.http.post<Chat>(`${this.chatApiUrl}${userId}`, {});
  }

  public getChatById(userId: number) {
    return this.http.get<Chat>(`${this.chatApiUrl}${userId}`).pipe(
      map((chat) => {
        const patchMessgers = chat.messages.map((message) => {
          return {
            ...message,
            user:
              chat.userFirst.id === message.userFromId
                ? chat.userFirst
                : chat.userSecond,
            isMine: message.userFromId === this.profileService.me()?.id,
          };
        });

        this.activeChatMessages.set(patchMessgers);
        return {
          ...chat,
          componion:
            chat.userFirst.id === this.profileService.me()?.id
              ? chat.userSecond
              : chat.userFirst,
          messages: patchMessgers,
        };
      })
    );
  }

  public getAllChats() {
    return this.http.get<LastMessageRes[]>(`${this.chatApiUrl}get_my_chats/`);
  }

  public sendMessage(chatId: number, message: string) {
    return this.http.post<Message>(
      `${this.messageApiUrl}send/${chatId}`,
      {},
      {
        params: {
          message,
        },
      }
    );
  }
}
