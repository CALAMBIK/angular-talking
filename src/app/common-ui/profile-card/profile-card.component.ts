import { Component, inject, Input, signal } from '@angular/core';
import { Profile } from '../../data/models/profile.model';
import { ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ImgUrlPipe } from '../../helpers/pipes/img-url.pipe';
import { ProfileService } from '../../data/servises/profile.service';

@Component({
  selector: 'app-profile-card',
  imports: [ReactiveFormsModule, NgFor, ImgUrlPipe, NgIf],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss',
})
export class ProfileCardComponent {
  private readonly profileService = inject(ProfileService);

  @Input() profile!: Profile;
  isLoading = signal(false);
  isSubscribed = signal(false);

  ngOnInit(): void {
    this.checkSubscription();
  }

  checkSubscription(): void {
    this.profileService.isSubscribedTo(this.profile.id).subscribe({
      next: (subscribed) => {
        this.isSubscribed.set(subscribed);
      },
      error: (error) => {
        console.error('Ошибка проверки подписки:', error);
      },
    });
  }

  toggleSubscribe(): void {
    if (this.isSubscribed()) {
      this.unsubscribe();
    } else {
      this.subscribe();
    }
  }

  subscribe(): void {
    this.isLoading.set(true);

    this.profileService.subscribe(this.profile.id).subscribe({
      next: () => {
        this.isSubscribed.set(true);
        this.isLoading.set(false);
        console.log('Успешно подписан на', this.profile.username);
      },
      error: (error) => {
        console.error('Ошибка подписки:', error);
        this.isLoading.set(false);
      },
    });
  }

  unsubscribe(): void {
    this.isLoading.set(true);

    this.profileService.unsubscribe(this.profile.id).subscribe({
      next: () => {
        this.isSubscribed.set(false);
        this.isLoading.set(false);
        console.log('Успешно отписан от', this.profile.username);
      },
      error: (error) => {
        console.error('Ошибка отписки:', error);
        this.isLoading.set(false);
      },
    });
  }
}
