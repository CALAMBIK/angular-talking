import { Component, inject, OnInit } from '@angular/core';
import { SvgComponent } from '../svg/svg.component';
import { AsyncPipe, CommonModule, JsonPipe, NgFor } from '@angular/common';
import { SubscriberCardComponent } from './subscriber-card/subscriber-card.component';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../data/servises/profile.service';
import { firstValueFrom } from 'rxjs';
import { ImgUrlPipe } from '../../helpers/pipes/img-url.pipe';

@Component({
  selector: 'app-sidebar',
  imports: [
    SvgComponent,
    CommonModule,
    NgFor,
    SubscriberCardComponent,
    RouterLink,
    AsyncPipe,
    ImgUrlPipe,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  public subscibers$ = this.profileService.getSubscribersShortList();
  public me = this.profileService.me;

  public menuItems = [
    { label: 'Моя страница', icon: 'home', link: '' },
    { label: 'Чаты', icon: 'chats', link: 'chats' },
    { label: 'Поиск', icon: 'search', link: 'search' },
  ];

  ngOnInit() {
    firstValueFrom(this.profileService.getMe());
  }
}
