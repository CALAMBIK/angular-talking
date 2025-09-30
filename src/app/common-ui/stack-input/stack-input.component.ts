import { Component, forwardRef, HostListener } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { SvgComponent } from '../svg/svg.component';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-stack-input',
  imports: [FormsModule, SvgComponent, AsyncPipe],
  templateUrl: './stack-input.component.html',
  styleUrl: './stack-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => StackInputComponent),
    },
  ],
})
export class StackInputComponent implements ControlValueAccessor {
  public stackOfTags$ = new BehaviorSubject<string[]>([]);

  public innerInput: string = '';

  public isDisabled = false;

  @HostListener('keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    event.stopPropagation();
    event.preventDefault();

    if (!this.innerInput) return;

    this.stackOfTags$.next([...this.stackOfTags$.value, this.innerInput]);
    this.innerInput = '';
    this.onChange(this.stackOfTags$.value);
  }

  writeValue(value: string[]): void {
    if (!value) {
      this.stackOfTags$.next([]);
      return;
    }

    this.stackOfTags$.next(value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  private onChange(value: string[] | null) {}

  private onTouched() {}

  public onDeleteTag(index: number) {
    const tags = this.stackOfTags$.value;
    tags.splice(index, 1);

    this.stackOfTags$.next(tags);
    this.onChange(this.stackOfTags$.value);
  }
}
