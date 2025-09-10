import { firstValueFrom } from 'rxjs';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Post, PostComment } from '../../../data/models/post.model';
import { AvatarCircleComponent } from '../../../common-ui/avatar-circle/avatar-circle.component';
import { SvgComponent } from '../../../common-ui/svg/svg.component';
import { PostInputComponent } from '../post-input/post-input.component';
import { CommentComponent } from './comment/comment.component';
import { PostService } from '../../../data/servises/post.service';
import { timeAgoDatePipe } from '../../../helpers/pipes/time-ago-date.pipe';

@Component({
  selector: 'app-post',
  imports: [
    AvatarCircleComponent,
    SvgComponent,
    PostInputComponent,
    CommentComponent,
    timeAgoDatePipe,
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
})
export class PostComponent implements OnInit {
  public post = input<Post>();
  public comments = signal<PostComment[]>([]);
  private readonly postService = inject(PostService);

  ngOnInit(): void {
    this.comments.set(this.post()!.comments);
  }

  async onCreated() {
    const com = await firstValueFrom(
      this.postService.getCommentsById(this.post()!.id)
    );
    this.comments.set(com);
  }
}
