import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

interface Testimonial {
  text: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent implements OnInit, OnDestroy {
  signupForm: FormGroup;
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordStrength = signal<'weak' | 'medium' | 'strong' | null>(null);
  currentTestimonialIndex = signal(0);
  private intervalId: any;

  testimonials: Testimonial[] = [
    {
      text: 'Como profissional, encontrar os clientes certos pode ser desafiador, mas o AgendaAí tornou isso simples. Adoro as recomendações personalizadas e a capacidade de gerenciar meus agendamentos de forma eficiente.',
      name: 'Maria Silva',
      role: 'Esteticista'
    },
    {
      text: 'O AgendaAí transformou completamente minha barbearia. Agora consigo gerenciar todos os agendamentos em um só lugar e meus clientes adoram a facilidade de marcar horários online.',
      name: 'João Santos',
      role: 'Barbeiro'
    },
    {
      text: 'Desde que comecei a usar o AgendaAí, minhas faltas diminuíram drasticamente. As notificações automáticas são um diferencial e meus clientes sempre confirmam os agendamentos.',
      name: 'Ana Costa',
      role: 'Salão de Beleza'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), this.passwordValidator.bind(this)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator.bind(this) });
  }

  passwordValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValidLength = value.length >= 8 && value.length <= 20;

    if (!hasUpperCase || !hasLowerCase || !hasNumeric || !hasSpecialChar || !isValidLength) {
      return { passwordStrength: true };
    }

    return null;
  };

  passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  };

  get password() {
    return this.signupForm.get('password');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(value => !value);
  }


  checkPasswordStrength() {
    const password = this.password?.value || '';
    if (!password) {
      this.passwordStrength.set(null);
      return;
    }

    let strength = 0;
    if (password.length >= 8 && password.length <= 20) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) {
      this.passwordStrength.set('weak');
    } else if (strength <= 4) {
      this.passwordStrength.set('medium');
    } else {
      this.passwordStrength.set('strong');
    }
  }

  getPasswordStrengthText(): string {
    const strength = this.passwordStrength();
    switch (strength) {
      case 'weak':
        return 'Senha fraca';
      case 'medium':
        return 'Senha média';
      case 'strong':
        return 'Senha forte';
      default:
        return '';
    }
  }

  getPasswordStrengthColor(): string {
    const strength = this.passwordStrength();
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  }

  getPasswordRequirements(): { met: boolean; text: string }[] {
    const password = this.password?.value || '';
    return [
      {
        met: /[A-Z]/.test(password),
        text: '1 letra maiúscula (A-Z)'
      },
      {
        met: /[a-z]/.test(password),
        text: '1 letra minúscula (a-z)'
      },
      {
        met: /[0-9]/.test(password),
        text: '1 número (0-9)'
      },
      {
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        text: '1 caractere especial (@, #, $, etc.)'
      },
      {
        met: password.length >= 8 && password.length <= 20,
        text: 'Tamanho entre 8 e 20 caracteres'
      }
    ];
  }

  onSubmit() {
    if (this.signupForm.valid) {
      // Salvar dados do formulário (pode usar um service ou localStorage)
      console.log('Form submitted:', this.signupForm.value);
      // Redirecionar para página de área de atuação
      this.router.navigate(['/cadastro/area-atuacao']);
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  goToLogin() {
    // this.router.navigate(['/login']);
  }

  ngOnInit() {
    // Rotaciona os depoimentos a cada 5 segundos
    this.intervalId = setInterval(() => {
      const current = this.currentTestimonialIndex();
      const next = (current + 1) % this.testimonials.length;
      this.currentTestimonialIndex.set(next);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  get currentTestimonial(): Testimonial {
    return this.testimonials[this.currentTestimonialIndex()];
  }

  goToTestimonial(index: number) {
    this.currentTestimonialIndex.set(index);
    // Reinicia o intervalo quando o usuário clica manualmente
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      const current = this.currentTestimonialIndex();
      const next = (current + 1) % this.testimonials.length;
      this.currentTestimonialIndex.set(next);
    }, 5000);
  }
}

