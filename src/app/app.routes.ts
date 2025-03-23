import { LayoutComponent } from './common-ui/layout/layout.component';
import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./common-ui/layout/layout.component').then(
        (c) => c.LayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/search-page/search-page.component').then(
            (c) => c.SearchPageComponent
          ),
      },
      {
        path: 'profile/:id',
        loadComponent: () =>
          import('./pages/profile-page/profile-page.component').then(
            (c) => c.ProfilePageComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings-page/settings-page.component').then(
            (c) => c.SettingsPageComponent
          ),
      },
    ],
    canActivate: [authGuard],
  },

  { path: 'login', component: LoginPageComponent },
];
