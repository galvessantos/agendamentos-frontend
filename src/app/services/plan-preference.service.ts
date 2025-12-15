import { Injectable, signal, computed } from '@angular/core';
import { AccountService, PlanType } from './account.service';

/**
 * Serviço para gerenciar a preferência de plano selecionada pelo usuário
 * antes de iniciar o cadastro. Essa preferência é lembrada durante o onboarding
 * e pré-selecionada na etapa final de escolha de plano.
 */
@Injectable({
  providedIn: 'root'
})
export class PlanPreferenceService {
  private readonly STORAGE_KEY = 'planPreference';
  private readonly STORAGE_KEY_SOURCE = 'planPreferenceSource'; // 'planos' ou 'landing'
  
  // Signal para a preferência de plano
  private _preferredPlan = signal<PlanType | null>(
    this.getStoredPreference()
  );
  
  // Signal para a origem da preferência (de onde o usuário veio)
  private _preferenceSource = signal<'planos' | 'landing' | null>(
    this.getStoredSource()
  );

  // Computed para verificar se há uma preferência salva
  hasPreference = computed(() => this._preferredPlan() !== null);

  constructor() {}

  /**
   * Salva a preferência de plano selecionada
   * @param planId ID do plano selecionado
   * @param source Origem da seleção ('planos' ou 'landing')
   */
  setPreferredPlan(planId: PlanType, source: 'planos' | 'landing' = 'planos'): void {
    this._preferredPlan.set(planId);
    this._preferenceSource.set(source);
    localStorage.setItem(this.STORAGE_KEY, planId || '');
    localStorage.setItem(this.STORAGE_KEY_SOURCE, source);
  }

  /**
   * Retorna a preferência de plano salva
   */
  getPreferredPlan(): PlanType | null {
    return this._preferredPlan();
  }

  /**
   * Retorna a origem da preferência
   */
  getPreferenceSource(): 'planos' | 'landing' | null {
    return this._preferenceSource();
  }

  /**
   * Limpa a preferência salva (útil após o cadastro ser concluído)
   */
  clearPreference(): void {
    this._preferredPlan.set(null);
    this._preferenceSource.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_KEY_SOURCE);
  }

  /**
   * Lê a preferência do localStorage
   */
  private getStoredPreference(): PlanType | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored && ['basico', 'profissional', 'premium'].includes(stored)) {
      return stored as PlanType;
    }
    return null;
  }

  /**
   * Lê a origem da preferência do localStorage
   */
  private getStoredSource(): 'planos' | 'landing' | null {
    const stored = localStorage.getItem(this.STORAGE_KEY_SOURCE);
    if (stored === 'planos' || stored === 'landing') {
      return stored;
    }
    return null;
  }
}



