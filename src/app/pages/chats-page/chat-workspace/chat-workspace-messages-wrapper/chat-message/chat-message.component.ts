import { Component, HostBinding, input } from '@angular/core';
import { Message } from '../../../../../data/models/chat.model';
import { AvatarCircleComponent } from '../../../../../common-ui/avatar-circle/avatar-circle.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-message',
  imports: [AvatarCircleComponent, DatePipe],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
})
export class ChatMessageComponent {
  public message = input<Message>();

  @HostBinding('class.is-mine')
  get isMine() {
    return this.message()?.isMine;
  }
}
