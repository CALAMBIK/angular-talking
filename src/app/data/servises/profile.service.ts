import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { Profile } from '../models/profile.model';
import { Pageble } from '../models/pageble.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private baseApiUrl = 'https://icherniakov.ru/yt-course/';
  private readonly http = inject(HttpClient);

  public me = signal<Profile | null>(null);

  public filteredProfiles = signal<Profile[]>([]);

  public me$ = new BehaviorSubject<Profile | null>(null);

  public getMe(): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseApiUrl}account/me`).pipe(
      tap((res) => {
        this.me.set(res);
        this.me$.next(res);
      }),
    );
  }

  public getSubscribersShortList(subscribersAmount: number = 3) {
    return this.http
      .get<Pageble<Profile>>(`${this.baseApiUrl}account/subscribers/`)
      .pipe(map((res) => res.items.slice(0, subscribersAmount)));
  }

  public getAccount(id: string) {
    return this.http.get<Profile>(`${this.baseApiUrl}account/${id}`);
  }

  public patchMe(profile: Partial<Profile>) {
    return this.http
      .patch<Profile>(`${this.baseApiUrl}account/me`, profile)
      .pipe(
        tap((updatedProfile) => {
          this.me.set(updatedProfile);
          this.me$.next(updatedProfile);
        }),
      );
  }

  public uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append('image', file);
    return this.http
      .post<Profile>(`${this.baseApiUrl}account/upload_image`, fd)
      .pipe(
        tap((updatedProfile) => {
          this.me.set(updatedProfile);
          this.me$.next(updatedProfile);
        }),
      );
  }

  public filterProfiles(
    params: Record<string, any> & { page?: number; size?: number },
  ) {
    const page = params.page ?? 1;
    const size = params.size ?? 10;

    return this.http
      .get<Pageble<Profile>>(`${this.baseApiUrl}account/accounts`, {
        params: { ...params, page, size },
      })
      .pipe(
        tap((res) => {
          if (page === 1) {
            this.filteredProfiles.set(res.items);
          } else {
            this.filteredProfiles.update((old) => [...old, ...res.items]);
          }
        }),
      );
  }

  public subscribe(accountId: number): Observable<any> {
    return this.http
      .post(`${this.baseApiUrl}account/subscribe/${accountId}`, {})
      .pipe(
        tap(() => {
          console.log(`Подписан на пользователя: ${accountId}`);
        }),
      );
  }

  public unsubscribe(accountId: number): Observable<any> {
    return this.http
      .delete(`${this.baseApiUrl}account/subscribe/${accountId}`)
      .pipe(
        tap(() => {
          console.log(`Отписан от пользователя: ${accountId}`);
        }),
      );
  }

  public isSubscribedTo(accountId: number): Observable<boolean> {
    const myId = this.me()?.id;

    return this.http
      .get<Pageble<Profile>>(`${this.baseApiUrl}account/subscriptions/${myId}`)
      .pipe(
        map((response) => {
          return response.items.some((profile) => profile.id === accountId);
        }),
        catchError((error) => {
          console.error('Ошибка при получении подписок:', error);
          return of(false);
        }),
      );
  }
}
