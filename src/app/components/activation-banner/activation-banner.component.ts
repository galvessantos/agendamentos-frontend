import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-activation-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activation-banner.component.html',
  styleUrls: ['./activation-banner.component.scss']
})
export class ActivationBannerComponent {
  accountService = inject(AccountService);
  private router = inject(Router);

  goToPlans() {
    // Sempre redireciona para a página standalone de planos
    this.router.navigate(['/planos']);
  }
}


