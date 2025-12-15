import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { ActivationBannerComponent } from '../../components/activation-banner/activation-banner.component';

interface RedeSocial {
  nome: string;
  url: string;
  icone: string;
}

interface HorarioGeral {
  dia: string;
  ativo: boolean;
  inicio: string;
  fim: string;
}

interface PerfilEstabelecimento {
  nome: string;
  foto?: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  formasPagamento: string[];
  comodidades: string[];
  horarios: HorarioGeral[];
  redesSociais: RedeSocial[];
}

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ActivationBannerComponent],
  templateUrl: './perfil-page.component.html',
  styleUrls: ['./perfil-page.component.scss']
})
export class PerfilPageComponent {
  accountService = inject(AccountService);
  private router = inject(Router);
  showEditModal = signal(false);
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  sidebarOpen = signal(false);

  diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  
  formasPagamentoDisponiveis = [
    'PIX',
    'Dinheiro',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Transferência Bancária'
  ];

  comodidadesDisponiveis = [
    'Estacionamento',
    'Wi-Fi',
    'Ar Condicionado',
    'Acessibilidade',
    'Estacionamento para Motos',
    'Área de Descanso',
    'Bebedouro',
    'Banheiro',
    'Espaço Kids',
    'TV',
    'Música Ambiente',
    'Café/Chá Gratuito'
  ];

  perfil: PerfilEstabelecimento = {
    nome: 'Barbearia Estilo & Corte',
    foto: undefined,
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    telefone: '(11) 11111-1111',
    email: 'contato@estiloecorte.com.br',
    formasPagamento: ['PIX', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito'],
    comodidades: ['Estacionamento', 'Wi-Fi', 'Ar Condicionado', 'Acessibilidade'],
    horarios: [
      { dia: 'Segunda', ativo: true, inicio: '09:00', fim: '18:00' },
      { dia: 'Terça', ativo: true, inicio: '09:00', fim: '18:00' },
      { dia: 'Quarta', ativo: true, inicio: '09:00', fim: '18:00' },
      { dia: 'Quinta', ativo: true, inicio: '09:00', fim: '18:00' },
      { dia: 'Sexta', ativo: true, inicio: '09:00', fim: '18:00' },
      { dia: 'Sábado', ativo: true, inicio: '09:00', fim: '14:00' },
      { dia: 'Domingo', ativo: false, inicio: '', fim: '' }
    ],
    redesSociais: [
      { nome: 'Instagram', url: '@estiloecorte', icone: 'instagram' },
      { nome: 'Facebook', url: 'facebook.com/estiloecorte', icone: 'facebook' },
      { nome: 'WhatsApp', url: '(11) 11111-1111', icone: 'whatsapp' }
    ]
  };

  perfilTemp: PerfilEstabelecimento = JSON.parse(JSON.stringify(this.perfil));


  openEditModal() {
    this.perfilTemp = JSON.parse(JSON.stringify(this.perfil));
    this.previewUrl = this.perfil.foto || null;
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedFile = null;
    this.previewUrl = null;
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
    this.perfilTemp.foto = undefined;
  }

  toggleFormaPagamento(forma: string) {
    const index = this.perfilTemp.formasPagamento.indexOf(forma);
    if (index === -1) {
      this.perfilTemp.formasPagamento.push(forma);
    } else {
      this.perfilTemp.formasPagamento.splice(index, 1);
    }
  }

  isFormaPagamentoSelected(forma: string): boolean {
    return this.perfilTemp.formasPagamento.includes(forma);
  }

  toggleComodidade(comodidade: string) {
    const index = this.perfilTemp.comodidades.indexOf(comodidade);
    if (index === -1) {
      this.perfilTemp.comodidades.push(comodidade);
    } else {
      this.perfilTemp.comodidades.splice(index, 1);
    }
  }

  isComodidadeSelected(comodidade: string): boolean {
    return this.perfilTemp.comodidades.includes(comodidade);
  }

  addRedeSocial() {
    this.perfilTemp.redesSociais.push({
      nome: '',
      url: '',
      icone: 'link'
    });
  }

  removeRedeSocial(index: number) {
    this.perfilTemp.redesSociais.splice(index, 1);
  }

  savePerfil() {
    if (this.previewUrl && this.previewUrl !== this.perfil.foto) {
      this.perfilTemp.foto = this.previewUrl;
    }
    
    this.perfil = JSON.parse(JSON.stringify(this.perfilTemp));
    this.closeEditModal();
  }

  getRedesSociaisAtivas(): RedeSocial[] {
    return this.perfil.redesSociais.filter(r => r.nome && r.url);
  }

  getHorariosAtivos(): HorarioGeral[] {
    return this.perfil.horarios.filter(h => h.ativo);
  }

  hasHorariosFechados(): boolean {
    return this.perfil.horarios.some(h => !h.ativo);
  }

  getIconeRedeSocial(nome: string): string {
    const lower = nome.toLowerCase();
    if (lower.includes('instagram')) return 'instagram';
    if (lower.includes('facebook')) return 'facebook';
    if (lower.includes('whatsapp')) return 'whatsapp';
    if (lower.includes('twitter') || lower.includes('x')) return 'twitter';
    return 'link';
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

