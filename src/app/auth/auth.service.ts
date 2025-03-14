import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { TokenResponse } from './auth.model';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);

  baseApiUrl = 'https://icherniakov.ru/yt-course/auth/';

  public token: string | null = null;
  public refreshToken: string | null = null;

  public get isAuth(): boolean {
    if (!this.token) {
      this.token = this.cookieService.get('token');
    }
    return !!this.token;
  }

  public login(payload: { username: string; password: string }) {
    const fd = new FormData();
    fd.append('username', payload.username);
    fd.append('password', payload.password);
    return this.http.post<TokenResponse>(`${this.baseApiUrl}token`, fd).pipe(
      tap((val) => {
        this.token = val.access_token;
        this.refreshToken = val.refresh_token;

        this.cookieService.set('token', this.token);
        this.cookieService.set('refreshToken', this.refreshToken);
      })
    );
  }
}
