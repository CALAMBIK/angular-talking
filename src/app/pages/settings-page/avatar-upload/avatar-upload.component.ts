import { Component, signal } from '@angular/core';
import { SvgComponent } from '../../../common-ui/svg/svg.component';
import { DndDirective } from '../../../common-ui/directives/dnd.directive';

@Component({
  selector: 'app-avatar-upload',
  imports: [SvgComponent, DndDirective],
  templateUrl: './avatar-upload.component.html',
  styleUrl: './avatar-upload.component.scss',
})
export class AvatarUploadComponent {
  public preview = signal<string>('assets/imgs/default.png');

  public avatar: File | null = null;

  public fileBrowserHandler(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    this.proccessFile(file);
  }

  public onFileDropped(file: File) {
    this.proccessFile(file);
  }

  private proccessFile(file: File | null | undefined) {
    if (!file || !file.type.match('image')) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      this.preview.set(event.target?.result?.toString() ?? '');
    };

    reader.readAsDataURL(file);

    this.avatar = file;
  }
}
