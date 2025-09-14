import { firstValueFrom } from 'rxjs';
import { Component, effect, inject, ViewChild } from '@angular/core';
import { ProfileHeaderComponent } from '../../common-ui/profile-header/profile-header.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../data/servises/profile.service';
import { AvatarUploadComponent } from './avatar-upload/avatar-upload.component';

@Component({
  selector: 'app-settings-page',
  imports: [ProfileHeaderComponent, ReactiveFormsModule, AvatarUploadComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
})
export class SettingsPageComponent {
  @ViewChild(AvatarUploadComponent) avaterUploader!: AvatarUploadComponent;

  private readonly fb = inject(FormBuilder);
  public readonly profileService = inject(ProfileService);

  public formSettings = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: [{ value: '', disabled: true }, Validators.required],
    description: [''],
    stack: [''],
  });

  constructor() {
    effect(() => {
      //@ts-ignore
      this.formSettings.patchValue(this.profileService.me());
    });
  }

  public onSave() {
    this.formSettings.markAllAsTouched();
    this.formSettings.updateValueAndValidity();

    if (this.formSettings.invalid) return;

    if (this.avaterUploader.avatar) {
      firstValueFrom(
        this.profileService.uploadAvatar(this.avaterUploader.avatar)
      );
    }

    //@ts-ignore
    firstValueFrom(
      //@ts-ignore
      this.profileService.patchMe({
        ...this.formSettings.value,
        stack: this.splitStack(this.formSettings.value.stack),
      })
    );
  }

  private splitStack(stack: string | null | string[] | undefined): string[] {
    if (!stack) return [];
    if (Array.isArray(stack)) return stack;
    return stack.split(',');
  }

  private mergeStack(stack: string | null | string[] | undefined) {
    if (!stack) return '';
    if (Array.isArray(stack)) return stack.join(',');
    return stack;
  }
}
