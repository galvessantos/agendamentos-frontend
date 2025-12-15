import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.scss']
})
export class PaymentPageComponent implements OnInit {
  selectedPlan: string | null = null;
  planPrice: number = 0;
  planName: string = '';

  plans: { [key: string]: { name: string; price: number } } = {
    basico: { name: 'Básico', price: 49 },
    profissional: { name: 'Profissional', price: 70 },
    enterprise: { name: 'Enterprise', price: 150 }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedPlan = params['plano'] || null;
      if (this.selectedPlan && this.plans[this.selectedPlan]) {
        this.planName = this.plans[this.selectedPlan].name;
        this.planPrice = this.plans[this.selectedPlan].price;
      }
    });
  }

  processPayment() {
    // Aqui você integraria com o gateway de pagamento
    console.log('Processing payment for plan:', this.selectedPlan);
    // Após pagamento bem-sucedido, redirecionar para dashboard
    // this.router.navigate(['/dashboard']);
    alert('Pagamento processado com sucesso! (Simulação)');
  }
}












