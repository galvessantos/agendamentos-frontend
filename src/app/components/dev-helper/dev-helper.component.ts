import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-dev-helper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dev-helper.component.html',
  styleUrls: ['./dev-helper.component.scss']
})
export class DevHelperComponent {
  accountService = inject(AccountService);
  showPanel = signal(false);

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ctrl+Shift+D
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      this.togglePanel();
    }
  }

  togglePanel() {
    this.showPanel.set(!this.showPanel());
  }

  setStatus(status: 'inactive' | 'trial' | 'active') {
    this.accountService.setAccountStatus(status);
    if (status === 'active') {
      this.accountService.setSelectedPlan('profissional');
    } else {
      this.accountService.setSelectedPlan(null);
    }
  }

  getCurrentStatus() {
    return this.accountService.accountStatus();
  }

  getCurrentPlan() {
    return this.accountService.selectedPlan();
  }
}




