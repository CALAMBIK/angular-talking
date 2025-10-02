import { firstValueFrom } from 'rxjs';
import { Component, effect, inject, ViewChild } from '@angular/core';
import { ProfileHeaderComponent } from '../../common-ui/profile-header/profile-header.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../data/servises/profile.service';
import { AvatarUploadComponent } from './avatar-upload/avatar-upload.component';
import { StackInputComponent } from '../../common-ui/stack-input/stack-input.component';
import { AddressComponent } from '../../common-ui/address/address/address.component';

@Component({
  selector: 'app-settings-page',
  imports: [
    ProfileHeaderComponent,
    ReactiveFormsModule,
    AvatarUploadComponent,
    StackInputComponent,
    AddressComponent,
  ],
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
    city: [null],
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
      })
    );
  }
}
