import { Profile } from './profile.model';

export type Chat = {
  id: number;
  userFirst: Profile;
  userSecond: Profile;
  messages: Message[];
  componion?: Profile;
};

export type Message = {
  id: number;
  userFromId: number;
  personalChatId: number;
  text: string;
  createdAt: string;
  isRead: boolean;
  updatedAt: string;
  user?: Profile;
  isMine: boolean;
};

export type LastMessageRes = {
  id: number;
  userFrom: Profile;
  message: string;
  createdAt: string;
  unreadMessages: number;
};
