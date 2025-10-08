import { Observable } from 'rxjs';
import { ChatWSMessage } from './chat-ws-message.interface';

export interface ChatConnectionWSParams {
  url: string;
  token: string;
  handleMessage: (message: ChatWSMessage) => void;
}

export interface ChatWSService {
  connect: (params: ChatConnectionWSParams) => void | Observable<ChatWSMessage>;
  sendMessage: (text: string, chatId: number) => void;
  disconnet: () => void;
}
