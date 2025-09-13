import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ProfileService } from '../../data/servises/profile.service';
import { AvatarCircleComponent } from '../avatar-circle/avatar-circle.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SvgComponent } from '../svg/svg.component';

@Component({
  selector: 'app-message-input',
  imports: [
    AvatarCircleComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SvgComponent,
  ],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent {
  public profile = inject(ProfileService).me;
  private readonly r2 = inject(Renderer2);

  @Output() created = new EventEmitter<string>();

  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;

  public postText = '';

  public onTextAreaInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;

    this.r2.setStyle(textarea, 'height', 'auto');
    this.r2.setStyle(textarea, 'height', textarea.scrollHeight + 'px');
  }

  onCreateMessage() {
    if (!this.postText) return;
    this.created.emit(this.postText);
    this.postText = '';
  }
}
