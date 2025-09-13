import { Routes } from '@angular/router';

export const chatRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./chats-page.component').then((c) => c.ChatsPageComponent),
    children: [
      {
        path: ':id',
        loadComponent: () =>
          import('./chat-workspace/chat-workspace.component').then(
            (c) => c.ChatWorkspaceComponent
          ),
      },
    ],
  },
];
