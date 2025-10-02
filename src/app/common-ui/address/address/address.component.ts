import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { Component, forwardRef, inject, signal } from '@angular/core';
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
  private onChange(value: string) {}

  private onTouched() {}

  private readonly dadataService = inject(DadataService);

  public address = new FormControl();

  public isDropDown = signal<boolean>(false);

  public suggestions$ = this.address.valueChanges.pipe(
    debounceTime(500),
    switchMap((val) => {
      return this.dadataService
        .getSuggestion(val)
        .pipe(tap((res) => this.isDropDown.set(!!res.length)));
    })
  );

  writeValue(value: string): void {
    this.address.patchValue(value, {
      emitEvent: false,
    });
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onSuggestPick(city: string) {
    this.isDropDown.set(false);
    this.address.patchValue(city, {
      emitEvent: false,
    });
    this.onChange(city);
  }
}
