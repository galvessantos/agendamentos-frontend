import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { ActivationBannerComponent } from '../../components/activation-banner/activation-banner.component';

interface HorarioDia {
  dia: string;
  ativo: boolean;
  inicio: string;
  fim: string;
  pausaInicio?: string;
  pausaFim?: string;
}

interface Excecao {
  id: string;
  data: string;
  tipo: 'folga' | 'horario_especial';
  inicio?: string;
  fim?: string;
  motivo?: string;
}

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  foto?: string;
  servicosRealizados: string[];
  status: 'ativo' | 'inativo';
  horarios: HorarioDia[];
  excecoes: Excecao[];
}

@Component({
  selector: 'app-funcionarios-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ActivationBannerComponent],
  templateUrl: './funcionarios-page.component.html',
  styleUrls: ['./funcionarios-page.component.scss']
})
export class FuncionariosPageComponent {
  accountService = inject(AccountService);
  private router = inject(Router);
  showAddModal = signal(false);
  showEditModal = signal(false);
  showHorariosModal = signal(false);
  showExcecaoModal = signal(false);
  selectedFuncionario = signal<Funcionario | null>(null);
  searchTerm = signal<string>('');
  selectedFilter = signal<string>('all');
  sidebarOpen = signal(false);
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  servicosDisponiveis = [
    'Corte de Cabelo',
    'Barba',
    'Manicure',
    'Pedicure',
    'Design de Sobrancelha',
    'Massagem'
  ];

