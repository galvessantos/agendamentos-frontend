import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { ActivationBannerComponent } from '../../components/activation-banner/activation-banner.component';

interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: number; // em minutos
  descricao?: string;
}

@Component({
  selector: 'app-servicos-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ActivationBannerComponent],
  templateUrl: './servicos-page.component.html',
  styleUrls: ['./servicos-page.component.scss']
})
export class ServicosPageComponent {
  accountService = inject(AccountService);
  private router = inject(Router);
  showAddModal = signal(false);
  showEditModal = signal(false);
  selectedServico = signal<Servico | null>(null);
  searchTerm = signal<string>('');
  sidebarOpen = signal(false);

  private _servicos: Servico[] = [
    {
      id: '1',
      nome: 'Corte de Cabelo',
      preco: 50.00,
      duracao: 45,
      descricao: 'Corte masculino ou feminino com acabamento'
    },
    {
      id: '2',
      nome: 'Barba',
      preco: 30.00,
      duracao: 30,
      descricao: 'Design e acabamento de barba'
    },
    {
      id: '3',
      nome: 'Manicure',
      preco: 35.00,
      duracao: 60,
      descricao: 'Cuidados com as unhas das mãos'
    },
    {
      id: '4',
      nome: 'Pedicure',
      preco: 40.00,
      duracao: 60,
      descricao: 'Cuidados com as unhas dos pés'
    }
  ];

  get servicos(): Servico[] {
    if (this.accountService.isAccountInactive()) {
      // Mock de serviços para demonstração
      return [
        {
          id: 'mock-1',
          nome: 'Seu Serviço',
          preco: 50.00,
          duracao: 45,
          descricao: 'Descrição do seu serviço'
        },
        {
          id: 'mock-2',
          nome: 'Seu Serviço',
          preco: 35.00,
          duracao: 30,
          descricao: 'Descrição do seu serviço'
        },
        {
          id: 'mock-3',
          nome: 'Seu Serviço',
          preco: 40.00,
          duracao: 60,
          descricao: 'Descrição do seu serviço'
        }
      ];
    }
    return this._servicos;
  }

  novoServico = {
    nome: '',
    preco: '',
    duracao: '',
    descricao: ''
  };


  getFilteredServicos(): Servico[] {
    let filtered = [...this.servicos];

    // Busca por nome ou descrição
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(s => 
        s.nome.toLowerCase().includes(search) ||
        (s.descricao && s.descricao.toLowerCase().includes(search))
      );
    }

    return filtered;
  }

  openAddModal() {
    this.novoServico = {
      nome: '',
      preco: '',
      duracao: '',
      descricao: ''
    };
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  addServico() {
    if (this.novoServico.nome && this.novoServico.preco && this.novoServico.duracao) {
      const novo: Servico = {
        id: Date.now().toString(),
        nome: this.novoServico.nome,
        preco: parseFloat(this.novoServico.preco),
        duracao: parseInt(this.novoServico.duracao),
        descricao: this.novoServico.descricao || undefined
      };

      this._servicos.push(novo);
      this.closeAddModal();
    }
  }

  openEditModal(servico: Servico) {
    this.selectedServico.set(servico);
    this.novoServico = {
      nome: servico.nome,
      preco: servico.preco.toString(),
      duracao: servico.duracao.toString(),
      descricao: servico.descricao || ''
    };
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedServico.set(null);
  }

  saveEdit() {
    const servico = this.selectedServico();
    if (servico && this.novoServico.nome && this.novoServico.preco && this.novoServico.duracao) {
      const index = this._servicos.findIndex(s => s.id === servico.id);
      if (index !== -1) {
        this._servicos[index] = {
          ...this._servicos[index],
          nome: this.novoServico.nome,
          preco: parseFloat(this.novoServico.preco),
          duracao: parseInt(this.novoServico.duracao),
          descricao: this.novoServico.descricao || undefined
        };
      }
      this.closeEditModal();
    }
  }

  deleteServico(servico: Servico) {
    if (confirm(`Tem certeza que deseja excluir o serviço "${servico.nome}"?`)) {
      this._servicos = this._servicos.filter(s => s.id !== servico.id);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}min`;
  }

  getTotalServicos(): number {
    return this.servicos.length;
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

