import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { ActivationBannerComponent } from '../../components/activation-banner/activation-banner.component';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  ultimoServico: string;
  dataUltimoServico: Date;
  valorUltimoServico: number;
  diasSemAgendar: number;
  status: 'ativo' | 'recontato';
}

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ActivationBannerComponent],
  templateUrl: './clientes-page.component.html',
  styleUrls: ['./clientes-page.component.scss']
})
export class ClientesPageComponent {
  accountService = inject(AccountService);
  private router = inject(Router);
  selectedFilter = signal<string>('all');
  showAddModal = signal(false);
  showEditModal = signal(false);
  showRecontatoModal = signal(false);
  selectedCliente = signal<Cliente | null>(null);
  sidebarOpen = signal(false);
  searchTerm = signal<string>('');

  private _clientes: Cliente[] = [
    {
      id: '1',
      nome: 'Maria Silva',
      telefone: '(11) 11111-1111',
      email: 'maria.silva@email.com',
      ultimoServico: 'Corte de cabelo',
      dataUltimoServico: new Date('2024-01-15'),
      valorUltimoServico: 50.00,
      diasSemAgendar: 15,
      status: 'ativo'
    },
    {
      id: '2',
      nome: 'João Santos',
      telefone: '(11) 97654-3210',
      email: 'joao.santos@email.com',
      ultimoServico: 'Barba',
      dataUltimoServico: new Date('2024-01-10'),
      valorUltimoServico: 30.00,
      diasSemAgendar: 20,
      status: 'recontato'
    },
    {
      id: '3',
      nome: 'Ana Costa',
      telefone: '(11) 96543-2109',
      email: 'ana.costa@email.com',
      ultimoServico: 'Manicure',
      dataUltimoServico: new Date('2024-01-20'),
      valorUltimoServico: 35.00,
      diasSemAgendar: 5,
      status: 'ativo'
    }
  ];

  get clientes(): Cliente[] {
    if (this.accountService.isAccountInactive()) {
      // Mock de clientes para demonstração
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setDate(lastMonth.getDate() - 30);
      
      return [
        {
          id: 'mock-1',
          nome: 'Seu Cliente',
          telefone: '(00) 00000-0000',
          email: 'cliente@exemplo.com',
          ultimoServico: 'Seu Serviço',
          dataUltimoServico: lastWeek,
          valorUltimoServico: 50.00,
          diasSemAgendar: 7,
          status: 'ativo'
        },
        {
          id: 'mock-2',
          nome: 'Seu Cliente',
          telefone: '(00) 00000-0000',
          email: 'cliente@exemplo.com',
          ultimoServico: 'Seu Serviço',
          dataUltimoServico: lastMonth,
          valorUltimoServico: 50.00,
          diasSemAgendar: 30,
          status: 'recontato'
        }
      ];
    }
    return this._clientes;
  }

  novoCliente = {
    nome: '',
    telefone: '',
    email: '',
    ultimoServico: '',
    dataUltimoServico: '',
    valorUltimoServico: ''
  };

  recontatoData = {
    diasSemAgendar: 30,
    metodo: 'whatsapp' as 'whatsapp' | 'email',
    mensagem: ''
  };


