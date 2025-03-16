import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile } from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  baseApiUrl = 'https://icherniakov.ru/yt-course/';
  private readonly http = inject(HttpClient);

  public get(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseApiUrl}account/test_accounts`);
  }

  public getMe(): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseApiUrl}account/me`);
  }
}
