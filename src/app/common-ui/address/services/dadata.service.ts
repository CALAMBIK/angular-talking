import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DadataType } from '../models/dadata.model';
import { DADATA_TOKEN } from './dadata-token';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DadataService {
  private readonly http = inject(HttpClient);
  private readonly apiDadataUrl =
    'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';

  public getSuggestion(query: string) {
    return this.http
      .post<{ suggestions: DadataType[] }>(
        `${this.apiDadataUrl}`,
        { query },
        {
          headers: {
            Authorization: `Token ${DADATA_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(map((res) => res.suggestions));
  }
}
