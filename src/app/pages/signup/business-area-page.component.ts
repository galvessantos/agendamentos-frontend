import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-business-area-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './business-area-page.component.html',
  styleUrls: ['./business-area-page.component.scss']
})
export class BusinessAreaPageComponent {
  businessAreaForm: FormGroup;
  businessArea = signal<string>('');

  businessAreas = ['Barbearia', 'Manicure/Pedicure', 'Salão de Beleza', 'SPA/Estética', 'Massagem', 'Academia', 'Clínica Médica', 'Clínica Odontológica', 'Clínica Veterinária', 'Outro'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: AccountService
  ) {
    this.businessAreaForm = this.fb.group({
      businessArea: ['', [Validators.required]]
    });
  }

  setBusinessArea(area: string) {
    this.businessArea.set(area);
    this.businessAreaForm.patchValue({ businessArea: area });
  }

  onSubmit() {
    if (this.businessAreaForm.valid) {
      // Aqui você salvaria a área de atuação junto com os outros dados
      console.log('Business area selected:', this.businessAreaForm.value);
      
      // Garantir que a conta continua como 'inactive'
      this.accountService.setAccountStatus('inactive');
      this.accountService.setSelectedPlan(null);
      
      // Redirecionar para página de configurações
      this.router.navigate(['/cadastro/configuracoes']);
    } else {
      this.businessAreaForm.markAllAsTouched();
    }
  }
}

