import { Component, inject, OnInit } from '@angular/core';
import { ProfileCardComponent } from '../../common-ui/profile-card/profile-card.component';
import { ProfileService } from '../../data/servises/profile.service';
import { ProfileFiltersComponent } from './profile-filters/profile-filters.component';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-search-page',
  imports: [
    ProfileCardComponent,
    ProfileFiltersComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent implements OnInit {
  private readonly profileService = inject(ProfileService);

  profiles = this.profileService.filteredProfiles;

  page = 1;
  size = 10;
  filters: Record<string, any> = {};
  isLoading = false;
  isInitialLoading = true;
  hasMore = true;

  ngOnInit() {
    this.loadProfiles(true);
  }

  onScroll() {
    if (this.isLoading || !this.hasMore) return;
    this.page++;
    this.loadProfiles(false);
  }

  onFiltersChange(filters: Record<string, any>) {
    this.page = 1;
    this.filters = filters;
    this.hasMore = true;
    this.loadProfiles(true);
  }

  private loadProfiles(reset: boolean) {
    this.isLoading = true;
    if (reset) this.isInitialLoading = true;

    this.profileService
      .filterProfiles({ ...this.filters, page: this.page, size: this.size })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.isInitialLoading = false;
          this.hasMore = res.items.length === this.size;
        },
        error: () => {
          this.isLoading = false;
          this.isInitialLoading = false;
        },
      });
  }
}