  getFilteredClientes(): Cliente[] {
    let filtered = [...this.clientes];

    // Filtro por status
    if (this.selectedFilter() !== 'all') {
      filtered = filtered.filter(c => c.status === this.selectedFilter());
    }

    // Busca por nome, telefone ou email
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(c => 
        c.nome.toLowerCase().includes(search) ||
        c.telefone.includes(search) ||
        c.email.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  setFilter(filter: string) {
    this.selectedFilter.set(filter);
  }

  openAddModal() {
    this.novoCliente = {
      nome: '',
      telefone: '',
      email: '',
      ultimoServico: '',
      dataUltimoServico: '',
      valorUltimoServico: ''
    };
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  addCliente() {
    if (this.novoCliente.nome && this.novoCliente.telefone) {
      const diasSemAgendar = this.novoCliente.dataUltimoServico 
        ? Math.floor((new Date().getTime() - new Date(this.novoCliente.dataUltimoServico).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const novo: Cliente = {
        id: Date.now().toString(),
        nome: this.novoCliente.nome,
        telefone: this.novoCliente.telefone,
        email: this.novoCliente.email || '',
        ultimoServico: this.novoCliente.ultimoServico || 'Nenhum',
        dataUltimoServico: this.novoCliente.dataUltimoServico ? new Date(this.novoCliente.dataUltimoServico) : new Date(),
        valorUltimoServico: parseFloat(this.novoCliente.valorUltimoServico) || 0,
        diasSemAgendar: diasSemAgendar,
        status: diasSemAgendar > 30 ? 'recontato' : 'ativo'
      };

      this._clientes.push(novo);
      this.closeAddModal();
    }
  }

  openEditModal(cliente: Cliente) {
    this.selectedCliente.set(cliente);
    this.novoCliente = {
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      ultimoServico: cliente.ultimoServico,
      dataUltimoServico: cliente.dataUltimoServico.toISOString().split('T')[0],
      valorUltimoServico: cliente.valorUltimoServico.toString()
    };
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedCliente.set(null);
  }

  saveEdit() {
    const cliente = this.selectedCliente();
    if (cliente && this.novoCliente.nome && this.novoCliente.telefone) {
      const index = this._clientes.findIndex(c => c.id === cliente.id);
      if (index !== -1) {
        const diasSemAgendar = this.novoCliente.dataUltimoServico 
          ? Math.floor((new Date().getTime() - new Date(this.novoCliente.dataUltimoServico).getTime()) / (1000 * 60 * 60 * 24))
          : cliente.diasSemAgendar;

        this._clientes[index] = {
          ...this._clientes[index],
          nome: this.novoCliente.nome,
          telefone: this.novoCliente.telefone,
          email: this.novoCliente.email || '',
          ultimoServico: this.novoCliente.ultimoServico || 'Nenhum',
          dataUltimoServico: this.novoCliente.dataUltimoServico ? new Date(this.novoCliente.dataUltimoServico) : cliente.dataUltimoServico,
          valorUltimoServico: parseFloat(this.novoCliente.valorUltimoServico) || 0,
          diasSemAgendar: diasSemAgendar,
          status: diasSemAgendar > 30 ? 'recontato' : 'ativo'
        };
      }
      this.closeEditModal();
    }
  }

  openRecontatoModal(cliente: Cliente) {
    this.selectedCliente.set(cliente);
    this.recontatoData = {
      diasSemAgendar: cliente.diasSemAgendar,
      metodo: 'whatsapp',
      mensagem: `Olá ${cliente.nome}! Faz ${cliente.diasSemAgendar} dias que você não agenda um serviço conosco. Que tal marcar um horário?`
    };
    this.showRecontatoModal.set(true);
  }

  closeRecontatoModal() {
    this.showRecontatoModal.set(false);
    this.selectedCliente.set(null);
  }

  enviarRecontato() {
    const cliente = this.selectedCliente();
    if (cliente) {
      if (this.recontatoData.metodo === 'whatsapp') {
        const phone = cliente.telefone.replace(/\D/g, '');
        const message = encodeURIComponent(this.recontatoData.mensagem);
        window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
      } else {
        const subject = encodeURIComponent('Que tal agendar um serviço?');
        const body = encodeURIComponent(this.recontatoData.mensagem);
        window.location.href = `mailto:${cliente.email}?subject=${subject}&body=${body}`;
      }
      
      // Atualizar status do cliente
      const index = this._clientes.findIndex(c => c.id === cliente.id);
      if (index !== -1) {
        this._clientes[index].status = 'ativo';
      }
      
      this.closeRecontatoModal();
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ativo':
        return 'status-ativo';
      case 'recontato':
        return 'status-recontato';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'recontato':
        return 'Recontato';
      default:
        return '';
    }
  }

  deleteCliente(cliente: Cliente) {
    if (confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`)) {
      this._clientes = this._clientes.filter(c => c.id !== cliente.id);
    }
  }

  getTotalClientes(): number {
    return this.clientes.length;
  }

  getClientesAtivos(): number {
    return this.clientes.filter(c => c.status === 'ativo').length;
  }

  getClientesRecontato(): number {
    return this.clientes.filter(c => c.status === 'recontato').length;
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

