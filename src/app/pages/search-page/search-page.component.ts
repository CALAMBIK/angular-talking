import { Component, inject } from '@angular/core';
import { ProfileCardComponent } from '../../common-ui/profile-card/profile-card.component';
import { ProfileService } from '../../data/servises/profile.service';
import { Profile } from '../../data/models/profile.model';

@Component({
  selector: 'app-search-page',
  imports: [ProfileCardComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  private readonly profileService = inject(ProfileService);

  profiles: Profile[] = [];

  constructor() {
    this.profileService.get().subscribe((val) => (this.profiles = val));
  }
}
