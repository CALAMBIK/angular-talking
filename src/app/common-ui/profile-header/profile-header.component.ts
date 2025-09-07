import { Component, inject, input } from '@angular/core';
import { Profile } from '../../data/models/profile.model';
import { AvatarCircleComponent } from '../avatar-circle/avatar-circle.component';

@Component({
  selector: 'app-profile-header',
  imports: [AvatarCircleComponent],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss',
})
export class ProfileHeaderComponent {
  public profile = input<Profile>();
}
