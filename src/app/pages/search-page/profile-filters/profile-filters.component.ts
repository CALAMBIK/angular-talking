import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../../../data/servises/profile.service';
import { debounceTime, startWith, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-profile-filters',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-filters.component.html',
  styleUrl: './profile-filters.component.scss',
})
export class ProfileFiltersComponent {
  @Output() filtersChange = new EventEmitter<Record<string, any>>();

  public searchForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    stack: new FormControl(''),
  });

  constructor() {
    this.searchForm.valueChanges
      .pipe(
        startWith(this.searchForm.value),
        debounceTime(300),
        tap((formValue) => this.filtersChange.emit(formValue)),
        takeUntilDestroyed()
      )
      .subscribe();
  }
}
