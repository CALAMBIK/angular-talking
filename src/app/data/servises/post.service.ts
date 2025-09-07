import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import {
  CommentCreateDto,
  Post,
  PostComment,
  PostCreateDto,
} from '../models/post.model';
import { map, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);

  baseApiUrl = 'https://icherniakov.ru/yt-course/';

  posts = signal<Post[]>([]);

  public createPost(payload: PostCreateDto) {
    return this.http
      .post<Post>(`${this.baseApiUrl}post/`, payload)
      .pipe(switchMap(() => this.fetchPosts()));
  }

  public fetchPosts() {
    return this.http
      .get<Post[]>(`${this.baseApiUrl}post/`)
      .pipe(tap((res) => this.posts.set(res)));
  }

  public createComment(payload: CommentCreateDto) {
    return this.http.post<PostComment>(`${this.baseApiUrl}comment/`, payload);
  }

  public getCommentsById(postId: number) {
    return this.http
      .get<Post>(`${this.baseApiUrl}post/${postId}`)
      .pipe(map((res) => res.comments));
  }
}
