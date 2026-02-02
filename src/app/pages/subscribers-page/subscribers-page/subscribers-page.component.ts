import { Component, inject, signal } from '@angular/core';
import { ProfileService } from '../../../data/servises/profile.service';
import { Profile } from '../../../data/models/profile.model';
import { ProfileCardComponent } from '../../../common-ui/profile-card/profile-card.component';

@Component({
  selector: 'app-subscribers-page',
  imports: [ProfileCardComponent],
  templateUrl: './subscribers-page.component.html',
  styleUrl: './subscribers-page.component.scss',
})
export class SubscribersPageComponent {
  private readonly profileService = inject(ProfileService);
  public subscribers = signal<Profile[] | null>(null);

  ngOnInit() {
    this.profileService.getMySubscribers().subscribe((response) => {
      if (response) {
        this.subscribers.set(response.items);
      }
    });
  }
}
