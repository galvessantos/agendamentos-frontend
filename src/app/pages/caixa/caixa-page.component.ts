import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { ActivationBannerComponent } from '../../components/activation-banner/activation-banner.component';

interface Lancamento {
  id: string;
  data: Date;
  agendamentoId?: string;
  clienteNome: string;
  funcionarioNome: string;
  servicoNome: string;
  valor: number;
  formaPagamento: 'pix' | 'dinheiro' | 'credito' | 'debito';
  observacao?: string;
}

interface FaturamentoFuncionario {
  funcionarioNome: string;
  totalServicos: number;
  faturamentoGerado: number;
}

@Component({
  selector: 'app-caixa-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ActivationBannerComponent],
  templateUrl: './caixa-page.component.html',
  styleUrls: ['./caixa-page.component.scss']
})
export class CaixaPageComponent {
  accountService = inject(AccountService);
  private router = inject(Router);
  showAddModal = signal(false);
  selectedPeriodo = signal<'dia' | 'semana' | 'mes' | 'custom'>('dia');
  selectedData = signal<Date>(new Date());
  sidebarOpen = signal(false);
  showFilterDropdown = signal(false);
  startDate: string = '';
  endDate: string = '';

  private _lancamentos: Lancamento[] = [
    {
      id: '1',
      data: new Date(),
      clienteNome: 'Maria Silva',
      funcionarioNome: 'João Silva',
      servicoNome: 'Corte de Cabelo',
      valor: 50.00,
      formaPagamento: 'pix',
      observacao: 'Cliente satisfeita'
    },
    {
      id: '2',
      data: new Date(),
      clienteNome: 'Pedro Santos',
      funcionarioNome: 'João Silva',
      servicoNome: 'Barba',
      valor: 30.00,
      formaPagamento: 'dinheiro'
    },
    {
      id: '3',
      data: new Date(),
      clienteNome: 'Ana Costa',
      funcionarioNome: 'Maria Santos',
      servicoNome: 'Manicure',
      valor: 35.00,
      formaPagamento: 'credito',
      observacao: 'Primeira vez no salão'
    },
    {
      id: '4',
      data: new Date(Date.now() - 86400000), // ontem
      clienteNome: 'Carlos Lima',
      funcionarioNome: 'João Silva',
      servicoNome: 'Corte de Cabelo',
      valor: 50.00,
      formaPagamento: 'debito'
    },
    {
      id: '5',
      data: new Date(Date.now() - 86400000),
      clienteNome: 'Julia Oliveira',
      funcionarioNome: 'Maria Santos',
      servicoNome: 'Pedicure',
      valor: 40.00,
      formaPagamento: 'pix'
    }
  ];

  get lancamentos(): Lancamento[] {
    if (this.accountService.isAccountInactive()) {
      // Mock de lançamentos para demonstração
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      return [
        {
          id: 'mock-1',
          data: today,
          clienteNome: 'Seu Cliente',
          funcionarioNome: 'Seu Funcionário',
          servicoNome: 'Seu Serviço',
          valor: 50.00,
          formaPagamento: 'pix' as const,
          observacao: 'Observação do lançamento'
        },
        {
          id: 'mock-2',
          data: today,
          clienteNome: 'Seu Cliente',
          funcionarioNome: 'Seu Funcionário',
          servicoNome: 'Seu Serviço',
          valor: 35.00,
          formaPagamento: 'dinheiro' as const
        },
        {
          id: 'mock-3',
          data: yesterday,
          clienteNome: 'Seu Cliente',
          funcionarioNome: 'Seu Funcionário',
          servicoNome: 'Seu Serviço',
          valor: 40.00,
          formaPagamento: 'credito' as const
        }
      ];
    }
    return this._lancamentos;
  }

  novoLancamento = {
    clienteNome: '',
    funcionarioNome: '',
    servicoNome: '',
    valor: '',
    formaPagamento: 'pix' as 'pix' | 'dinheiro' | 'credito' | 'debito',
    observacao: ''
  };


  toggleFilterDropdown() {
    this.showFilterDropdown.set(!this.showFilterDropdown());
  }

  applyQuickFilter(periodo: 'dia' | 'semana' | 'mes') {
    this.selectedPeriodo.set(periodo);
    this.startDate = '';
    this.endDate = '';
    this.showFilterDropdown.set(false);
  }

  applyCustomDates() {
    if (this.startDate && this.endDate) {
      this.selectedPeriodo.set('custom');
      this.showFilterDropdown.set(false);
    }
  }

  clearCustomDates() {
    this.startDate = '';
    this.endDate = '';
    this.selectedPeriodo.set('dia');
  }

  isCustomRange(): boolean {
    return this.selectedPeriodo() === 'custom';
  }

