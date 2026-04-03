import { firstValueFrom } from 'rxjs';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  Renderer2,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { PostInputComponent } from '../post-input/post-input.component';
import { PostComponent } from '../post/post.component';
import { PostService } from '../../../data/servises/post.service';
import { Post } from '../../../data/models/post.model';
import { ProfileService } from '../../../data/servises/profile.service';

@Component({
  selector: 'app-post-feed',
  imports: [PostInputComponent, PostComponent],
  templateUrl: './post-feed.component.html',
  styleUrl: './post-feed.component.scss',
})
export class PostFeedComponent implements AfterViewInit, OnChanges {
  private readonly postService = inject(PostService);
  readonly profileService = inject(ProfileService);

  public userId = input<number | null>(null);
  public feed = signal<Post[]>([]);

  private readonly hostElement = inject(ElementRef);
  private readonly r2 = inject(Renderer2);

  @HostListener('window:resize') onWindowResize() {
    this.resizeFeed();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId']) {
      this.loadPosts();
    }
  }

  async loadPosts() {
    const userId = this.userId();
    if (userId) {
      const posts = await firstValueFrom(
        this.postService.getPostsByUserId(userId),
      );
      this.feed.set(posts);
    } else {
      const posts = await firstValueFrom(this.postService.fetchPosts());
      this.feed.set(posts);
    }
  }

  async onPostCreated() {
    await this.loadPosts();
  }

  ngAfterViewInit(): void {
    this.resizeFeed();
    this.loadPosts();
  }

  resizeFeed() {
    const { top } = this.hostElement.nativeElement.getBoundingClientRect();
    const height = window.innerHeight - top - 24 - 24;
    this.r2.setStyle(this.hostElement.nativeElement, 'height', `${height}px`);
  }
}
