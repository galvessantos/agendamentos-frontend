import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-plans-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './plans-page.component.html',
  styleUrls: ['./plans-page.component.scss']
})
export class PlansPageComponent {
  constructor(private router: Router) {}

  selectPlan(plan: string) {
    // Aqui você salvaria o plano selecionado
    console.log('Plan selected:', plan);
    // Redirecionar para página de pagamento
    this.router.navigate(['/pagamento'], { queryParams: { plano: plan } });
  }
}

