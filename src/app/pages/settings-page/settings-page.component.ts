import { firstValueFrom } from 'rxjs';
import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { ProfileHeaderComponent } from '../../common-ui/profile-header/profile-header.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../data/servises/profile.service';
import { AvatarUploadComponent } from './avatar-upload/avatar-upload.component';
import { StackInputComponent } from '../../common-ui/stack-input/stack-input.component';
import { AddressComponent } from '../../common-ui/address/address/address.component';
import { Profile } from '../../data/models/profile.model';
import { ModalWindowComponent } from '../../common-ui/modal-wondow/modal-window/modal-window.component';
@Component({
  selector: 'app-settings-page',
  imports: [
    ProfileHeaderComponent,
    ReactiveFormsModule,
    AvatarUploadComponent,
    StackInputComponent,
    ModalWindowComponent,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
})
export class SettingsPageComponent {
  @ViewChild(AvatarUploadComponent) avaterUploader!: AvatarUploadComponent;

  private readonly fb = inject(FormBuilder);
  public readonly profileService = inject(ProfileService);

  public openModal = signal(false);

  public formSettings = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: [{ value: '', disabled: true }, Validators.required],
    description: [''],
    stack: [[] as string[]],
  });

  constructor() {
    effect(() => {
      const profile = this.profileService.me();
      if (profile) {
        this.formSettings.patchValue({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          username: profile.username || '',
          description: profile.description || '',
          stack: profile.stack || [],
        });
      }
    });
  }

  public onSave() {
    this.formSettings.markAllAsTouched();
    this.formSettings.updateValueAndValidity();

    if (this.formSettings.invalid) return;

    const formValue = this.formSettings.getRawValue();

    const dataToSend: Partial<Profile> = {
      firstName: formValue.firstName || undefined,
      lastName: formValue.lastName || undefined,
      username: formValue.username || undefined,
      description: formValue.description || undefined,
      stack: formValue.stack || [],
    };

    const currentProfile = this.profileService.me();
    const isChanged =
      currentProfile?.firstName !== dataToSend.firstName ||
      currentProfile?.lastName !== dataToSend.lastName ||
      currentProfile?.username !== dataToSend.username ||
      currentProfile?.description !== dataToSend.description ||
      JSON.stringify(currentProfile?.stack || []) !==
        JSON.stringify(dataToSend.stack || []);

    if (!isChanged && !this.avaterUploader.avatar) {
      return;
    }

    if (this.avaterUploader.avatar) {
      firstValueFrom(
        this.profileService.uploadAvatar(this.avaterUploader.avatar),
      ).catch((error) => {
        console.error('Error uploading avatar:', error);
      });
    }

    firstValueFrom(this.profileService.patchMe(dataToSend))
      .then(() => this.openModal.set(true))
      .catch((error) => {
        console.error('Error updating profile:', error);
      });
  }

  public onCloseModal() {
    this.openModal.set(false);
  }
}
