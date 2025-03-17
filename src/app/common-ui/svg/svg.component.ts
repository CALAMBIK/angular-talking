import { Component, Input } from '@angular/core';

@Component({
  selector: 'svg[icon]',
  imports: [],
  template: '<svg:use [attr.href]="href"></svg:use>',
  styles: [''],
})
export class SvgComponent {
  @Input() icon = '';

  public get href() {
    return `assets/svg/${this.icon}.svg#${this.icon}`;
  }
}
