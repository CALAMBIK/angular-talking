import { Component, inject, signal } from '@angular/core';
import { ProfileHeaderComponent } from '../../common-ui/profile-header/profile-header.component';
import { ProfileService } from '../../data/servises/profile.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { ImgUrlPipe } from '../../helpers/pipes/img-url.pipe';
import { PostFeedComponent } from './post-feed/post-feed.component';
import { SvgComponent } from '../../common-ui/svg/svg.component';
import { ChatService } from '../../data/servises/chat.service';

@Component({
  selector: 'app-profile-page',
  imports: [
    ProfileHeaderComponent,
    AsyncPipe,
    RouterLink,
    ImgUrlPipe,
    PostFeedComponent,
    SvgComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  private readonly profileService = inject(ProfileService);
  private readonly chatService = inject(ChatService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly me$ = toObservable(this.profileService.me);

  public isMyProfile = signal(false);

  public subscribers$ = this.profileService.getSubscribersShortList(5);

  public profile$ = this.route.params.pipe(
    switchMap(({ id }) => {
      this.isMyProfile.set(id === 'me' || id === this.profileService.me()?.id);
      if (id === 'me') return this.me$;
      return this.profileService.getAccount(id);
    })
  );

  public async onSendMessage(userId: number) {
    await firstValueFrom(this.chatService.createChat(userId)).then((res) =>
      this.router.navigate(['/chats', res.id])
    );
  }
}
