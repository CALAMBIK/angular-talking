import { Component, forwardRef, input, signal } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'tt-input',
  templateUrl: 'cva-text-password-input.component.html',
  styleUrl: 'cva-text-password-input.component.scss',
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CvaTextPasswordInputComponent),
    },
  ],
})
export class CvaTextPasswordInputComponent implements ControlValueAccessor {
  public type = input<'text' | 'password'>('text');
  public placeholder = input<string>('');

  public value: string | null = null;

  public isPasswordVisible = signal(false);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  public isDisabled = false;

  // Вызывается когда значение меняется извне (например, formControl.setValue)
  writeValue(val: any): void {
    console.log(val);
    this.value = val;
  }

  // Регистрируем callback для уведомления Angular Forms об изменениях
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Регистрируем callback для уведомления о том, что поле было "тронуто"
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Вызывается когда состояние disabled меняется
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onValueChange(val: string) {
    this.onChange(val);
  }

  onBlur(): void {
    this.onTouched();
  }

  // Переключение видимости пароля
  togglePasswordVisibility(): void {
    this.isPasswordVisible.set(!this.isPasswordVisible());
  }

  // Вычисляемое свойство для определения фактического типа input'а
  getEffectiveType(): 'text' | 'password' {
    if (this.type() === 'password') {
      return this.isPasswordVisible() ? 'text' : 'password';
    }
    return this.type();
  }

  // Проверяем, является ли поле паролем
  isPasswordField(): boolean {
    return this.type() === 'password';
  }
}
