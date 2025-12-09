import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quick-setup-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './quick-setup-page.component.html',
  styleUrls: ['./quick-setup-page.component.scss']
})
export class QuickSetupPageComponent {
  selectedDays = signal<string[]>([]);
  selectedServices = signal<string[]>([]);
  selectedContactMethods = signal<string[]>([]);
  showServiceInput = signal(false);
  
  newServiceInput = '';
  startHour = 9;
  startMinute = 0;
  endHour = 18;
  endMinute = 0;

  days = [
    { value: 'segunda', label: 'Segunda' },
    { value: 'terca', label: 'Terça' },
    { value: 'quarta', label: 'Quarta' },
    { value: 'quinta', label: 'Quinta' },
    { value: 'sexta', label: 'Sexta' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  contactMethods = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
    { value: 'telefone', label: 'Telefone' }
  ];

  hours = Array.from({ length: 24 }, (_, i) => i);
  minutes = [0, 15, 30, 45];

  constructor(private router: Router) {}

  toggleDay(day: string) {
    const current = this.selectedDays();
    if (current.includes(day)) {
      this.selectedDays.set(current.filter(d => d !== day));
    } else {
      this.selectedDays.set([...current, day]);
    }
  }

  addService() {
    this.showServiceInput.set(true);
  }

  saveService() {
    const service = this.newServiceInput.trim();
    if (service && !this.selectedServices().includes(service)) {
      this.selectedServices.set([...this.selectedServices(), service]);
      this.newServiceInput = '';
      this.showServiceInput.set(false);
    }
  }

  cancelServiceInput() {
    this.newServiceInput = '';
    this.showServiceInput.set(false);
  }

  removeService(service: string) {
    this.selectedServices.set(this.selectedServices().filter(s => s !== service));
  }

  toggleContactMethod(method: string) {
    const current = this.selectedContactMethods();
    if (current.includes(method)) {
      this.selectedContactMethods.set(current.filter(m => m !== method));
    } else {
      // Limitar a 2 seleções
      if (current.length < 2) {
        this.selectedContactMethods.set([...current, method]);
      }
    }
  }

  canSelectMore(): boolean {
    return this.selectedContactMethods().length < 2;
  }

  formatTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  onSubmit() {
    const data = {
      startTime: this.formatTime(this.startHour, this.startMinute),
      endTime: this.formatTime(this.endHour, this.endMinute),
      days: this.selectedDays(),
      services: this.selectedServices(),
      contactMethods: this.selectedContactMethods()
    };
    console.log('Quick setup data:', data);
    this.router.navigate(['/dashboard']);
  }

  skipSetup() {
    this.router.navigate(['/dashboard']);
  }
}
