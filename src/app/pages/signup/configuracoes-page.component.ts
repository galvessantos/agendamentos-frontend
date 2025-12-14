import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-configuracoes-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './configuracoes-page.component.html',
  styleUrls: ['./configuracoes-page.component.scss']
})
export class ConfiguracoesPageComponent {
  configuracoesForm: FormGroup;
  selectedDays = signal<string[]>([]);
  selectedServices = signal<string[]>([]);
  selectedContactMethods = signal<string[]>([]);
  showServiceInput = signal(false);
  
  // Valores dos métodos de contato
  contactValues: { [key: string]: string } = {
    whatsapp: '',
    email: '',
    telefone: ''
  };
  
  newServiceInput = '';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService
  ) {
    this.configuracoesForm = this.fb.group({
      establishmentName: ['', [Validators.required, Validators.minLength(3)]],
      workingDays: [[], [Validators.required, this.arrayNotEmptyValidator.bind(this)]],
      startHour: [9, [Validators.required]],
      startMinute: [0, [Validators.required]],
      endHour: [18, [Validators.required]],
      endMinute: [0, [Validators.required]],
      services: [[], [Validators.required, this.arrayNotEmptyValidator.bind(this)]],
      contactMethods: [[], [Validators.required, this.arrayNotEmptyValidator.bind(this)]],
      whatsapp: [''],
      email: [''],
      telefone: ['']
    });
  }

  arrayNotEmptyValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || !Array.isArray(control.value) || control.value.length === 0) {
      return { arrayEmpty: true };
    }
    return null;
  };

  toggleDay(day: string) {
    const current = this.selectedDays();
    if (current.includes(day)) {
      this.selectedDays.set(current.filter(d => d !== day));
    } else {
      this.selectedDays.set([...current, day]);
    }
    this.configuracoesForm.patchValue({ workingDays: this.selectedDays() });
    this.configuracoesForm.get('workingDays')?.markAsTouched();
  }

  addService() {
    this.showServiceInput.set(true);
  }

  saveService() {
    const service = this.newServiceInput.trim();
    if (service && !this.selectedServices().includes(service)) {
      this.selectedServices.set([...this.selectedServices(), service]);
      this.configuracoesForm.patchValue({ services: this.selectedServices() });
      this.configuracoesForm.get('services')?.markAsTouched();
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
    this.configuracoesForm.patchValue({ services: this.selectedServices() });
  }

  toggleContactMethod(method: string) {
    const current = this.selectedContactMethods();
    if (current.includes(method)) {
      this.selectedContactMethods.set(current.filter(m => m !== method));
      // Limpar o valor quando desmarcar
      this.contactValues[method] = '';
      this.configuracoesForm.patchValue({ [method]: '' });
      this.configuracoesForm.get(method)?.clearValidators();
      this.configuracoesForm.get(method)?.updateValueAndValidity();
    } else {
      this.selectedContactMethods.set([...current, method]);
      // Adicionar validação quando marcar
      if (method === 'email') {
        this.configuracoesForm.get(method)?.setValidators([Validators.required, Validators.email]);
      } else {
        this.configuracoesForm.get(method)?.setValidators([Validators.required, Validators.pattern(/^[0-9+\s()-]+$/)]);
      }
      this.configuracoesForm.get(method)?.updateValueAndValidity();
      // Inicializar o valor no formulário
      this.configuracoesForm.patchValue({ [method]: this.contactValues[method] || '' });
    }
    this.configuracoesForm.patchValue({ contactMethods: this.selectedContactMethods() });
    this.configuracoesForm.get('contactMethods')?.markAsTouched();
  }

  onContactValueChange(method: string, value: string) {
    this.contactValues[method] = value;
    this.configuracoesForm.patchValue({ [method]: value }, { emitEvent: false });
    this.configuracoesForm.get(method)?.markAsTouched();
    this.configuracoesForm.get(method)?.updateValueAndValidity();
  }

  isContactMethodSelected(method: string): boolean {
    return this.selectedContactMethods().includes(method);
  }

  getContactPlaceholder(method: string): string {
    switch(method) {
      case 'whatsapp':
        return 'Ex: (11) 99999-9999';
      case 'telefone':
        return 'Ex: (11) 3333-4444';
      case 'email':
        return 'Ex: contato@estabelecimento.com';
      default:
        return '';
    }
  }

  getContactLabel(method: string): string {
    switch(method) {
      case 'whatsapp':
        return 'Número do WhatsApp';
      case 'telefone':
        return 'Número de Telefone';
      case 'email':
        return 'Endereço de Email';
      default:
        return '';
    }
  }

  formatTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  getStartTime(): string {
    const hour = this.configuracoesForm.get('startHour')?.value ?? 9;
    const minute = this.configuracoesForm.get('startMinute')?.value ?? 0;
    return this.formatTime(hour, minute);
  }

  getEndTime(): string {
    const hour = this.configuracoesForm.get('endHour')?.value ?? 18;
    const minute = this.configuracoesForm.get('endMinute')?.value ?? 0;
    return this.formatTime(hour, minute);
  }

  onSubmit() {
    // Atualizar valores do formulário antes de validar
    this.configuracoesForm.patchValue({
      workingDays: this.selectedDays(),
      services: this.selectedServices(),
      contactMethods: this.selectedContactMethods(),
      whatsapp: this.contactValues['whatsapp'],
      email: this.contactValues['email'],
      telefone: this.contactValues['telefone']
    });

    // Validar que cada método selecionado tem seu valor preenchido
    const selectedMethods = this.selectedContactMethods();
    let hasContactErrors = false;
    
    selectedMethods.forEach(method => {
      const value = this.contactValues[method];
      if (!value || value.trim() === '') {
        this.configuracoesForm.get(method)?.setErrors({ required: true });
        hasContactErrors = true;
      }
    });

    if (this.configuracoesForm.valid && !hasContactErrors) {
      // Construir objeto de contatos com valores
      const contacts: { [key: string]: string } = {};
      selectedMethods.forEach(method => {
        contacts[method] = this.contactValues[method];
      });

      const data = {
        establishmentName: this.configuracoesForm.value.establishmentName,
        workingDays: this.selectedDays(),
        startTime: this.getStartTime(),
        endTime: this.getEndTime(),
        services: this.selectedServices(),
        contactMethods: contacts
      };
      
      console.log('Configurações salvas:', data);
      
      // Garantir que a conta continua como 'inactive'
      this.accountService.setAccountStatus('inactive');
      this.accountService.setSelectedPlan(null);
      
      // Redirecionar para dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.configuracoesForm.markAllAsTouched();
    }
  }
}

