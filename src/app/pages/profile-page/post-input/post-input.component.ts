import { firstValueFrom } from 'rxjs';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  input,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { AvatarCircleComponent } from '../../../common-ui/avatar-circle/avatar-circle.component';
import { ProfileService } from '../../../data/servises/profile.service';
import { SvgComponent } from '../../../common-ui/svg/svg.component';
import { PostService } from '../../../data/servises/post.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-input',
  imports: [AvatarCircleComponent, SvgComponent, CommonModule, FormsModule],
  templateUrl: './post-input.component.html',
  styleUrl: './post-input.component.scss',
})
export class PostInputComponent {
  public profile = inject(ProfileService).me;
  private readonly postService = inject(PostService);
  private readonly r2 = inject(Renderer2);

  public isCommentInput = input<boolean>(false);
  public postId = input<number>(0);

  @Output() created = new EventEmitter();

  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;

  public postText = '';

  public onTextAreaInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;

    this.r2.setStyle(textarea, 'height', 'auto');
    this.r2.setStyle(textarea, 'height', textarea.scrollHeight + 'px');
  }

  @HostBinding('class.comment')
  get isComment() {
    return this.isCommentInput();
  }

  onCreatePost() {
    if (!this.postText) return;

    if (this.isCommentInput()) {
      firstValueFrom(
        this.postService.createComment({
          text: this.postText,
          authorId: this.profile()!.id,
          postId: this.postId(),
        })
      ).then(() => {
        this.postText = '';
        this.created.emit();
      });

      return;
    }

    firstValueFrom(
      this.postService.createPost({
        title: 'Новый пост',
        content: this.postText,
        authorId: this.profile()!.id,
      })
    ).then(() => (this.postText = ''));
  }
}
