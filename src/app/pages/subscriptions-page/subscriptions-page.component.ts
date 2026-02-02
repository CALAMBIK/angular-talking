import { Component, inject, signal } from '@angular/core';
import { ProfileService } from '../../data/servises/profile.service';
import { Profile } from '../../data/models/profile.model';
import { ProfileCardComponent } from '../../common-ui/profile-card/profile-card.component';

@Component({
  selector: 'app-subscriptions-page',
  imports: [ProfileCardComponent],
  templateUrl: './subscriptions-page.component.html',
  styleUrl: './subscriptions-page.component.scss',
})
export class SubscriptionsPageComponent {
  private readonly profileService = inject(ProfileService);
  public subscriptions = signal<Profile[] | null>(null);

  ngOnInit() {
    this.profileService.getMySubscriptions().subscribe((response) => {
      if (response) {
        this.subscriptions.set(response.items);
      }
    });
  }
}
