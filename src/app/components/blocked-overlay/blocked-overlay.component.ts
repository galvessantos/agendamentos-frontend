import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-blocked-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blocked-overlay.component.html',
  styleUrls: ['./blocked-overlay.component.scss']
})
export class BlockedOverlayComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);

  goToPlans() {
    this.router.navigate(['/planos']);
  }
}