  private _funcionarios: Funcionario[] = [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '(11) 11111-1111',
      servicosRealizados: ['Corte de Cabelo', 'Barba'],
      status: 'ativo',
      horarios: [
        { dia: 'Segunda', ativo: true, inicio: '09:00', fim: '18:00', pausaInicio: '12:00', pausaFim: '13:00' },
        { dia: 'Terça', ativo: true, inicio: '09:00', fim: '18:00', pausaInicio: '12:00', pausaFim: '13:00' },
        { dia: 'Quarta', ativo: false, inicio: '', fim: '' },
        { dia: 'Quinta', ativo: true, inicio: '13:00', fim: '20:00' },
        { dia: 'Sexta', ativo: true, inicio: '09:00', fim: '18:00', pausaInicio: '12:00', pausaFim: '13:00' },
        { dia: 'Sábado', ativo: true, inicio: '09:00', fim: '14:00' },
        { dia: 'Domingo', ativo: false, inicio: '', fim: '' }
      ],
      excecoes: []
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@example.com',
      telefone: '(11) 97654-3210',
      servicosRealizados: ['Manicure', 'Pedicure', 'Design de Sobrancelha'],
      status: 'ativo',
      horarios: [
        { dia: 'Segunda', ativo: true, inicio: '08:00', fim: '17:00', pausaInicio: '12:00', pausaFim: '13:00' },
        { dia: 'Terça', ativo: true, inicio: '08:00', fim: '17:00', pausaInicio: '12:00', pausaFim: '13:00' },
        { dia: 'Quarta', ativo: true, inicio: '08:00', fim: '17:00', pausaInicio: '12:00', pausaFim: '13:00' },
        { dia: 'Quinta', ativo: true, inicio: '08:00', fim: '17:00', pausaInicio: '12:00', pausaFim: '13:00' },
        { dia: 'Sexta', ativo: true, inicio: '08:00', fim: '17:00', pausaInicio: '12:00', pausaFim: '13:00' },
        { dia: 'Sábado', ativo: true, inicio: '08:00', fim: '13:00' },
        { dia: 'Domingo', ativo: false, inicio: '', fim: '' }
      ],
      excecoes: []
    }
  ];

  get funcionarios(): Funcionario[] {
    if (this.accountService.isAccountInactive()) {
      // Mock de funcionários para demonstração
      return [
        {
          id: 'mock-1',
          nome: 'Seu Funcionário',
          email: 'funcionario@exemplo.com',
          telefone: '(00) 00000-0000',
          servicosRealizados: ['Seu Serviço'],
          status: 'ativo',
          horarios: [
            { dia: 'Segunda', ativo: true, inicio: '09:00', fim: '18:00', pausaInicio: '12:00', pausaFim: '13:00' },
            { dia: 'Terça', ativo: true, inicio: '09:00', fim: '18:00', pausaInicio: '12:00', pausaFim: '13:00' },
            { dia: 'Quarta', ativo: true, inicio: '09:00', fim: '18:00', pausaInicio: '12:00', pausaFim: '13:00' },
            { dia: 'Quinta', ativo: true, inicio: '09:00', fim: '18:00', pausaInicio: '12:00', pausaFim: '13:00' },
            { dia: 'Sexta', ativo: true, inicio: '09:00', fim: '18:00', pausaInicio: '12:00', pausaFim: '13:00' },
            { dia: 'Sábado', ativo: true, inicio: '09:00', fim: '14:00' },
            { dia: 'Domingo', ativo: false, inicio: '', fim: '' }
          ],
          excecoes: []
        },
        {
          id: 'mock-2',
          nome: 'Seu Funcionário',
          email: 'funcionario@exemplo.com',
          telefone: '(00) 00000-0000',
          servicosRealizados: ['Seu Serviço'],
          status: 'inativo',
          horarios: [
            { dia: 'Segunda', ativo: false, inicio: '', fim: '' },
            { dia: 'Terça', ativo: false, inicio: '', fim: '' },
            { dia: 'Quarta', ativo: false, inicio: '', fim: '' },
            { dia: 'Quinta', ativo: false, inicio: '', fim: '' },
            { dia: 'Sexta', ativo: false, inicio: '', fim: '' },
            { dia: 'Sábado', ativo: false, inicio: '', fim: '' },
            { dia: 'Domingo', ativo: false, inicio: '', fim: '' }
          ],
          excecoes: []
        }
      ];
    }
    return this._funcionarios;
  }

  novoFuncionario = {
    nome: '',
    email: '',
    telefone: '',
    foto: undefined as string | undefined,
    servicosRealizados: [] as string[],
    status: 'ativo' as 'ativo' | 'inativo'
  };

  novaExcecao = {
    data: '',
    tipo: 'folga' as 'folga' | 'horario_especial',
    inicio: '',
    fim: '',
    motivo: ''
  };


  getFilteredFuncionarios(): Funcionario[] {
    let filtered = [...this.funcionarios];

    // Filtro por status
    if (this.selectedFilter() !== 'all') {
      filtered = filtered.filter(f => f.status === this.selectedFilter());
    }

    // Busca por nome, email ou telefone
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(f => 
        f.nome.toLowerCase().includes(search) ||
        f.email.toLowerCase().includes(search) ||
        f.telefone.includes(search)
      );
    }

    return filtered;
  }

  setFilter(filter: string) {
    this.selectedFilter.set(filter);
  }

  toggleServico(servico: string) {
    const index = this.novoFuncionario.servicosRealizados.indexOf(servico);
    if (index === -1) {
      this.novoFuncionario.servicosRealizados.push(servico);
    } else {
      this.novoFuncionario.servicosRealizados.splice(index, 1);
    }
  }

  isServicoSelected(servico: string): boolean {
    return this.novoFuncionario.servicosRealizados.includes(servico);
  }

  openAddModal() {
    this.novoFuncionario = {
      nome: '',
      email: '',
      telefone: '',
      foto: undefined,
      servicosRealizados: [],
      status: 'ativo'
    };
    this.selectedFile = null;
    this.previewUrl = null;
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.selectedFile = null;
    this.previewUrl = null;
  }

  addFuncionario() {
    if (this.novoFuncionario.nome && this.novoFuncionario.servicosRealizados.length > 0) {
      const novo: Funcionario = {
        id: Date.now().toString(),
        nome: this.novoFuncionario.nome,
        email: this.novoFuncionario.email,
        telefone: this.novoFuncionario.telefone,
        foto: this.previewUrl || this.novoFuncionario.foto,
        servicosRealizados: [...this.novoFuncionario.servicosRealizados],
        status: this.novoFuncionario.status,
        horarios: this.diasSemana.map(dia => ({
          dia,
          ativo: false,
          inicio: '',
          fim: ''
        })),
        excecoes: []
      };

      this._funcionarios.push(novo);
      this.closeAddModal();
    }
  }

  openEditModal(funcionario: Funcionario) {
    this.selectedFuncionario.set(funcionario);
    this.novoFuncionario = {
      nome: funcionario.nome,
      email: funcionario.email,
      telefone: funcionario.telefone,
      foto: funcionario.foto,
      servicosRealizados: [...funcionario.servicosRealizados],
      status: funcionario.status
    };
    this.previewUrl = funcionario.foto || null;
    this.selectedFile = null;
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedFuncionario.set(null);
    this.selectedFile = null;
    this.previewUrl = null;
  }

  saveEdit() {
    const funcionario = this.selectedFuncionario();
    if (funcionario && this.novoFuncionario.nome && this.novoFuncionario.servicosRealizados.length > 0) {
      const index = this._funcionarios.findIndex(f => f.id === funcionario.id);
      if (index !== -1) {
        this._funcionarios[index] = {
          ...this._funcionarios[index],
          nome: this.novoFuncionario.nome,
          email: this.novoFuncionario.email,
          telefone: this.novoFuncionario.telefone,
          foto: this.previewUrl || this.novoFuncionario.foto,
          servicosRealizados: [...this.novoFuncionario.servicosRealizados],
          status: this.novoFuncionario.status
        };
      }
      this.closeEditModal();
    }
  }

  openHorariosModal(funcionario: Funcionario) {
    this.selectedFuncionario.set(funcionario);
    this.showHorariosModal.set(true);
  }

  closeHorariosModal() {
    this.showHorariosModal.set(false);
    this.selectedFuncionario.set(null);
  }

  saveHorarios() {
    const funcionario = this.selectedFuncionario();
    if (funcionario) {
      const index = this._funcionarios.findIndex(f => f.id === funcionario.id);
      if (index !== -1) {
        this._funcionarios[index].horarios = [...funcionario.horarios];
        this._funcionarios[index].excecoes = [...funcionario.excecoes];
      }
      this.closeHorariosModal();
    }
  }

  openExcecaoModal() {
    this.novaExcecao = {
      data: '',
      tipo: 'folga',
      inicio: '',
      fim: '',
      motivo: ''
    };
    this.showExcecaoModal.set(true);
  }

  closeExcecaoModal() {
    this.showExcecaoModal.set(false);
  }

  addExcecao() {
    const funcionario = this.selectedFuncionario();
    if (funcionario && this.novaExcecao.data) {
      const excecao: Excecao = {
        id: Date.now().toString(),
        data: this.novaExcecao.data,
        tipo: this.novaExcecao.tipo,
        inicio: this.novaExcecao.inicio,
        fim: this.novaExcecao.fim,
        motivo: this.novaExcecao.motivo
      };
      funcionario.excecoes.push(excecao);
      this.closeExcecaoModal();
    }
  }

  removeExcecao(excecaoId: string) {
    const funcionario = this.selectedFuncionario();
    if (funcionario) {
      funcionario.excecoes = funcionario.excecoes.filter(e => e.id !== excecaoId);
    }
  }

  deleteFuncionario(funcionario: Funcionario) {
    if (confirm(`Tem certeza que deseja excluir o funcionário ${funcionario.nome}?`)) {
      this._funcionarios = this._funcionarios.filter(f => f.id !== funcionario.id);
    }
  }

  getTotalFuncionarios(): number {
    return this.funcionarios.length;
  }

  getFuncionariosAtivos(): number {
    return this.funcionarios.filter(f => f.status === 'ativo').length;
  }

  getFuncionariosInativos(): number {
    return this.funcionarios.filter(f => f.status === 'inativo').length;
  }

  getStatusClass(status: string): string {
    return status === 'ativo' ? 'status-ativo' : 'status-inativo';
  }

  getStatusLabel(status: string): string {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.novoFuncionario.foto = undefined;
  }

  logout() {
    this.accountService.logout();
    this.router.navigate(['/']);
  }
}

