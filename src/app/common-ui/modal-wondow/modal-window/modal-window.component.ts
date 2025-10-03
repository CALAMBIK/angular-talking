import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-window',
  imports: [CommonModule],
  templateUrl: './modal-window.component.html',
  styleUrl: './modal-window.component.scss',
})
export class ModalWindowComponent {
  public isOpen = input<boolean>(false);

  public closed = output<void>();

  public onClose() {
    this.closed.emit();
  }
}
