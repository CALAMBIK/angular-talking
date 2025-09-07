import { Component, input } from '@angular/core';
import { PostComment } from '../../../../data/models/post.model';
import { AvatarCircleComponent } from '../../../../common-ui/avatar-circle/avatar-circle.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-comment',
  imports: [AvatarCircleComponent, DatePipe],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss',
})
export class CommentComponent {
  public comment = input<PostComment>();
}
