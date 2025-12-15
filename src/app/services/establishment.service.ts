import { Injectable, signal } from '@angular/core';

export interface RedeSocial {
  nome: string;
  url: string;
  icone: string;
}

export interface HorarioGeral {
  dia: string;
  ativo: boolean;
  inicio: string;
  fim: string;
}

export interface PerfilEstabelecimento {
  nome: string;
  slug: string;
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

export interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  descricao?: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  foto?: string;
  servicosRealizados: string[];
  status: 'ativo' | 'inativo';
}

@Injectable({
  providedIn: 'root'
})
export class EstablishmentService {
  // Em produção, isso viria de uma API
  // Por enquanto, vamos usar dados mockados baseados no slug
  
  getEstablishmentBySlug(slug: string): PerfilEstabelecimento | null {
    // Mock: retorna dados baseados no slug
    // Em produção, isso faria uma chamada à API
    return {
      nome: this.formatSlugToName(slug),
      slug: slug,
      foto: undefined,
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      telefone: '(11) 11111-1111',
      email: 'contato@estabelecimento.com.br',
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
        { nome: 'Instagram', url: '@estabelecimento', icone: 'instagram' },
        { nome: 'Facebook', url: 'facebook.com/estabelecimento', icone: 'facebook' },
        { nome: 'WhatsApp', url: '(11) 11111-1111', icone: 'whatsapp' }
      ]
    };
  }

  getServicesBySlug(slug: string): Servico[] {
    // Mock: retorna serviços do estabelecimento
    return [
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
  }

  getFuncionariosBySlug(slug: string): Funcionario[] {
    // Mock: retorna funcionários do estabelecimento
    return [
      {
        id: '1',
        nome: 'João Silva',
        servicosRealizados: ['Corte de Cabelo', 'Barba'],
        status: 'ativo'
      },
      {
        id: '2',
        nome: 'Maria Santos',
        servicosRealizados: ['Manicure', 'Pedicure', 'Design de Sobrancelha'],
        status: 'ativo'
      },
      {
        id: '3',
        nome: 'Pedro Costa',
        servicosRealizados: ['Corte de Cabelo', 'Barba', 'Corte + Barba'],
        status: 'ativo'
      }
    ];
  }

  getFuncionariosByService(slug: string, serviceId: string): Funcionario[] {
    const funcionarios = this.getFuncionariosBySlug(slug);
    const service = this.getServicesBySlug(slug).find(s => s.id === serviceId);
    
    if (!service) return [];
    
    return funcionarios.filter(f => 
      f.status === 'ativo' && 
      f.servicosRealizados.includes(service.nome)
    );
  }

  getAvailableTimeSlots(slug: string, funcionarioId: string, date: Date): string[] {
    // Mock: retorna horários disponíveis
    // Em produção, isso calcularia baseado nos agendamentos existentes
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  }

  private formatSlugToName(slug: string): string {
    // Converte "barbeariadoseuze" para "Barbearia do Seu Zé"
    return slug
      .split(/(?=[A-Z])|(?<=[a-z])(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}

