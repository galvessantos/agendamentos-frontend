import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { ActivationBannerComponent } from '../../components/activation-banner/activation-banner.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ActivationBannerComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent {
  accountService = inject(AccountService);
  private router = inject(Router);
  showTour = signal(true);
  showPlanAlert = signal(true);
  sidebarOpen = signal(false);
  

  todayDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  // Filtro de período
  periodoSelecionado = signal<string>('mes-atual');
  showCustomDatePicker = signal(false);
  customStartDate = '';
  customEndDate = '';
  
  periodos = [
    { value: 'hoje', label: 'Hoje' },
    { value: 'semana-atual', label: 'Esta Semana' },
    { value: 'mes-atual', label: 'Este Mês' },
    { value: 'ano', label: 'Este Ano' }
  ];

  // Dados por período
  dadosPorPeriodo: { [key: string]: any } = {
    'hoje': {
      agendamentos: 5,
      agendamentosAnterior: 7,
      novosClientes: 2,
      receita: 580.00,
      atividade: 5,
      totalAgendamentos: 5,
      profileStats: { agendamentos: 5, clientes: 89, servicos: 12 }
    },
    'semana-atual': {
      agendamentos: 28,
      agendamentosAnterior: 32,
      novosClientes: 5,
      receita: 3420.00,
      atividade: 18,
      totalAgendamentos: 28,
      profileStats: { agendamentos: 28, clientes: 89, servicos: 12 }
    },
    'mes-atual': {
      agendamentos: 127,
      agendamentosAnterior: 113,
      novosClientes: 23,
      receita: 15480.50,
      atividade: 89,
      totalAgendamentos: 342,
      profileStats: { agendamentos: 127, clientes: 89, servicos: 12 }
    },
    'mes-anterior': {
      agendamentos: 113,
      agendamentosAnterior: 98,
      novosClientes: 18,
      receita: 12850.00,
      atividade: 75,
      totalAgendamentos: 215,
      profileStats: { agendamentos: 113, clientes: 71, servicos: 12 }
    },
    'trimestre': {
      agendamentos: 385,
      agendamentosAnterior: 342,
      novosClientes: 68,
      receita: 46850.75,
      atividade: 267,
      totalAgendamentos: 1027,
      profileStats: { agendamentos: 385, clientes: 156, servicos: 12 }
    },
    'ano': {
      agendamentos: 1523,
      agendamentosAnterior: 1289,
      novosClientes: 287,
      receita: 185420.00,
      atividade: 1056,
      totalAgendamentos: 4056,
      profileStats: { agendamentos: 1523, clientes: 623, servicos: 12 }
    }
  };

  // Dados computados baseados no período selecionado
  dadosAtuais = computed(() => {
    return this.dadosPorPeriodo[this.periodoSelecionado()] || this.dadosPorPeriodo['mes-atual'];
  });

  // Calcula a porcentagem de variação
  getVariacaoAgendamentos(): number {
    if (this.accountService.isAccountInactive()) return 0;
    const dados = this.dadosAtuais();
    if (dados.agendamentosAnterior === 0) return 0;
    return ((dados.agendamentos - dados.agendamentosAnterior) / dados.agendamentosAnterior) * 100;
  }

  getVariacaoAgendamentosFormatada(): string {
    const variacao = this.getVariacaoAgendamentos();
    const sinal = variacao >= 0 ? '+' : '';
    return `${sinal}${variacao.toFixed(1)}%`;
  }

  isVariacaoPositiva(): boolean {
    return this.getVariacaoAgendamentos() >= 0;
  }

  // Getters para os dados atuais
  get agendamentosMes(): number {
    if (this.accountService.isAccountInactive()) return 0;
    return this.dadosAtuais().agendamentos;
  }

  get novosClientes(): number {
    if (this.accountService.isAccountInactive()) return 0;
    return this.dadosAtuais().novosClientes;
  }

  get receita(): number {
    if (this.accountService.isAccountInactive()) return 0;
    return this.dadosAtuais().receita;
  }

  get atividade(): number {
    if (this.accountService.isAccountInactive()) return 0;
    return this.dadosAtuais().atividade;
  }

  get totalAgendamentos(): number {
    if (this.accountService.isAccountInactive()) return 0;
    return this.dadosAtuais().totalAgendamentos;
  }

  get profileStats(): any {
    if (this.accountService.isAccountInactive()) {
      return { agendamentos: 0, clientes: 0, servicos: 0 };
    }
    return this.dadosAtuais().profileStats;
  }

  chartAnimationKey = signal(0);
  
  // Cache para paths anteriores para morphing suave
  private previousPaths = {
    sparkline: '',
    growth: '',
    revenue: ''
  };
  
  private morphingInProgress = false;

  selectPeriodo(periodo: string) {
    this.periodoSelecionado.set(periodo);
    this.showCustomDatePicker.set(false);
    this.chartAnimationKey.set(this.chartAnimationKey() + 1);
  }

  toggleCustomDatePicker() {
    this.showCustomDatePicker.set(!this.showCustomDatePicker());
  }

  applyCustomDate() {
    if (this.customStartDate && this.customEndDate) {
      // Lógica para aplicar data personalizada
      // Por enquanto, vamos apenas fechar o picker
      this.showCustomDatePicker.set(false);
      this.chartAnimationKey.set(this.chartAnimationKey() + 1);
    }
  }

  getPeriodoLabel(): string {
    const periodo = this.periodoSelecionado();
    const labels: { [key: string]: string } = {
      'hoje': 'de Hoje',
      'semana-atual': 'desta Semana',
      'mes-atual': 'deste Mês',
      'mes-anterior': 'do Mês Anterior',
      'trimestre': 'deste Trimestre',
      'ano': 'deste Ano'
    };
    return labels[periodo] || 'deste Mês';
  }

  getChartData(): Array<{ 
    label: string; 
    total: number; 
    finalizados: number; 
    pendentes: number; 
    height: number; 
    finalizadosHeight: number;
    pendentesHeight: number;
    isCurrent: boolean 
  }> {
    if (this.accountService.isAccountInactive()) {
      const periodo = this.periodoSelecionado();
      if (periodo === 'hoje') {
        const hours = ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h'];
        return hours.map((label) => ({
          label,
          total: 0,
          finalizados: 0,
          pendentes: 0,
          height: 0,
          finalizadosHeight: 0,
          pendentesHeight: 0,
          isCurrent: false
        }));
      } else if (periodo === 'semana-atual') {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return days.map((label) => ({
          label,
          total: 0,
          finalizados: 0,
          pendentes: 0,
          height: 0,
          finalizadosHeight: 0,
          pendentesHeight: 0,
          isCurrent: false
        }));
      } else if (periodo === 'mes-atual') {
        const weeks = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        return weeks.map((label) => ({
          label,
          total: 0,
          finalizados: 0,
          pendentes: 0,
          height: 0,
          finalizadosHeight: 0,
          pendentesHeight: 0,
          isCurrent: false
        }));
      } else {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return months.map((label) => ({
          label,
          total: 0,
          finalizados: 0,
          pendentes: 0,
          height: 0,
          finalizadosHeight: 0,
          pendentesHeight: 0,
          isCurrent: false
        }));
      }
    }
    
    const periodo = this.periodoSelecionado();
    
    if (periodo === 'hoje') {
      const hours = ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h'];
      const totals = [0, 2, 0, 3, 0, 4, 0, 5, 6, 0];
      const finalizados = totals.map(t => Math.floor(t * 0.95));
      const pendentes = totals.map(t => Math.floor(t * 0.05));
      const max = Math.max(...totals, 1);
      const currentHour = new Date().getHours();
      const currentIndex = currentHour >= 8 && currentHour <= 17 ? currentHour - 8 : 5;
      return hours.map((label, i) => ({
        label,
        total: totals[i],
        finalizados: finalizados[i],
        pendentes: pendentes[i],
        height: (totals[i] / max) * 100,
        finalizadosHeight: totals[i] > 0 ? (finalizados[i] / totals[i]) * 100 : 0,
        pendentesHeight: totals[i] > 0 ? (pendentes[i] / totals[i]) * 100 : 0,
        isCurrent: i === currentIndex
      }));
    } else if (periodo === 'semana-atual') {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const totals = [2, 5, 4, 6, 4, 3, 4];
      const finalizados = totals.map(t => Math.floor(t * 0.95));
      const pendentes = totals.map(t => Math.floor(t * 0.05));
      const max = Math.max(...totals);
      return days.map((label, i) => ({
        label,
        total: totals[i],
        finalizados: finalizados[i],
        pendentes: pendentes[i],
        height: (totals[i] / max) * 100,
        finalizadosHeight: totals[i] > 0 ? (finalizados[i] / totals[i]) * 100 : 0,
        pendentesHeight: totals[i] > 0 ? (pendentes[i] / totals[i]) * 100 : 0,
        isCurrent: i === 5
      }));
    } else if (periodo === 'mes-atual') {
      const weeks = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
      const totals = [28, 32, 35, 32];
      const finalizados = totals.map(t => Math.floor(t * 0.95));
      const pendentes = totals.map(t => Math.floor(t * 0.05));
      const max = Math.max(...totals);
      return weeks.map((label, i) => ({
        label,
        total: totals[i],
        finalizados: finalizados[i],
        pendentes: pendentes[i],
        height: (totals[i] / max) * 100,
        finalizadosHeight: totals[i] > 0 ? (finalizados[i] / totals[i]) * 100 : 0,
        pendentesHeight: totals[i] > 0 ? (pendentes[i] / totals[i]) * 100 : 0,
        isCurrent: i === 3
      }));
    } else {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const totals = [95, 102, 118, 125, 132, 127, 135, 128, 140, 138, 145, 142];
      // Exemplo: alguns meses com mais pendentes para demonstrar
      const finalizados = totals.map((t, i) => {
        if (i === 11) return Math.floor(t * 0.5); // Dezembro: 50% finalizados, 50% pendentes
        return Math.floor(t * 0.95);
      });
      const pendentes = totals.map((t, i) => {
        if (i === 11) return Math.floor(t * 0.5); // Dezembro: 50% finalizados, 50% pendentes
        return Math.floor(t * 0.05);
      });
      const max = Math.max(...totals);
      return months.map((label, i) => ({
        label,
        total: totals[i],
        finalizados: finalizados[i],
        pendentes: pendentes[i],
        height: (totals[i] / max) * 100,
        finalizadosHeight: totals[i] > 0 ? (finalizados[i] / totals[i]) * 100 : 0,
        pendentesHeight: totals[i] > 0 ? (pendentes[i] / totals[i]) * 100 : 0,
        isCurrent: i === 11
      }));
    }
  }

  getFinalizados(): number {
    if (this.accountService.isAccountInactive()) return 0;
    return Math.floor(this.totalAgendamentos * 0.95);
  }

  getPendentes(): number {
    if (this.accountService.isAccountInactive()) return 0;
    return Math.floor(this.totalAgendamentos * 0.05);
  }

  getMediaAgendamentos(): number {
    if (this.accountService.isAccountInactive()) return 0;
    const periodo = this.periodoSelecionado();
    if (periodo === 'hoje') return Math.floor(this.totalAgendamentos / 6);
    if (periodo === 'semana-atual') return Math.floor(this.totalAgendamentos / 7);
    if (periodo === 'mes-atual') return Math.floor(this.totalAgendamentos / 4);
    return Math.floor(this.totalAgendamentos / 12);
  }

  getMaxValue(data: number[]): number {
    return Math.max(...data, 1);
  }

  // Smooth line path generator usando curvas Bezier (monotone)
  getSmoothLinePath(data: number[]): string {
    if (data.length === 0) return '';
    
    const max = Math.max(...data, 1);
    const points = data.map((value, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 35 - ((value / max) * 30)
    }));

    if (points.length === 1) {
      return `M ${points[0].x},${points[0].y}`;
    }

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calcular pontos de controle para curva Bezier suave
      const xMid = (current.x + next.x) / 2;
      
      // Cubic Bezier para suavização monotônica
      path += ` C ${xMid},${current.y} ${xMid},${next.y} ${next.x},${next.y}`;
    }

    return path;
  }

  getSmoothAreaPath(data: number[]): string {
    if (data.length === 0) return '';
    
    const linePath = this.getSmoothLinePath(data);
    if (!linePath) return '';
    
    // Adicionar o fechamento da área
    return `${linePath} L 100,40 L 0,40 Z`;
  }

  // Sparkline para Agendamentos (ritmo diário da semana)
  getSparklineData(): number[] {
    if (this.accountService.isAccountInactive()) {
      const periodo = this.periodoSelecionado();
      if (periodo === 'hoje') {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      } else if (periodo === 'semana-atual') {
        return [0, 0, 0, 0, 0, 0, 0];
      } else if (periodo === 'mes-atual') {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      } else {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }
    }
    const periodo = this.periodoSelecionado();
    if (periodo === 'hoje') {
      return [2, 3, 2, 4, 3, 5, 4, 6, 5, 4];
    } else if (periodo === 'semana-atual') {
      return [15, 18, 22, 19, 25, 28, 24];
    } else if (periodo === 'mes-atual') {
      return [85, 92, 88, 95, 102, 98, 105, 110, 115, 120, 125, 127];
    } else {
      return [980, 1020, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1420, 1480, 1523];
    }
  }


  // Growth line para Novos Clientes (crescimento acumulado)
  getGrowthData(): number[] {
    if (this.accountService.isAccountInactive()) {
      const periodo = this.periodoSelecionado();
      if (periodo === 'hoje') {
        return [0, 0, 0, 0, 0, 0, 0];
      } else if (periodo === 'semana-atual') {
        return [0, 0, 0, 0, 0, 0];
      } else if (periodo === 'mes-atual') {
        return [0, 0, 0, 0, 0, 0, 0];
      } else {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0];
      }
    }
    const periodo = this.periodoSelecionado();
    if (periodo === 'hoje') {
      return [0, 0, 1, 1, 2, 2, 2];
    } else if (periodo === 'semana-atual') {
      return [0, 1, 2, 3, 4, 5];
    } else if (periodo === 'mes-atual') {
      return [0, 3, 6, 10, 14, 18, 23];
    } else {
      return [0, 24, 52, 85, 125, 168, 215, 258, 287];
    }
  }


  // Revenue line para Receita (acumulação suave)
  getRevenueData(): number[] {
    if (this.accountService.isAccountInactive()) {
      const periodo = this.periodoSelecionado();
      if (periodo === 'hoje') {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      } else if (periodo === 'semana-atual') {
        return [0, 0, 0, 0, 0, 0, 0];
      } else if (periodo === 'mes-atual') {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      } else {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }
    }
    const periodo = this.periodoSelecionado();
    if (periodo === 'hoje') {
      return [0, 120, 280, 450, 680, 920, 1250, 1680, 2350, 3420];
    } else if (periodo === 'semana-atual') {
      return [0, 480, 1120, 1850, 2420, 2980, 3420];
    } else if (periodo === 'mes-atual') {
      return [0, 1250, 2800, 4500, 6800, 9200, 11500, 13200, 14100, 15480];
    } else {
      return [0, 15200, 32500, 51800, 72400, 95600, 118500, 142300, 163800, 185420];
    }
  }


  // Dados para os gráficos baseados no período
  getChartBars(): number[] {
    const periodo = this.periodoSelecionado();
    const dados = this.dadosAtuais();
    
    // Diferentes alturas baseadas no período
    if (periodo === 'semana-atual') {
      return [20, 35, 45, 50, 40, 30, 28];
    } else if (periodo === 'mes-atual') {
      return [45, 60, 35, 70, 50, 40, 55, 30, 65, 45, 50, 60];
    } else if (periodo === 'mes-anterior') {
      return [40, 55, 30, 65, 45, 35, 50, 25, 60, 40, 45, 55];
    } else if (periodo === 'trimestre') {
      return [60, 75, 80, 70, 85, 90, 75, 80, 85];
    } else {
      return [70, 75, 80, 85, 90, 88, 85, 90, 88, 92, 90, 95];
    }
  }

  getMiniBarChart(): number[] {
    const periodo = this.periodoSelecionado();
    if (periodo === 'semana-atual') {
      return [30, 50, 40, 60, 45, 35];
    } else if (periodo === 'mes-atual') {
      return [45, 60, 35, 70, 50, 40];
    } else if (periodo === 'mes-anterior') {
      return [40, 55, 30, 65, 45, 35];
    } else if (periodo === 'trimestre') {
      return [60, 75, 80, 70, 85, 90];
    } else {
      return [70, 75, 80, 85, 90, 88];
    }
  }

  getReceitaChart(): number[] {
    const periodo = this.periodoSelecionado();
    if (periodo === 'semana-atual') {
      return [25, 45, 35, 55, 40, 30];
    } else if (periodo === 'mes-atual') {
      return [30, 55, 25, 65, 40, 35];
    } else if (periodo === 'mes-anterior') {
      return [25, 50, 20, 60, 35, 30];
    } else if (periodo === 'trimestre') {
      return [50, 65, 70, 60, 75, 80];
    } else {
      return [60, 65, 70, 75, 80, 78];
    }
  }

  getHighlightedMonthIndex(): number {
    const periodo = this.periodoSelecionado();
    if (periodo === 'semana-atual' || periodo === 'mes-atual') {
      return 5; // Junho (mês atual)
    } else if (periodo === 'mes-anterior') {
      return 4; // Maio (mês anterior)
    } else if (periodo === 'trimestre') {
      return 8; // Setembro (último mês do trimestre)
    } else {
      return 11; // Dezembro (último mês do ano)
    }
  }

  private _transactions = [
    {
      name: 'João Silva - Corte de Cabelo',
      date: 'Hoje, 14:30',
      iconClass: 'icon-calendar',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      name: 'Maria Santos - Manicure',
      date: 'Hoje, 15:00',
      iconClass: 'icon-calendar',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      name: 'Pedro Costa - Barba',
      date: 'Hoje, 16:00',
      iconClass: 'icon-calendar',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      name: 'Ana Oliveira - Corte + Barba',
      date: 'Amanhã, 09:00',
      iconClass: 'icon-calendar',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      name: 'Carlos Mendes - Design de Sobrancelha',
      date: 'Amanhã, 10:30',
      iconClass: 'icon-calendar',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    }
  ];

  get transactions() {
    if (this.accountService.isAccountInactive()) {
      return [];
    }
    return this._transactions;
  }

  schedules = [
    {
      name: 'João Silva - Corte de Cabelo',
      time: '14:30'
    },
    {
      name: 'Maria Santos - Manicure',
      time: '15:00'
    },
    {
      name: 'Pedro Costa - Barba',
      time: '16:00'
    },
    {
      name: 'Fernanda Lima - Pedicure',
      time: '16:30'
    },
    {
      name: 'Roberto Alves - Corte + Barba',
      time: '17:00'
    }
  ];


  closeTour() {
    this.showTour.set(false);
  }

  closePlanAlert() {
    this.showPlanAlert.set(false);
  }

  goToPlans() {
    this.router.navigate(['/planos']);
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  logout(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    this.accountService.logout();
    this.router.navigate(['/']);
  }
}
