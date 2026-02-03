// ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SuggestionResponse {
  suggestions: string[];
  model?: string;
  messageCount?: number;
  generatedFrom?: string;
  error?: string;
}

export interface ChatContext {
  context: {
    messageCount: number;
    lastMessages: Array<{ role: string; content: string }>;
    needsGreeting: boolean;
    suggestionsCount: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AIService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  generateResponse(
    messages: { role: string; content: string }[],
  ): Observable<{ response: string; model?: string; source?: string }> {
    return this.http.post<{
      response: string;
      model?: string;
      source?: string;
    }>(`${this.baseUrl}/ai/generate-response`, {
      messages,
    });
  }

  // Обновленный метод для получения предложений ответов
  getSuggestions(
    messages: { role: string; content: string }[],
    userId: string,
    count: number = 3,
  ): Observable<SuggestionResponse> {
    return this.http.post<SuggestionResponse>(
      `${this.baseUrl}/ai/suggest-responses`,
      {
        messages,
        userId, // Добавляем идентификатор пользователя
        count,
      },
    );
  }

  // Метод для получения контекста чата
  getChatContext(
    messages: { role: string; content: string }[],
    userId: string,
  ): Observable<ChatContext> {
    return this.http.post<ChatContext>(`${this.baseUrl}/ai/chat-context`, {
      messages,
      userId,
    });
  }
}
