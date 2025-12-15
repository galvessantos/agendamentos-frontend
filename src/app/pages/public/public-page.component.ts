import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EstablishmentService, PerfilEstabelecimento, Servico, Funcionario } from '../../services/establishment.service';

@Component({
  selector: 'app-public-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-page.component.html',
  styleUrls: ['./public-page.component.scss']
})
export class PublicPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private establishmentService = inject(EstablishmentService);

  establishmentSlug = signal<string>('');
  establishment = signal<PerfilEstabelecimento | null>(null);
  services = signal<Servico[]>([]);
  selectedService = signal<Servico | null>(null);
  availableProfessionals = signal<Funcionario[]>([]);
  selectedProfessional = signal<Funcionario | null>(null);
  selectedDate = signal<Date>(new Date());
  availableTimeSlots = signal<string[]>([]);
  
  currentStep = signal<'services' | 'professionals' | 'schedule'>('services');

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['establishmentSlug'];
      if (slug) {
        this.establishmentSlug.set(slug);
        this.loadEstablishmentData(slug);
      }
    });
  }

  loadEstablishmentData(slug: string) {
    const establishment = this.establishmentService.getEstablishmentBySlug(slug);
    if (!establishment) {
      // Redirecionar para 404 ou página de erro
      this.router.navigate(['/']);
      return;
    }

    this.establishment.set(establishment);
    this.services.set(this.establishmentService.getServicesBySlug(slug));
  }

  selectService(service: Servico) {
    this.selectedService.set(service);
    const professionals = this.establishmentService.getFuncionariosByService(
      this.establishmentSlug(),
      service.id
    );
    this.availableProfessionals.set(professionals);
    this.currentStep.set('professionals');
  }

  selectProfessional(professional: Funcionario) {
    this.selectedProfessional.set(professional);
    const slots = this.establishmentService.getAvailableTimeSlots(
      this.establishmentSlug(),
      professional.id,
      this.selectedDate()
    );
    this.availableTimeSlots.set(slots);
    this.currentStep.set('schedule');
  }

  selectDate(date: Date) {
    this.selectedDate.set(date);
    if (this.selectedProfessional()) {
      const slots = this.establishmentService.getAvailableTimeSlots(
        this.establishmentSlug(),
        this.selectedProfessional()!.id,
        date
      );
      this.availableTimeSlots.set(slots);
    }
  }

  goBack() {
    if (this.currentStep() === 'schedule') {
      this.currentStep.set('professionals');
      this.selectedProfessional.set(null);
    } else if (this.currentStep() === 'professionals') {
      this.currentStep.set('services');
      this.selectedService.set(null);
      this.availableProfessionals.set([]);
    }
  }


  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
  }

  getHorariosAtivos() {
    return this.establishment()?.horarios.filter(h => h.ativo) || [];
  }

  getNextDays(count: number): Date[] {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  }

  formatDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  }

  isDateSelected(date: Date): boolean {
    const selected = this.selectedDate();
    return date.toDateString() === selected.toDateString();
  }

  getSocialLink(url: string, icone: string): string {
    if (icone === 'whatsapp') {
      const phone = url.replace(/\D/g, '');
      return `https://wa.me/${phone}`;
    } else if (icone === 'instagram') {
      if (url.startsWith('@')) {
        return `https://instagram.com/${url.substring(1)}`;
      }
      return url.startsWith('http') ? url : `https://instagram.com/${url}`;
    } else if (icone === 'facebook') {
      return url.startsWith('http') ? url : `https://${url}`;
    }
    return url.startsWith('http') ? url : `https://${url}`;
  }
}

