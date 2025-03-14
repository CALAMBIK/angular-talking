import { Component, Input } from '@angular/core';
import { Profile } from '../../data/models/profile.model';
import { ReactiveFormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { ImgUrlPipe } from '../../helpers/pipes/img-url.pipe';

@Component({
  selector: 'app-profile-card',
  imports: [ReactiveFormsModule, NgFor, ImgUrlPipe],
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss',
})
export class ProfileCardComponent {
  @Input() profile!: Profile;
}
