import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Chat, LastMessageRes, Message } from '../models/chat.model';
import { ProfileService } from './profile.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly baseApiUrl = 'https://icherniakov.ru/yt-course/';
  private readonly chatApiUrl = `${this.baseApiUrl}chat/`;
  private readonly messageApiUrl = `${this.baseApiUrl}message/`;
  private readonly profileService = inject(ProfileService);

  private readonly http = inject(HttpClient);

  public activeChatMessages = signal<Message[]>([]);

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
