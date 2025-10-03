import { firstValueFrom } from 'rxjs';
import { Component, effect, inject, signal, ViewChild } from '@angular/core';
import { ProfileHeaderComponent } from '../../common-ui/profile-header/profile-header.component';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProfileService } from '../../data/servises/profile.service';
import { AvatarUploadComponent } from './avatar-upload/avatar-upload.component';
import { StackInputComponent } from '../../common-ui/stack-input/stack-input.component';
import { AddressComponent } from '../../common-ui/address/address/address.component';
import { Profile } from '../../data/models/profile.model';
import { FullAddress } from '../../common-ui/address/models/full-address.model';
import { ModalWindowComponent } from '../../common-ui/modal-wondow/modal-window/modal-window.component';
@Component({
  selector: 'app-settings-page',
  imports: [
    ProfileHeaderComponent,
    ReactiveFormsModule,
    AvatarUploadComponent,
    StackInputComponent,
    AddressComponent,
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
    city: this.fb.group({
      fullAddress: [''],
      city: [''],
      street: [''],
      house: [''],
    }),
  });

  constructor() {
    effect(() => {
      const profile = this.profileService.me();
      if (profile) {
        // Преобразуем данные профиля для формы
        const addressData = this.parseAddress(profile.city);

        this.formSettings.patchValue({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          username: profile.username || '',
          description: profile.description || '',
          stack: profile.stack || [],
          city: addressData,
        });
      }
    });
  }

  public onSave() {
    this.formSettings.markAllAsTouched();
    this.formSettings.updateValueAndValidity();

    if (this.formSettings.invalid) return;

    const formValue = this.formSettings.getRawValue();

    // Подготавливаем данные для отправки
    const dataToSend: Partial<Profile> = {
      firstName: formValue.firstName || undefined,
      lastName: formValue.lastName || undefined,
      username: formValue.username || undefined,
      description: formValue.description || undefined,
      stack: formValue.stack || [],
      city: this.formatAddressForServer(formValue.city), // Форматируем адрес для сервера
    };

    // Загрузка аватара
    if (this.avaterUploader.avatar) {
      firstValueFrom(
        this.profileService.uploadAvatar(this.avaterUploader.avatar)
      ).catch((error) => {
        console.error('Error uploading avatar:', error);
      });
    }

    // Обновление профиля
    firstValueFrom(this.profileService.patchMe(dataToSend))
      .then(() => this.openModal.set(true))
      .catch((error) => {
        console.error('Error updating profile:', error);
      });
  }

  get fullAddressControl(): FormControl {
    return this.formSettings.get('city.fullAddress') as FormControl;
  }

  get cityControl(): FormControl {
    return this.formSettings.get('city.city') as FormControl;
  }

  get streetControl(): FormControl {
    return this.formSettings.get('city.street') as FormControl;
  }

  get houseControl(): FormControl {
    return this.formSettings.get('city.house') as FormControl;
  }

  // Парсим адрес из строки в объект
  private parseAddress(city: string): FullAddress {
    if (!city) {
      return {
        fullAddress: '',
        city: '',
        street: '',
        house: '',
      };
    }

    // Если city уже объект (в случае ошибки типов)
    if (typeof city === 'object') {
      return city as FullAddress;
    }

    // Простой парсинг строки адреса
    const parts = city.split(',');
    return {
      fullAddress: city,
      city: parts[0]?.trim() || '',
      street: parts[1]?.trim() || '',
      house: parts[2]?.trim() || '',
    };
  }

  // Форматируем адрес для отправки на сервер
  private formatAddressForServer(address: any): string {
    if (!address) return '';

    // Если адрес уже строка (на случай каких-то проблем)
    if (typeof address === 'string') return address;

    // Собираем адрес из компонентов
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.street) parts.push(address.street);
    if (address.house) parts.push(address.house);

    return parts.join(', ');
  }

  public onCloseModal() {
    this.openModal.set(false);
  }
}
