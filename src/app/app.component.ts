import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileCardComponent } from './common-ui/profile-card/profile-card.component';
import { ProfileService } from './data/servises/profile.service';
import { JsonPipe } from '@angular/common';
import { Profile } from './data/models/profile.model';
import { delay } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
