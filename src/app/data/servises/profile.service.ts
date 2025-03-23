import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Profile } from '../models/profile.model';
import { Pageble } from '../models/pageble.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  baseApiUrl = 'https://icherniakov.ru/yt-course/';
  private readonly http = inject(HttpClient);

  public me = signal<Profile | null>(null);

  public get(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseApiUrl}account/test_accounts`);
  }

  public getMe(): Observable<Profile> {
    return this.http
      .get<Profile>(`${this.baseApiUrl}account/me`)
      .pipe(tap((res) => this.me.set(res)));
  }

  public getSubscribersShortList(subscribersAmount: number = 3) {
    return this.http
      .get<Pageble<Profile>>(`${this.baseApiUrl}account/subscribers/`)
      .pipe(map((res) => res.items.slice(0, subscribersAmount)));
  }

  public getAccount(id: string) {
    return this.http.get<Profile>(`${this.baseApiUrl}account/${id}`);
  }
}
