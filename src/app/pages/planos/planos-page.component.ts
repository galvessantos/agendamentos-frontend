import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AccountService, PlanType } from '../../services/account.service';
import { PlanPreferenceService } from '../../services/plan-preference.service';

interface Plan {
  id: PlanType;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted: boolean;
  color: string;
}

@Component({
  selector: 'app-planos-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './planos-page.component.html',
  styleUrls: ['./planos-page.component.scss']
})
export class PlanosPageComponent implements OnInit {
  private accountService = inject(AccountService);
  private router = inject(Router);
  private planPreferenceService = inject(PlanPreferenceService);
  
  // Plano pré-selecionado (se houver preferência salva)
  selectedPlanId = signal<PlanType | null>(null);
  
  ngOnInit(): void {
    // Verifica se há uma preferência de plano salva
    const preferredPlan = this.planPreferenceService.getPreferredPlan();
    if (preferredPlan) {
      // Pré-seleciona o plano salvo
      this.selectedPlanId.set(preferredPlan);
      
      // Opcional: Scroll suave para o plano pré-selecionado
      setTimeout(() => {
        const planElement = document.querySelector(`[data-plan-id="${preferredPlan}"]`);
        if (planElement) {
          planElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }
  
  sidebarOpen = signal(false);
  billingPeriod = signal<'monthly' | 'yearly'>('monthly');
  openFaq = signal<number | null>(0);

  plans: Plan[] = [
    {
      id: 'basico',
      name: 'Básico',
      price: 29.90,
      description: 'Perfeito para iniciar sua agenda digital',
      features: [
        'Até 50 agendamentos/mês',
        '1 funcionário',
        'Agenda semanal',
        'Notificações por email',
        'Suporte por email'
      ],
      highlighted: false,
      color: '#10b981'
    },
    {
      id: 'profissional',
      name: 'Profissional',
      price: 49.90,
      description: 'Ideal para negócios em crescimento',
      features: [
        'Agendamentos ilimitados',
        'Até 5 funcionários',
        'Agenda completa',
        'Notificações SMS e email',
        'Controle financeiro',
        'Relatórios detalhados',
        'Suporte prioritário'
      ],
      highlighted: true,
      color: '#7c3aed'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 89.90,
      description: 'Para estabelecimentos completos',
      features: [
        'Tudo do Profissional',
        'Funcionários ilimitados',
        'Múltiplas unidades',
        'API personalizada',
        'App personalizado',
        'Treinamento dedicado',
        'Suporte 24/7',
        'Gerente de conta'
      ],
      highlighted: false,
      color: '#f59e0b'
    }
  ];

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  /**
   * Quando o usuário seleciona um plano, ativa a conta e redireciona para o dashboard
   */
  selectPlan(planId: PlanType) {
    if (planId) {
      // Limpa a preferência salva, pois o usuário fez uma escolha definitiva
      this.planPreferenceService.clearPreference();
      
      // Ativa a conta com o plano escolhido
      this.accountService.activateAccount(planId);
      
      // Redireciona para o dashboard (agora desbloqueado)
      this.router.navigate(['/dashboard']);
    }
  }
  
  /**
   * Verifica se um plano está pré-selecionado
   */
  isPlanSelected(planId: PlanType): boolean {
    return this.selectedPlanId() === planId;
  }
  
  /**
   * Retorna o nome amigável do plano
   */
  getPlanName(planId: PlanType | null): string {
    if (!planId) return '';
    const names: Record<string, string> = {
      'basico': 'Básico',
      'profissional': 'Profissional',
      'premium': 'Premium'
    };
    return names[planId] || '';
  }

  setBillingPeriod(period: 'monthly' | 'yearly') {
    this.billingPeriod.set(period);
  }

  toggleMenu() {
    this.router.navigate(['/dashboard']);
  }

  joinNow() {
    // Scroll to plans or trigger signup
    const plansContainer = document.querySelector('.plans-container');
    if (plansContainer) {
      plansContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  toggleFaq(index: number) {
    if (this.openFaq() === index) {
      this.openFaq.set(null);
    } else {
      this.openFaq.set(index);
    }
  }

  getPlanPrice(plan: Plan): number {
    if (this.billingPeriod() === 'yearly') {
      // Desconto de 20% para plano anual
      return plan.price * 0.8;
    }
    return plan.price;
  }

  getYearlyDiscount(): string {
    return '20%';
  }
}

