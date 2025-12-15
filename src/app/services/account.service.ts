import { Injectable, signal } from '@angular/core';

export type AccountStatus = 'inactive' | 'trial' | 'active';
export type PlanType = 'basico' | 'profissional' | 'premium' | null;

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly ACCOUNT_STATUS_KEY = 'accountStatus';
  private readonly SELECTED_PLAN_KEY = 'selectedPlan';

  // Signals para estado reativo
  accountStatus = signal<AccountStatus>(this.getStoredAccountStatus());
  selectedPlan = signal<PlanType>(this.getStoredPlan());

  constructor() {
    // Inicializa como inactive se não tiver valor
    if (!localStorage.getItem(this.ACCOUNT_STATUS_KEY)) {
      this.setAccountStatus('inactive');
    }
  }

  private getStoredAccountStatus(): AccountStatus {
    const stored = localStorage.getItem(this.ACCOUNT_STATUS_KEY);
    if (stored === 'inactive' || stored === 'trial' || stored === 'active') {
      return stored;
    }
    return 'inactive';
  }

  private getStoredPlan(): PlanType {
    const stored = localStorage.getItem(this.SELECTED_PLAN_KEY);
    if (stored === 'basico' || stored === 'profissional' || stored === 'premium') {
      return stored;
    }
    return null;
  }

  setAccountStatus(status: AccountStatus) {
    localStorage.setItem(this.ACCOUNT_STATUS_KEY, status);
    this.accountStatus.set(status);
  }

  setSelectedPlan(plan: PlanType) {
    localStorage.setItem(this.SELECTED_PLAN_KEY, plan || '');
    this.selectedPlan.set(plan);
  }

  activateAccount(plan: PlanType) {
    this.setSelectedPlan(plan);
    this.setAccountStatus('active');
  }

  isAccountActive(): boolean {
    return this.accountStatus() === 'active';
  }

  isAccountInactive(): boolean {
    return this.accountStatus() === 'inactive';
  }

  isAccountTrial(): boolean {
    return this.accountStatus() === 'trial';
  }

  // Dev helper - alternar status
  toggleStatusForDev() {
    const current = this.accountStatus();
    if (current === 'inactive') {
      this.setAccountStatus('active');
      this.setSelectedPlan('profissional');
    } else {
      this.setAccountStatus('inactive');
      this.setSelectedPlan(null);
    }
  }

  /**
   * Faz logout do usuário, limpando todos os dados da conta
   * e redirecionando para a landing page
   */
  logout(): void {
    console.log('AccountService.logout() iniciado');
    // Limpa o status da conta
    this.setAccountStatus('inactive');
    this.setSelectedPlan(null);
    
    // Limpa outros dados do localStorage relacionados à sessão
    localStorage.removeItem('accountStatus');
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('planPreference');
    localStorage.removeItem('planPreferenceSource');
    console.log('AccountService.logout() concluído - dados limpos');
  }
}


