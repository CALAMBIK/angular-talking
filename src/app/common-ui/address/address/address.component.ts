import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, forwardRef, inject, input, signal } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CvaTextPasswordInputComponent } from '../../../pages/login-page/cva-text-password-input/cva-text-password-input.component';
import { DadataService } from '../services/dadata.service';
import { debounceTime, switchMap, tap } from 'rxjs';
import { FullAddress } from '../models/full-address.model';
import { DadataType } from '../models/dadata.model';

@Component({
  selector: 'app-address',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CvaTextPasswordInputComponent,
    AsyncPipe,
  ],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => AddressComponent),
    },
  ],
})
export class AddressComponent implements ControlValueAccessor {
  public fullAddressControl = input<FormControl | null>(null);
  public cityControl = input<FormControl | null>(null);
  public streetControl = input<FormControl | null>(null);
  public houseControl = input<FormControl | null>(null);

  private onChange: (value: FullAddress) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly dadataService = inject(DadataService);

  public addressSearch = new FormControl('');

  public isDropDown = signal<boolean>(false);

  public localFullAddress = new FormControl('');
  public localCity = new FormControl('');
  public localStreet = new FormControl('');
  public localHouse = new FormControl('');

  get fullAddress(): FormControl {
    return this.fullAddressControl() || this.localFullAddress;
  }

  get city(): FormControl {
    return this.cityControl() || this.localCity;
  }

  get street(): FormControl {
    return this.streetControl() || this.localStreet;
  }

  get house(): FormControl {
    return this.houseControl() || this.localHouse;
  }

  public suggestions$ = this.addressSearch.valueChanges.pipe(
    debounceTime(500),
    switchMap((val: string | null) => {
      if (!val || val.length < 2) {
        this.isDropDown.set(false);
        return [];
      }
      return this.dadataService
        .getSuggestion(val)
        .pipe(tap((res: DadataType[]) => this.isDropDown.set(!!res.length)));
    })
  );

  writeValue(value: FullAddress): void {
    if (value) {
      this.addressSearch.patchValue(value.fullAddress, { emitEvent: false });
      this.city.patchValue(value.city, { emitEvent: false });
      this.street.patchValue(value.street, { emitEvent: false });
      this.house.patchValue(value.house, { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: FullAddress) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.addressSearch.disable();
      this.fullAddress.disable();
      this.city.disable();
      this.street.disable();
      this.house.disable();
    } else {
      this.addressSearch.enable();
      this.fullAddress.enable();
      this.city.enable();
      this.street.enable();
      this.house.enable();
    }
  }

  onSuggestPick(suggest: DadataType) {
    this.isDropDown.set(false);

    const fullAddress: FullAddress = {
      fullAddress: suggest.value,
      city: suggest.data.city || '',
      street: suggest.data.street || '',
      house: suggest.data.house || '',
    };

    this.addressSearch.patchValue(suggest.value, { emitEvent: false });
    this.city.patchValue(suggest.data.city || '', { emitEvent: false });
    this.street.patchValue(suggest.data.street || '', { emitEvent: false });
    this.house.patchValue(suggest.data.house || '', { emitEvent: false });

    // Если используется как CVA (без переданных FormControl'ов)
    if (!this.fullAddressControl()) {
      this.onChange(fullAddress);
    }

    this.onTouched();
  }

  // Обработка ручного изменения полей адреса
  onManualAddressChange() {
    const fullAddressValue = this.buildFullAddress({
      city: this.city.value,
      street: this.street.value,
      house: this.house.value,
    });

    const fullAddress: FullAddress = {
      fullAddress: fullAddressValue,
      city: this.city.value || '',
      street: this.street.value || '',
      house: this.house.value || '',
    };

    this.addressSearch.patchValue(fullAddressValue, { emitEvent: false });
    this.fullAddress.patchValue(fullAddressValue, { emitEvent: false });

    // Если используется как CVA (без переданных FormControl'ов)
    if (!this.fullAddressControl()) {
      this.onChange(fullAddress);
    }
  }

  private buildFullAddress(address: {
    city?: string;
    street?: string;
    house?: string;
  }): string {
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.street) parts.push(address.street);
    if (address.house) parts.push(`д. ${address.house}`);
    return parts.join(', ');
  }
}