  getFilterLabel(): string {
    const periodo = this.selectedPeriodo();
    if (periodo === 'dia') return 'Hoje';
    if (periodo === 'semana') return 'Últimos 7 dias';
    if (periodo === 'mes') return 'Este Mês';
    if (periodo === 'custom' && this.startDate && this.endDate) {
      const start = new Date(this.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      const end = new Date(this.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      return `${start} - ${end}`;
    }
    return 'Selecionar período';
  }

  setPeriodo(periodo: 'dia' | 'semana' | 'mes') {
    this.selectedPeriodo.set(periodo);
  }

  getLancamentosFiltrados(): Lancamento[] {
    const now = new Date();
    const periodo = this.selectedPeriodo();
    
    return this.lancamentos.filter(l => {
      const dataLancamento = new Date(l.data);
      
      if (periodo === 'custom' && this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999);
        return dataLancamento >= start && dataLancamento <= end;
      }
      
      if (periodo === 'dia') {
        return this.isSameDay(dataLancamento, now);
      } else if (periodo === 'semana') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return dataLancamento >= weekAgo && dataLancamento <= now;
      } else { // mes
        return dataLancamento.getMonth() === now.getMonth() && 
               dataLancamento.getFullYear() === now.getFullYear();
      }
    });
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  getFaturamentoTotal(): number {
    return this.getLancamentosFiltrados().reduce((sum, l) => sum + l.valor, 0);
  }

  getTicketMedio(): number {
    const lancamentos = this.getLancamentosFiltrados();
    if (lancamentos.length === 0) return 0;
    return this.getFaturamentoTotal() / lancamentos.length;
  }

  getFaturamentoPorFormaPagamento(): { forma: string; valor: number; percentual: number }[] {
    const lancamentos = this.getLancamentosFiltrados();
    const total = this.getFaturamentoTotal();
    
    const formas = ['pix', 'dinheiro', 'credito', 'debito'];
    return formas.map(forma => {
      const valor = lancamentos
        .filter(l => l.formaPagamento === forma)
        .reduce((sum, l) => sum + l.valor, 0);
      
      return {
        forma: this.getFormaPagamentoLabel(forma as any),
        valor,
        percentual: total > 0 ? (valor / total) * 100 : 0
      };
    }).filter(f => f.valor > 0);
  }

  getFaturamentoPorFuncionario(): FaturamentoFuncionario[] {
    const lancamentos = this.getLancamentosFiltrados();
    const funcionarios: { [key: string]: { total: number; servicos: number } } = {};
    
    lancamentos.forEach(l => {
      if (!funcionarios[l.funcionarioNome]) {
        funcionarios[l.funcionarioNome] = { total: 0, servicos: 0 };
      }
      funcionarios[l.funcionarioNome].total += l.valor;
      funcionarios[l.funcionarioNome].servicos++;
    });
    
    return Object.entries(funcionarios).map(([nome, dados]) => ({
      funcionarioNome: nome,
      totalServicos: dados.servicos,
      faturamentoGerado: dados.total
    })).sort((a, b) => b.faturamentoGerado - a.faturamentoGerado);
  }

  getFaturamentoPorServico(): { servico: string; quantidade: number; valor: number }[] {
    const lancamentos = this.getLancamentosFiltrados();
    const servicos: { [key: string]: { qtd: number; total: number } } = {};
    
    lancamentos.forEach(l => {
      if (!servicos[l.servicoNome]) {
        servicos[l.servicoNome] = { qtd: 0, total: 0 };
      }
      servicos[l.servicoNome].qtd++;
      servicos[l.servicoNome].total += l.valor;
    });
    
    return Object.entries(servicos).map(([servico, dados]) => ({
      servico,
      quantidade: dados.qtd,
      valor: dados.total
    })).sort((a, b) => b.valor - a.valor);
  }

  openAddModal() {
    this.novoLancamento = {
      clienteNome: '',
      funcionarioNome: '',
      servicoNome: '',
      valor: '',
      formaPagamento: 'pix',
      observacao: ''
    };
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  addLancamento() {
    if (this.novoLancamento.clienteNome && this.novoLancamento.funcionarioNome && 
        this.novoLancamento.servicoNome && this.novoLancamento.valor) {
      const novo: Lancamento = {
        id: Date.now().toString(),
        data: new Date(),
        clienteNome: this.novoLancamento.clienteNome,
        funcionarioNome: this.novoLancamento.funcionarioNome,
        servicoNome: this.novoLancamento.servicoNome,
        valor: parseFloat(this.novoLancamento.valor),
        formaPagamento: this.novoLancamento.formaPagamento,
        observacao: this.novoLancamento.observacao || undefined
      };

      this._lancamentos.unshift(novo);
      this.closeAddModal();
    }
  }

  deleteLancamento(lancamento: Lancamento) {
    if (confirm(`Tem certeza que deseja excluir este lançamento?`)) {
      this._lancamentos = this._lancamentos.filter(l => l.id !== lancamento.id);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFormaPagamentoLabel(forma: string): string {
    const labels: { [key: string]: string } = {
      'pix': 'PIX',
      'dinheiro': 'Dinheiro',
      'credito': 'Cartão Crédito',
      'debito': 'Cartão Débito'
    };
    return labels[forma] || forma;
  }

  getFormaPagamentoClass(forma: string): string {
    const classes: { [key: string]: string } = {
      'pix': 'forma-pix',
      'dinheiro': 'forma-dinheiro',
      'credito': 'forma-credito',
      'debito': 'forma-debito'
    };
    return classes[forma] || '';
  }

  getPeriodoLabel(): string {
    const periodo = this.selectedPeriodo();
    
    if (periodo === 'custom' && this.startDate && this.endDate) {
      const start = new Date(this.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      const end = new Date(this.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      return `${start} - ${end}`;
    }
    
    const labels: Record<'dia' | 'semana' | 'mes', string> = {
      'dia': 'Hoje',
      'semana': 'Últimos 7 dias',
      'mes': 'Este mês'
    };
    
    return labels[periodo as 'dia' | 'semana' | 'mes'] || 'Período personalizado';
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  logout() {
    this.accountService.logout();
    this.router.navigate(['/']);
  }
}

